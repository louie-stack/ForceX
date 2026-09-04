import type { BandSnapshot, Bucket, Candle, ChartData, ChartQuery, DashboardStats, Grain, QualitySummary, SeriesPoint, View } from "./types";

/**
 * Sample data for every Xamine surface. Deterministic (seeded per chart and
 * per date) so a page looks the same on every render, shaped to the ranges
 * seen in the live application. Always labelled "Sample data" in the UI.
 */
const DAY = 86_400_000;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const dayIndex = (d: string) => Math.floor(new Date(d + "T00:00:00Z").getTime() / DAY);

/** Every day in [start, end). */
export function days(start: string, end: string): string[] {
  const out: string[] = [];
  for (let t = new Date(start + "T00:00:00Z").getTime(); t < new Date(end + "T00:00:00Z").getTime(); t += DAY) out.push(iso(t));
  return out;
}

/** A value for a given day that is stable across calls: slow waves plus seeded noise. */
function daily(key: string, date: string, base: number, amp: number, opts: { trend?: number; weekly?: boolean } = {}) {
  const i = dayIndex(date);
  const r = rng(hash(key) ^ (i * 2654435761));
  const wave = Math.sin(i / 6.1) * 0.45 + Math.sin(i / 17.3) * 0.35 + Math.sin(i / 41) * 0.2;
  const weekly = opts.weekly ? (new Date(date + "T00:00:00Z").getUTCDay() % 6 === 0 ? -0.35 : 0.08) : 0;
  const trend = (opts.trend ?? 0) * (i - 20_670);
  return base + trend + amp * (wave + weekly) + amp * (r() - 0.5) * 0.9;
}

function bucketKey(date: string, grain: Grain) {
  const d = new Date(date + "T00:00:00Z");
  if (grain === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
  if (grain === "week") {
    const dow = (d.getUTCDay() + 6) % 7;
    return iso(d.getTime() - dow * DAY);
  }
  return date;
}

/** Aggregate daily points into the requested grain. */
export function aggregate(points: SeriesPoint[], grain: Grain, how: "sum" | "mean" | "last"): SeriesPoint[] {
  if (grain === "day") return points;
  const map = new Map<string, number[]>();
  for (const p of points) {
    if (p.value == null) continue;
    const k = bucketKey(p.date, grain);
    map.set(k, [...(map.get(k) ?? []), p.value]);
  }
  return [...map.entries()].map(([date, vs]) => ({
    date,
    value: how === "sum" ? vs.reduce((a, b) => a + b, 0) : how === "mean" ? vs.reduce((a, b) => a + b, 0) / vs.length : vs[vs.length - 1],
  }));
}

export function applyView(points: SeriesPoint[], view: View): SeriesPoint[] {
  if (view !== "cumulative") return points;
  let acc = 0;
  return points.map((p) => ({ date: p.date, value: p.value == null ? null : (acc += p.value) }));
}

const series = (key: string, q: ChartQuery, base: number, amp: number, how: "sum" | "mean" | "last", opts?: { trend?: number; weekly?: boolean; round?: boolean }) => {
  const pts = days(q.start, q.end).map((date) => {
    const v = daily(key, date, base, amp, opts);
    return { date, value: opts?.round === false ? v : Math.round(v) };
  });
  return aggregate(pts, q.grain, how);
};

const LTC = 1e8;

export function sampleChart(slug: string, q: ChartQuery): ChartData {
  switch (slug) {
    case "spot-price-ohlc": {
      const all = days(q.start, q.end);
      let price = 98 + daily("ltcusd-anchor", q.start, 0, 12);
      const candles: Candle[] = [];
      for (const date of all) {
        const r = rng(hash("ohlc") ^ dayIndex(date));
        const open = price;
        const drift = (r() - 0.48) * 0.06 * open;
        const close = Math.max(20, open + drift);
        const high = Math.max(open, close) * (1 + r() * 0.025);
        const low = Math.min(open, close) * (1 - r() * 0.025);
        candles.push({ date, open, high, low, close, volume: Math.round(420_000 + r() * 600_000) });
        price = close;
      }
      if (q.grain === "week") {
        const map = new Map<string, Candle[]>();
        for (const c of candles) map.set(bucketKey(c.date, "week"), [...(map.get(bucketKey(c.date, "week")) ?? []), c]);
        return {
          kind: "candles",
          unit: "usd",
          candles: [...map.entries()].map(([date, cs]) => ({
            date,
            open: cs[0].open,
            close: cs[cs.length - 1].close,
            high: Math.max(...cs.map((c) => c.high)),
            low: Math.min(...cs.map((c) => c.low)),
            volume: cs.reduce((a, c) => a + (c.volume ?? 0), 0),
          })),
        };
      }
      return { kind: "candles", unit: "usd", candles };
    }
    case "adjusted-economic-volume":
      return {
        kind: "timeseries",
        series: [
          { key: "gross", label: "Gross", role: "bar", unit: "ltc", points: series("gross-volume", q, 43_000_000 * LTC, 9_000_000 * LTC, "sum", { weekly: true }) },
          { key: "payment", label: "Payment", role: "line", unit: "ltc", points: series("adjusted-volume", q, 19_000_000 * LTC, 5_000_000 * LTC, "sum", { weekly: true }) },
        ],
      };
    case "transactions":
      return {
        kind: "timeseries",
        series: [{ key: "tx", label: "Transactions", role: "bar", unit: "count", points: applyView(series("tx-count", q, 172_000, 14_000, "sum", { weekly: true }), q.view) }],
      };
    case "network-hashrate":
      return {
        kind: "timeseries",
        series: [{ key: "hashrate", label: "Hashrate", role: "area", unit: "hashrate", points: series("hashrate", q, 2.35e15, 0.28e15, "mean", { trend: 6e11, round: false }) }],
      };
    case "active-addresses":
      return {
        kind: "timeseries",
        series: [
          { key: "active", label: "Active addresses", role: "bar", unit: "count", points: series("active-addr", q, 268_000, 32_000, "mean", { weekly: true }) },
          { key: "new", label: "New addresses", role: "line", unit: "count", points: series("new-addr", q, 128_000, 22_000, "mean", { weekly: true }) },
        ],
      };
    case "total-addresses": {
      const anchor = 417_883_768;
      const end = dayIndex(q.end);
      const pts = days(q.start, q.end).map((date) => {
        const i = dayIndex(date);
        let v = anchor;
        for (let k = i; k < end; k++) v -= Math.round(daily("new-addr", iso(k * DAY), 128_000, 22_000, { weekly: true }));
        return { date, value: v };
      });
      return { kind: "timeseries", series: [{ key: "total", label: "Total addresses", role: "area", unit: "count", points: aggregate(pts, q.grain, "last") }] };
    }
    case "mweb-balance": {
      const pegin = series("pegin", q, 6_200 * LTC, 3_800 * LTC, "sum");
      const pegout = series("pegout", q, 5_600 * LTC, 3_400 * LTC, "sum");
      let bal = 521_400 * LTC - pegin.reduce((a, p) => a + (p.value ?? 0), 0) + pegout.reduce((a, p) => a + (p.value ?? 0), 0);
      const balance = pegin.map((p, i) => {
        bal += (p.value ?? 0) - (pegout[i].value ?? 0);
        return { date: p.date, value: bal };
      });
      return {
        kind: "timeseries",
        series: [
          { key: "net", label: "Net flow", role: "bar", unit: "ltc", axis: "right", points: pegin.map((p, i) => ({ date: p.date, value: (p.value ?? 0) - (pegout[i].value ?? 0) })) },
          { key: "balance", label: "Pool balance", role: "area", unit: "ltc", points: balance },
        ],
      };
    }
    case "transaction-volume-distribution":
    case "adjusted-transaction-volume-distribution": {
      const edges = ["0", "0.001", "0.005", "0.01", "0.05", "0.1", "0.5", "1", "5", "10", "50", "100", "500", "1,000"];
      const shape =
        slug === "adjusted-transaction-volume-distribution"
          ? [0.11, 0.19, 0.14, 0.51, 0.31, 0.91, 0.44, 1.24, 0.27, 0.46, 0.15, 0.17, 0.06, 0.08]
          : [0.34, 0.42, 0.28, 0.66, 0.47, 0.98, 0.62, 1.08, 0.38, 0.52, 0.22, 0.24, 0.1, 0.12];
      const r = rng(hash(slug) ^ dayIndex(q.end));
      const counts = shape.map((s) => Math.round(s * 1_000_000 * (0.94 + r() * 0.12)));
      const total = counts.reduce((a, b) => a + b, 0);
      const buckets: Bucket[] = edges.map((lo, i) => ({
        label: lo,
        sublabel: i === edges.length - 1 ? "+" : edges[i + 1],
        count: counts[i],
        share: counts[i] / total,
      }));
      return { kind: "distribution", unit: "count", buckets, snapshotDate: iso(new Date(q.end + "T00:00:00Z").getTime() - DAY) };
    }
    case "active-address-balance-distribution": {
      const edges = ["0", "0.001", "0.01", "0.1", "1", "10", "100", "1,000", "10,000", "100,000"];
      const shape = [0.92, 1.36, 1.54, 1.21, 0.78, 0.41, 0.17, 0.05, 0.012, 0.003];
      const r = rng(hash(slug) ^ dayIndex(q.end));
      const counts = shape.map((s) => Math.round(s * 1_000_000 * (0.95 + r() * 0.1)));
      const total = counts.reduce((a, b) => a + b, 0);
      const buckets: Bucket[] = edges.map((lo, i) => ({
        label: lo,
        sublabel: i === edges.length - 1 ? "+" : edges[i + 1],
        count: counts[i],
        share: counts[i] / total,
      }));
      return { kind: "distribution", unit: "count", buckets, snapshotDate: `${new Date(q.end + "T00:00:00Z").getUTCFullYear() - 1}-12-31` };
    }
    case "supply-age-distribution": {
      const labels = ["< 1d", "1d–1w", "1w–1m", "1–3m", "3–6m", "6–12m", "1–2y", "2–3y", "3–5y", "5–7y", "7y+"];
      const base = [0.012, 0.028, 0.05, 0.072, 0.064, 0.094, 0.128, 0.11, 0.156, 0.126, 0.16];
      const all = days(q.start, q.end);
      const dates = q.grain === "day" ? all : [...new Set(all.map((d) => bucketKey(d, q.grain)))];
      const snapshots: BandSnapshot[] = dates.map((date) => {
        const i = dayIndex(date);
        const raw = base.map((b, k) => b * (1 + 0.18 * Math.sin(i / (9 + k * 3) + k)));
        const sum = raw.reduce((a, b) => a + b, 0);
        return { date, bands: raw.map((v) => v / sum) };
      });
      return { kind: "bands", labels, snapshots };
    }
    default:
      return { kind: "timeseries", series: [] };
  }
}

export const sampleStats = (): DashboardStats => ({ allTimeBlocks: 3_171_894, allTimeAddresses: 417_883_768, allTimeTransactions: 413_163_736 });

export const sampleQuality = (): QualitySummary => ({
  state: "validated",
  validatedThrough: 3_171_892,
  controlsTotal: 14,
  controlsPassing: 14,
  perBlock: 13,
  periodic: 1,
  crossCheckHeight: 3_171_001,
  crossCheckNextIn: 108,
  groups: [
    { label: "Monetary integrity", ok: true },
    { label: "Address integrity", ok: true },
    { label: "Block & write integrity", ok: true },
  ],
});
