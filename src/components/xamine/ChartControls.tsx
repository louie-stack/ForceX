"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ChartQuery, Control, Grain } from "@/lib/xamine/types";

/**
 * The controls bar on a chart page. Mirrors the live application's grain,
 * view, from/to and window controls; Apply navigates with search params so
 * the page re-renders on the server with the new query.
 */
function presetRange(days: number) {
  const DAY = 86_400_000;
  const today = Math.floor(Date.now() / DAY) * DAY;
  return { start: new Date(today - days * DAY).toISOString().slice(0, 10), end: new Date(today).toISOString().slice(0, 10) };
}

const WINDOWS = [
  ["30d", "Last 30 days"],
  ["90d", "Last 90 days"],
  ["year", "Year snapshot"],
];

export function ChartControls({ slug, controls, grains, query }: { slug: string; controls: Control[]; grains: Grain[]; query: ChartQuery }) {
  const router = useRouter();
  const [grain, setGrain] = useState<Grain>(query.grain);
  const [view, setView] = useState(query.view);
  const [start, setStart] = useState(query.start);
  const [end, setEnd] = useState(query.end);
  const [win, setWin] = useState(query.window ?? "30d");
  const [pending, setPending] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (controls.includes("grain")) p.set("grain", grain);
    if (controls.includes("view")) p.set("view", view);
    if (controls.includes("range")) {
      p.set("start", start);
      p.set("end", end);
    }
    if (controls.includes("window")) p.set("window", win);
    setPending(true);
    router.push(`/xamine/charts/${slug}?${p.toString()}`);
    window.setTimeout(() => setPending(false), 1200);
  };

  const preset = (days: number) => {
    const r = presetRange(days);
    setStart(r.start);
    setEnd(r.end);
  };

  return (
    <form className="xctl" onSubmit={submit} aria-label="Chart controls">
      {controls.includes("grain") && (
        <label className="xctl__field">
          <span className="xctl__label mono">Grain</span>
          <span className="xctl__seg" role="radiogroup">
            {grains.map((g) => (
              <button key={g} type="button" role="radio" aria-checked={grain === g} className="xctl__seg-btn mono" onClick={() => setGrain(g)}>
                {g}
              </button>
            ))}
          </span>
        </label>
      )}
      {controls.includes("view") && (
        <label className="xctl__field">
          <span className="xctl__label mono">View</span>
          <span className="xctl__seg" role="radiogroup">
            {(["incremental", "cumulative"] as const).map((v) => (
              <button key={v} type="button" role="radio" aria-checked={view === v} className="xctl__seg-btn mono" onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </span>
        </label>
      )}
      {controls.includes("range") && (
        <>
          <label className="xctl__field">
            <span className="xctl__label mono">From</span>
            <input type="date" className="xctl__input mono" value={start} max={end} onChange={(e) => setStart(e.target.value)} required />
          </label>
          <label className="xctl__field">
            <span className="xctl__label mono">To</span>
            <input type="date" className="xctl__input mono" value={end} min={start} onChange={(e) => setEnd(e.target.value)} required />
          </label>
          <span className="xctl__field">
            <span className="xctl__label mono">Preset</span>
            <span className="xctl__seg">
              {[
                [30, "30d"],
                [90, "90d"],
                [365, "1y"],
              ].map(([d, l]) => (
                <button key={l} type="button" className="xctl__seg-btn mono" onClick={() => preset(d as number)}>
                  {l}
                </button>
              ))}
            </span>
          </span>
        </>
      )}
      {controls.includes("window") && (
        <label className="xctl__field">
          <span className="xctl__label mono">View</span>
          <select className="xctl__input xctl__select mono" value={win} onChange={(e) => setWin(e.target.value)}>
            {WINDOWS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="submit" className={`vgb vgb--primary xctl__apply ${pending ? "is-pending" : ""}`}>
        <i className="vgb__dot" aria-hidden="true" />
        <span className="vgb__label">{pending ? "Applying" : "Apply"}</span>
      </button>
    </form>
  );
}
