import { FX_ORIGIN } from "@/lib/api";
import type { ChartData, ChartQuery, DashboardStats, Provenance, QualitySummary } from "./types";

/**
 * Live adapter for the ForceX Xtract API (OpenAPI 0.2.0). Dormant until
 * `FX_API_KEY` is set; every function returns null when the key is missing
 * or a request fails, and the provider falls back to the sample fixtures.
 *
 * Base: {FX_ORIGIN}/xtract/v1/litecoin. Auth: `Authorization: Bearer <key>`.
 * Ranges are half-open [start, end). Atomic units are litoshi (1e8 per LTC).
 */
const BASE = `${FX_ORIGIN}/xtract/v1/litecoin`;

export const hasKey = () => Boolean(process.env.FX_API_KEY);

/* eslint-disable @typescript-eslint/no-explicit-any */
async function get<T = any>(path: string, params: Record<string, string | number | boolean | undefined>, revalidate = 900): Promise<{ data: T; meta: any } | null> {
  const key = process.env.FX_API_KEY;
  if (!key) return null;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  try {
    const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`, {
      headers: { accept: "application/json", authorization: `Bearer ${key}`, "user-agent": "ForceX-Web/next" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.error) return null;
    return { data: json.data, meta: json.meta ?? {} };
  } catch {
    return null;
  }
}

export function provenance(meta: any): Provenance {
  return {
    source: "live",
    validatedHeight: meta?.validation?.validated_height ?? null,
    validatedAt: meta?.validation?.validated_at ?? null,
    datasetVersion: meta?.dataset_version ?? null,
    methodologyVersion: meta?.methodology_version ?? null,
  };
}

const range = (q: ChartQuery) => ({ start: q.start, end: q.end, grain: q.grain });
const pts = (rows: any[], field: string) => rows.map((r) => ({ date: String(r.date), value: r[field] == null ? null : Number(r[field]) }));
const cumulative = (points: { date: string; value: number | null }[]) => {
  let acc = 0;
  return points.map((p) => ({ date: p.date, value: p.value == null ? null : (acc += p.value) }));
};

/** Fetch one chart from the live API. Returns null when unavailable. */
export async function liveChart(slug: string, q: ChartQuery): Promise<{ data: ChartData; provenance: Provenance } | null> {
  switch (slug) {
    case "spot-price-ohlc": {
      const r = await get("/charts/market", { ...range(q), quote: "usd", include_current: true });
      if (!r) return null;
      const candles = (r.data?.candles ?? []).map((c: any) => ({
        date: String(c.date),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: c.volume == null ? null : Number(c.volume),
      }));
      return { data: { kind: "candles", unit: "usd", candles }, provenance: provenance(r.meta) };
    }
    case "adjusted-economic-volume": {
      const r = await get("/charts/economic-flow", { ...range(q), unit: "ltc" });
      if (!r) return null;
      const rows: any[] = r.data ?? [];
      return {
        data: {
          kind: "timeseries",
          series: [
            { key: "gross", label: "Gross", role: "bar", unit: "ltc", points: pts(rows, "total_volume_atomic_units") },
            { key: "payment", label: "Payment", role: "line", unit: "ltc", points: pts(rows, "adjusted_volume_atomic_units") },
          ],
        },
        provenance: provenance(r.meta),
      };
    }
    case "transactions": {
      const r = await get("/charts/network", { ...range(q), metrics: "tx_count" });
      if (!r) return null;
      const p = pts(r.data ?? [], "tx_count");
      return {
        data: { kind: "timeseries", series: [{ key: "tx", label: "Transactions", role: "bar", unit: "count", points: q.view === "cumulative" ? cumulative(p) : p }] },
        provenance: provenance(r.meta),
      };
    }
    case "network-hashrate": {
      const r = await get("/charts/network", { ...range(q), metrics: "avg_hashrate_hashes_per_second" });
      if (!r) return null;
      return {
        data: { kind: "timeseries", series: [{ key: "hashrate", label: "Hashrate", role: "area", unit: "hashrate", points: pts(r.data ?? [], "avg_hashrate_hashes_per_second") }] },
        provenance: provenance(r.meta),
      };
    }
    case "active-addresses": {
      const r = await get("/charts/network", { start: q.start, end: q.end, grain: "day", metrics: "active_addresses,new_addresses" });
      if (!r) return null;
      return {
        data: {
          kind: "timeseries",
          series: [
            { key: "active", label: "Active addresses", role: "bar", unit: "count", points: pts(r.data ?? [], "active_addresses") },
            { key: "new", label: "New addresses", role: "line", unit: "count", points: pts(r.data ?? [], "new_addresses") },
          ],
        },
        provenance: provenance(r.meta),
      };
    }
    case "total-addresses": {
      // Cumulative total at bucket close: the all-time total from chain/home walked back by new addresses per bucket.
      const [home, net] = await Promise.all([get("/chain/home", {}, 300), get("/charts/network", { ...range(q), metrics: "new_addresses" })]);
      if (!home || !net) return null;
      const total = Number(home.data?.totals?.addresses ?? home.data?.total_addresses ?? NaN);
      const rows: any[] = net.data ?? [];
      if (!Number.isFinite(total)) return null;
      let v = total;
      const back = [...rows].reverse().map((row) => {
        const point = { date: String(row.date), value: v };
        v -= Number(row.new_addresses ?? 0);
        return point;
      });
      return {
        data: { kind: "timeseries", series: [{ key: "total", label: "Total addresses", role: "area", unit: "count", points: back.reverse() }] },
        provenance: provenance(net.meta),
      };
    }
    case "mweb-balance": {
      const r = await get("/charts/mweb", { ...range(q), metrics: "pegin_atomic_units,pegout_atomic_units,cumulative_balance_atomic_units" });
      if (!r) return null;
      const rows: any[] = r.data ?? [];
      return {
        data: {
          kind: "timeseries",
          series: [
            { key: "net", label: "Net flow", role: "bar", unit: "ltc", axis: "right", points: rows.map((x) => ({ date: String(x.date), value: x.net_flow_atomic_units ?? Number(x.pegin_atomic_units ?? 0) - Number(x.pegout_atomic_units ?? 0) })) },
            { key: "balance", label: "Pool balance", role: "area", unit: "ltc", points: pts(rows, "cumulative_balance_atomic_units") },
          ],
        },
        provenance: provenance(r.meta),
      };
    }
    case "transaction-volume-distribution":
    case "adjusted-transaction-volume-distribution":
    case "active-address-balance-distribution": {
      const type = slug === "transaction-volume-distribution" ? "tx_volume" : slug === "adjusted-transaction-volume-distribution" ? "adjusted_tx_volume" : "balance";
      const r = await get("/charts/distribution", { type, window: q.window ?? "year" });
      if (!r) return null;
      const buckets = (r.data?.buckets ?? [])
        .sort((a: any, b: any) => a.bucket_order - b.bucket_order)
        .map((b: any) => ({
          label: (Number(b.lower_atomic_units) / 1e8).toLocaleString("en-US", { maximumFractionDigits: 3 }),
          sublabel: b.upper_atomic_units == null ? "+" : (Number(b.upper_atomic_units) / 1e8).toLocaleString("en-US", { maximumFractionDigits: 3 }),
          count: Number(b.count),
          share: b.share == null ? null : Number(b.share),
        }));
      return { data: { kind: "distribution", unit: "count", buckets, snapshotDate: String(r.data?.snapshot?.snapshot_date ?? q.end) }, provenance: provenance(r.meta) };
    }
    case "supply-age-distribution": {
      const r = await get("/charts/supply-age-distribution", range(q));
      if (!r) return null;
      const snaps: any[] = r.data?.snapshots ?? [];
      const labels: string[] = snaps[0]?.bands?.map((b: any) => String(b.label ?? b.band ?? b.name)) ?? [];
      const snapshots = snaps.map((s) => {
        const vals = (s.bands ?? []).map((b: any) => Number(b.value_atomic_units ?? b.share ?? 0));
        const sum = vals.reduce((a: number, b: number) => a + b, 0) || 1;
        return { date: String(s.bucket_end ?? s.bucket_start), bands: vals.map((v: number) => v / sum) };
      });
      return { data: { kind: "bands", labels, snapshots }, provenance: provenance(r.meta) };
    }
    default:
      return null;
  }
}

export async function liveStats(): Promise<{ stats: DashboardStats; provenance: Provenance } | null> {
  const r = await get("/chain/home", {}, 300);
  if (!r) return null;
  const d = r.data ?? {};
  const num = (v: unknown) => (v == null || !Number.isFinite(Number(v)) ? null : Number(v));
  return {
    stats: {
      allTimeBlocks: num(d.tip?.height ?? d.height),
      allTimeAddresses: num(d.totals?.addresses ?? d.total_addresses),
      allTimeTransactions: num(d.totals?.transactions ?? d.total_transactions),
    },
    provenance: provenance(r.meta),
  };
}

export async function liveQuality(): Promise<QualitySummary | null> {
  const r = await get("/chain/validation", {}, 120);
  if (!r) return null;
  const d = r.data ?? {};
  const controls = d.controls ?? {};
  const state = d.state ?? d.status;
  return {
    state: state === "validated" || state === "warning" || state === "pending" ? state : "unknown",
    validatedThrough: d.tip_height ?? d.validated_height ?? null,
    controlsTotal: controls.total ?? null,
    controlsPassing: controls.passing ?? null,
    perBlock: d.controls_by_cadence?.per_block?.total ?? null,
    periodic: d.controls_by_cadence?.periodic_external?.total ?? null,
    crossCheckHeight: d.node_cross_check?.last_confirmed_block ?? null,
    crossCheckNextIn: d.node_cross_check?.next_due_in_blocks ?? null,
    groups: [
      { label: "Monetary integrity", ok: state === "validated" },
      { label: "Address integrity", ok: state === "validated" },
      { label: "Block & write integrity", ok: state === "validated" },
    ],
  };
}
