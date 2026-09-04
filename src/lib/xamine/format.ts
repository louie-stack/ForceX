import type { Grain, Unit } from "./types";

const compact = (n: number, digits = 1) => {
  const a = Math.abs(n);
  const f = (v: number, s: string) => v.toFixed(digits).replace(/\.0+$/, "") + s;
  if (a >= 1e12) return f(n / 1e12, "T");
  if (a >= 1e9) return f(n / 1e9, "B");
  if (a >= 1e6) return f(n / 1e6, "M");
  if (a >= 1e3) return f(n / 1e3, "K");
  return n.toFixed(a < 10 && !Number.isInteger(n) ? 2 : 0);
};

/** Axis-friendly short form. */
export function fmtShort(v: number, unit: Unit): string {
  switch (unit) {
    case "ltc":
      return compact(v / 1e8);
    case "usd":
      return "$" + (Math.abs(v) >= 1000 ? compact(v) : v.toFixed(v < 10 ? 2 : 0));
    case "hashrate":
      return compact(v / 1e15, 2) + " PH/s";
    case "pct":
      return (v * 100).toFixed(0) + "%";
    case "bytes":
      return compact(v) + "B";
    default:
      return compact(v);
  }
}

/** Tooltip-friendly full form. */
export function fmtFull(v: number, unit: Unit): string {
  switch (unit) {
    case "ltc":
      return (v / 1e8).toLocaleString("en-US", { maximumFractionDigits: v / 1e8 < 100 ? 2 : 0 }) + " LTC";
    case "usd":
      return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "hashrate":
      return (v / 1e15).toLocaleString("en-US", { maximumFractionDigits: 3 }) + " PH/s";
    case "pct":
      return (v * 100).toFixed(1) + "%";
    case "bytes":
      return v.toLocaleString("en-US") + " B";
    default:
      return Math.round(v).toLocaleString("en-US");
  }
}

export function fmtDate(s: string, grain: Grain = "day"): string {
  const d = new Date(s + "T00:00:00Z");
  if (grain === "month") return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function fmtDateLong(s: string): string {
  return new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** The day before an exclusive end date, for captions. */
export function inclusiveEnd(end: string): string {
  return new Date(Date.parse(end + "T00:00:00Z") - 86_400_000).toISOString().slice(0, 10);
}
