"use client";

import type { ChartData } from "@/lib/xamine/types";
import { ArrowDown } from "@/components/Icons";

/** Builds a CSV of the rendered data in the browser and saves it. */
export function DownloadButton({ data, filename }: { data: ChartData; filename: string }) {
  const csv = () => {
    const rows: (string | number | null)[][] = [];
    if (data.kind === "timeseries") {
      rows.push(["date", ...data.series.map((s) => s.key)]);
      const n = data.series[0]?.points.length ?? 0;
      for (let i = 0; i < n; i++) rows.push([data.series[0].points[i].date, ...data.series.map((s) => s.points[i]?.value ?? null)]);
    } else if (data.kind === "candles") {
      rows.push(["date", "open", "high", "low", "close", "volume"]);
      data.candles.forEach((c) => rows.push([c.date, c.open, c.high, c.low, c.close, c.volume]));
    } else if (data.kind === "distribution") {
      rows.push(["bucket_lower", "bucket_upper", "count", "share"]);
      data.buckets.forEach((b) => rows.push([b.label, b.sublabel ?? "", b.count, b.share]));
    } else {
      rows.push(["date", ...data.labels]);
      data.snapshots.forEach((s) => rows.push([s.date, ...s.bands]));
    }
    return rows.map((r) => r.map((v) => (v == null ? "" : String(v).replace(/,/g, ""))).join(",")).join("\n");
  };
  const save = () => {
    const blob = new Blob([csv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" className="vgb vgb--glass" onClick={save}>
      <span className="vgb__ico" aria-hidden="true">
        <ArrowDown size={14} />
      </span>
      <span className="vgb__label">Download</span>
    </button>
  );
}
