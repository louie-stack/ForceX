/**
 * Shared shapes for the Xamine analytics surfaces. Every chart page renders
 * one `ChartPayload`; the provider decides whether it came from the live
 * Xtract API or from the sample fixtures.
 */
export type Grain = "day" | "week" | "month";
export type View = "incremental" | "cumulative";

export type ChartGroup = "market" | "network" | "address" | "supply" | "mweb";

export type ChartKind = "timeseries" | "candles" | "distribution" | "bands";

export type Control = "grain" | "view" | "range" | "window";

export interface ChartQuery {
  grain: Grain;
  view: View;
  /** ISO dates, half-open [start, end). */
  start: string;
  end: string;
  /** Distribution snapshot window label, e.g. "30d" or "year". */
  window?: string;
}

export interface SeriesPoint {
  date: string;
  value: number | null;
}

export type SeriesRole = "bar" | "line" | "area";

export interface Series {
  key: string;
  label: string;
  role: SeriesRole;
  points: SeriesPoint[];
  /** Left axis unless "right". */
  axis?: "left" | "right";
  /** Optional colour token; defaults by role. */
  color?: string;
  /** Formatter id, resolved in the chart component. */
  unit: Unit;
}

export type Unit = "count" | "ltc" | "usd" | "hashrate" | "pct" | "bytes";

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface Bucket {
  label: string;
  /** Second label line, e.g. the upper bound. */
  sublabel?: string;
  count: number;
  share: number | null;
}

export interface BandSnapshot {
  date: string;
  /** Share of total per band, in band order; sums to 1. */
  bands: number[];
}

export type ChartData =
  | { kind: "timeseries"; series: Series[] }
  | { kind: "candles"; candles: Candle[]; unit: Unit }
  | { kind: "distribution"; buckets: Bucket[]; unit: Unit; snapshotDate: string }
  | { kind: "bands"; labels: string[]; snapshots: BandSnapshot[] };

export interface Provenance {
  source: "live" | "sample";
  validatedHeight: number | null;
  validatedAt: string | null;
  datasetVersion: string | null;
  methodologyVersion: string | null;
}

export interface ChartPayload {
  data: ChartData;
  query: ChartQuery;
  provenance: Provenance;
}

export interface DashboardStats {
  allTimeBlocks: number | null;
  allTimeAddresses: number | null;
  allTimeTransactions: number | null;
}

export interface QualitySummary {
  state: "validated" | "warning" | "pending" | "unknown";
  validatedThrough: number | null;
  controlsTotal: number | null;
  controlsPassing: number | null;
  perBlock: number | null;
  periodic: number | null;
  crossCheckHeight: number | null;
  crossCheckNextIn: number | null;
  groups: { label: string; ok: boolean }[];
}

export interface DashboardPayload {
  stats: DashboardStats;
  quality: QualitySummary;
  featured: ChartPayload;
  provenance: Provenance;
}
