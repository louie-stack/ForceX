import { getNetworkSummary } from "@/lib/api";
import { bySlug } from "./catalog";
import { sampleChart, sampleQuality, sampleStats } from "./fixtures";
import type { ChartPayload, ChartQuery, DashboardPayload, Grain, Provenance, View } from "./types";
import { hasKey, liveChart, liveQuality, liveStats } from "./xtract";

/**
 * One door for every Xamine page. Uses the live Xtract adapter when an API
 * key is configured and the call succeeds; otherwise the sample fixtures,
 * flagged as such so the UI can say so.
 */
const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

const SAMPLE: Provenance = { source: "sample", validatedHeight: 3_171_892, validatedAt: null, datasetVersion: "sample", methodologyVersion: null };

/** Default range: the last 30 completed days, half-open, ending today. */
export function defaultRange(daysBack = 30): { start: string; end: string } {
  const today = Math.floor(Date.now() / DAY) * DAY;
  return { start: iso(today - daysBack * DAY), end: iso(today) };
}

const isDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/** Parse and clamp the page's search params into a query for the given chart. */
export function parseQuery(slug: string, sp: Record<string, string | string[] | undefined>): ChartQuery {
  const def = bySlug(slug);
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const grains = def?.grains ?? ["day"];
  const grain = (grains.includes(one("grain") as Grain) ? one("grain") : grains[0]) as Grain;
  const view = (one("view") === "cumulative" ? "cumulative" : "incremental") as View;
  const window = one("window") && /^[a-z0-9]{1,8}$/.test(one("window")!) ? one("window") : undefined;
  let { start, end } = defaultRange(grain === "month" ? 365 : grain === "week" ? 180 : 30);
  if (isDate(one("start")) && isDate(one("end")) && one("start")! < one("end")!) {
    start = one("start")!;
    end = one("end")!;
    // Guard the upper bound: at most 3 years.
    if (Date.parse(end) - Date.parse(start) > 3 * 365 * DAY) start = iso(Date.parse(end) - 3 * 365 * DAY);
  }
  return { grain, view, start, end, window };
}

export async function getChart(slug: string, q: ChartQuery): Promise<ChartPayload> {
  if (hasKey()) {
    const live = await liveChart(slug, q);
    if (live) return { data: live.data, query: q, provenance: live.provenance };
  }
  return { data: sampleChart(slug, q), query: q, provenance: SAMPLE };
}

export async function getDashboard(): Promise<DashboardPayload> {
  const featuredQuery: ChartQuery = { grain: "day", view: "incremental", ...defaultRange(30) };
  const featured = await getChart("adjusted-economic-volume", featuredQuery);
  if (hasKey()) {
    const [stats, quality] = await Promise.all([liveStats(), liveQuality()]);
    if (stats && quality) return { stats: stats.stats, quality, featured, provenance: stats.provenance };
  }
  // Without a key, the public summary endpoints still give a real validated height for the quality panel.
  const summary = await getNetworkSummary().catch(() => null);
  const q = summary?.quality;
  const quality = q
    ? {
        state: (q.state === "validated" || q.state === "warning" || q.state === "pending" ? q.state : "unknown") as "validated" | "warning" | "pending" | "unknown",
        validatedThrough: q.tip_height ?? null,
        controlsTotal: q.controls?.total ?? null,
        controlsPassing: q.controls?.passing ?? null,
        perBlock: q.controls_by_cadence?.per_block?.total ?? null,
        periodic: q.controls_by_cadence?.periodic_external?.total ?? null,
        crossCheckHeight: q.node_cross_check?.last_confirmed_block ?? null,
        crossCheckNextIn: q.node_cross_check?.next_due_in_blocks ?? null,
        groups: [
          { label: "Monetary integrity", ok: q.state === "validated" },
          { label: "Address integrity", ok: q.state === "validated" },
          { label: "Block & write integrity", ok: q.state === "validated" },
        ],
      }
    : sampleQuality();
  return { stats: sampleStats(), quality, featured, provenance: SAMPLE };
}
