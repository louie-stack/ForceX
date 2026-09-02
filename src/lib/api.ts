/**
 * Server-side access to the ForceX public data API.
 *
 * The public endpoints on forcex.com do not send Access-Control-Allow-Origin,
 * so the browser never talks to them directly. Route handlers under
 * /api/public/litecoin/* proxy them, and server components call these helpers.
 */
export const FX_ORIGIN = process.env.FX_API_ORIGIN ?? "https://forcex.com";
export const FX_APP_ORIGIN = process.env.NEXT_PUBLIC_FX_APP_ORIGIN ?? "https://forcex.com";
export const FX_AUTH_ORIGIN = process.env.NEXT_PUBLIC_FX_AUTH_ORIGIN ?? "https://auth.forcex.com";

export const PUBLIC_ENDPOINTS = [
  "stats/rolling-24h/activity",
  "stats/rolling-24h/addresses",
  "stats/rolling-24h/fees",
  "stats/rolling-24h/mweb",
  "quality/status",
] as const;

export type PublicEndpoint = (typeof PUBLIC_ENDPOINTS)[number];

export async function fetchPublic<T = unknown>(path: PublicEndpoint, revalidate = 30): Promise<T | null> {
  try {
    const res = await fetch(`${FX_ORIGIN}/api/public/litecoin/${path}`, {
      headers: { accept: "application/json", "user-agent": "ForceX-Web/next" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json && json.data ? json.data : json) as T;
  } catch {
    return null;
  }
}

export interface QualityStatus {
  state: "validated" | "warning" | "pending" | string;
  tip_height: number;
  controls: { total: number; passing: number; warning: number; pending: number };
  controls_by_cadence: {
    per_block: { total: number; passing: number; warning: number; pending: number };
    periodic_external: { total: number; passing: number; warning: number; pending: number };
  };
  node_cross_check: {
    status: string;
    last_confirmed_block: number;
    last_confirmed_at: string;
    cadence_blocks: number;
    next_due_in_blocks: number;
  };
  validated_at: string;
}

export interface NetworkSummary {
  asOf: { height: number | null; time: string | null };
  tx: { count: number | null; changePct: number | null; tps: number | null; blocks: number | null };
  blockSize: { bytes: number | null; changePct: number | null };
  addresses: { active: number | null; changePct: number | null; sending: number | null; receiving: number | null };
  fees: { avgLitoshi: number | null; avgChangePct: number | null; medianLitoshi: number | null };
  mweb: { peginLtc: number | null; pegoutLtc: number | null; netLtc: number | null; priorNetLtc: number | null };
  quality: QualityStatus | null;
  fetchedAt: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getNetworkSummary(): Promise<NetworkSummary> {
  const [activity, addresses, fees, mweb, quality] = await Promise.all([
    fetchPublic<any>("stats/rolling-24h/activity"),
    fetchPublic<any>("stats/rolling-24h/addresses"),
    fetchPublic<any>("stats/rolling-24h/fees"),
    fetchPublic<any>("stats/rolling-24h/mweb"),
    fetchPublic<QualityStatus>("quality/status", 60),
  ]);
  const num = (v: unknown) => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
  return {
    asOf: {
      height: num(activity?.as_of?.block_height),
      time: activity?.as_of?.block_time ?? null,
    },
    tx: {
      count: num(activity?.transactions?.count),
      changePct: num(activity?.transactions?.change_pct),
      tps: num(activity?.transactions_per_second?.value),
      blocks: num(activity?.blocks?.count),
    },
    blockSize: {
      bytes: num(activity?.avg_block_size_bytes?.value),
      changePct: num(activity?.avg_block_size_bytes?.change_pct),
    },
    addresses: {
      active: num(addresses?.active?.count),
      changePct: num(addresses?.active?.change_pct),
      sending: num(addresses?.sending?.count),
      receiving: num(addresses?.receiving?.count),
    },
    fees: {
      avgLitoshi: num(fees?.avg_fee_value?.litoshi),
      avgChangePct: num(fees?.avg_fee_value?.change_pct),
      medianLitoshi: num(fees?.median_fee_value?.litoshi),
    },
    mweb: {
      peginLtc: num(mweb?.pegin_value?.ltc),
      pegoutLtc: num(mweb?.pegout_value?.ltc),
      netLtc: num(mweb?.net_flow_value?.ltc),
      priorNetLtc: num(mweb?.net_flow_value?.prior_ltc),
    },
    quality: quality ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

export interface ChainHome {
  height: number | null;
  totalAddresses: number | null;
  totalTransactions: number | null;
  supply: {
    scheduledEmitted: number | null;
    scheduledMax: number | null;
    circulating: number | null;
    circulatingMax: number | null;
    nextHalvingBlocks: number | null;
    dailyIssuance: number | null;
  };
  mwebPool: { ltc: number | null; supplyLtc: number | null; pct: number | null };
  txDaily: { date: string; value: number }[];
  mwebDaily: { date: string; value: number }[];
  fetchedAt: string;
}

/**
 * The chain overview (supply, totals, 30d series) is server-rendered on the
 * live explorer rather than exposed by the public API. This reads those
 * values out of the rendered page so the overview here stays live. Every
 * field is optional and the caller renders gracefully when parsing fails.
 */
export async function getChainHome(): Promise<ChainHome | null> {
  try {
    const res = await fetch(`${FX_ORIGIN}/xplorer/litecoin`, {
      headers: { "user-agent": "ForceX-Web/next" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const n = (s?: string | null) => (s ? Number(s.replace(/,/g, "")) : null);
    const metric = (key: string) => {
      const m = html.match(new RegExp(`data-info="${key}"[^>]*>[^<]*</span>\\s*<p[^>]*>([\\d,]+)</p>`));
      return n(m?.[1]);
    };
    const supplyPairs = [...html.matchAll(/([\d,]+)\s*\/\s*([\d,]+)\s*LTC/g)].map((m) => [n(m[1]), n(m[2])]);
    const halving = html.match(/~([\d,]+)\s*blocks/);
    const issuance = html.match(/~([\d,]+)\s*LTC\s*\/\s*day/);
    const pool = html.match(/([\d.]+)%\s*in MWEB pool[\s\S]{0,400}?([\d.]+)\s*\/\s*([\d.]+)\s*LTC/);
    const series = (name: string) => {
      const m = html.match(new RegExp(`var ${name}\\s*=\\s*(\\[[^;]*\\]);`));
      if (!m) return [];
      try {
        return JSON.parse(m[1]) as { date: string; value: number }[];
      } catch {
        return [];
      }
    };
    return {
      height: metric("block_height"),
      totalAddresses: metric("total_addresses"),
      totalTransactions: metric("total_transactions"),
      supply: {
        scheduledEmitted: supplyPairs[0]?.[0] ?? null,
        scheduledMax: supplyPairs[0]?.[1] ?? null,
        circulating: supplyPairs[1]?.[0] ?? null,
        circulatingMax: supplyPairs[1]?.[1] ?? null,
        nextHalvingBlocks: n(halving?.[1]),
        dailyIssuance: n(issuance?.[1]),
      },
      mwebPool: {
        pct: pool ? Number(pool[1]) : null,
        ltc: pool ? Number(pool[2]) : null,
        supplyLtc: pool ? Number(pool[3]) : null,
      },
      txDaily: series("txData"),
      mwebDaily: series("mwebData"),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
