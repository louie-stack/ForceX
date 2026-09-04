"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { ChartData, Grain, Series, Unit } from "@/lib/xamine/types";
import { fmtDate, fmtFull, fmtShort } from "@/lib/xamine/format";

/**
 * The Xamine chart engine. One component, four kinds: time series (bars,
 * lines, areas on up to two axes), OHLC candles, bucketed distributions and
 * stacked share bands. Pixel-measured SVG so type stays crisp, with the
 * instrument's grid, crosshair and tooltip language throughout.
 */
const PAD_T = 26;
const PAD_B = 30;
const PAD_X = 16;

export function Chart({ data, grain = "day", height = 360, compact = false }: { data: ChartData; grain?: Grain; height?: number; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const h = compact ? Math.min(height, 280) : height;
  return (
    <div className={`ch ${compact ? "ch--compact" : ""}`}>
      {data.kind === "timeseries" && <Legend items={data.series.map((s) => ({ label: s.label, swatch: s.role }))} />}
      {data.kind === "bands" && <Legend items={data.labels.map((l, i) => ({ label: l, swatch: "band", index: i, total: data.labels.length }))} />}
      {data.kind === "candles" && <Legend items={[{ label: "Up", swatch: "up" }, { label: "Down", swatch: "down" }]} />}
      <div className="ch__plot" ref={host} style={{ height: h }}>
        {w > 0 && data.kind === "timeseries" && <TimeSeries series={data.series} W={w} H={h} grain={grain} />}
        {w > 0 && data.kind === "candles" && <Candles candles={data.candles} unit={data.unit} W={w} H={h} grain={grain} />}
        {w > 0 && data.kind === "distribution" && <Distribution buckets={data.buckets} unit={data.unit} W={w} H={h} />}
        {w > 0 && data.kind === "bands" && <Bands labels={data.labels} snapshots={data.snapshots} W={w} H={h} grain={grain} />}
      </div>
    </div>
  );
}

function Legend({ items }: { items: { label: string; swatch: string; index?: number; total?: number }[] }) {
  return (
    <div className="ch__legend mono" aria-hidden="true">
      {items.map((it) => (
        <span key={it.label} className="ch__legend-item">
          <i className={`ch__swatch ch__swatch--${it.swatch}`} style={it.swatch === "band" ? { background: bandColor(it.index ?? 0, it.total ?? 1) } : undefined} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export const bandColor = (i: number, n: number) => `color-mix(in srgb, var(--tint) ${Math.round(92 - (i / Math.max(1, n - 1)) * 78)}%, var(--bg))`;

/* ---------- shared scaffolding ---------- */

function useTooltip() {
  const [tip, setTip] = useState<{ x: number; y: number; title: string; rows: { label: string; value: string; tone?: string }[] } | null>(null);
  return { tip, setTip };
}

function Tooltip({ tip, W }: { tip: ReturnType<typeof useTooltip>["tip"]; W: number }) {
  if (!tip) return null;
  const flip = tip.x > W - 190;
  return (
    <div className="ch__tip mono" style={{ left: tip.x, top: tip.y, transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, -50%)` }}>
      <span className="ch__tip-title">{tip.title}</span>
      {tip.rows.map((r) => (
        <span key={r.label} className={`ch__tip-row ${r.tone ?? ""}`}>
          <em>{r.label}</em>
          <b>{r.value}</b>
        </span>
      ))}
    </div>
  );
}

/** Round tick values that always include zero when the domain crosses it. */
function yTicks(lo: number, hi: number, n = 4) {
  const span = hi - lo || 1;
  const mag = Math.pow(10, Math.floor(Math.log10(span / n)));
  // Pick the coarsest round step that still yields at least n ticks inside the domain.
  const candidates = [10, 5, 2.5, 2, 1, 0.5].map((k) => k * mag);
  let step = candidates[candidates.length - 1];
  for (const c of candidates) {
    if (Math.floor(hi / c) - Math.ceil(lo / c) + 1 >= n) {
      step = c;
      break;
    }
  }
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-6 ? 0 : v);
  return out.length >= 2 ? out : [lo, hi];
}

function xTickIndexes(n: number, W: number) {
  const want = Math.max(2, Math.min(8, Math.floor(W / 130)));
  const step = Math.max(1, Math.ceil((n - 1) / (want - 1)));
  const out: number[] = [];
  for (let i = 0; i < n - 1; i += step) if (n - 1 - i > step * 0.5) out.push(i);
  out.push(n - 1);
  return out;
}

type Tick = { y: number; v: number };
type XLabel = { x: number; label: string; anchor: "start" | "middle" | "end" };

function Grid({ ticks, W }: { ticks: Tick[]; W: number }) {
  return (
    <>
      {ticks.map((t, i) => (
        <line key={i} x1={PAD_X} x2={W - PAD_X} y1={t.y} y2={t.y} className="xi__grid" />
      ))}
    </>
  );
}

/** Axis labels paint last, with a background halo, so bars never hide them. */
function AxisLabels({ ticks, W, H, unit, unitRight, ticksRight, xLabels }: { ticks: Tick[]; W: number; H: number; unit: Unit; unitRight?: Unit; ticksRight?: Tick[]; xLabels: XLabel[] }) {
  return (
    <>
      {ticks.map((t, i) => (
        <text key={i} x={PAD_X} y={t.y - 6} className="xi__axis ch__axis">
          {fmtShort(t.v, unit)}
        </text>
      ))}
      {ticksRight?.map((t, i) => (
        <text key={"r" + i} x={W - PAD_X} y={t.y - 6} className="xi__axis ch__axis" textAnchor="end">
          {fmtShort(t.v, unitRight ?? unit)}
        </text>
      ))}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={H - 9} className="xi__axis ch__axis" textAnchor={l.anchor}>
          {l.label}
        </text>
      ))}
    </>
  );
}

/* ---------- time series ---------- */

function TimeSeries({ series, W, H, grain }: { series: Series[]; W: number; H: number; grain: Grain }) {
  const id = useId();
  const { tip, setTip } = useTooltip();
  const [hi, setHi] = useState<number | null>(null);
  const model = useMemo(() => {
    const dates = series[0]?.points.map((p) => p.date) ?? [];
    const n = dates.length;
    if (!n) return null;
    const plotW = W - PAD_X * 2;
    const slot = plotW / n;
    const xc = (i: number) => PAD_X + slot * (i + 0.5);
    const left = series.filter((s) => s.axis !== "right");
    const right = series.filter((s) => s.axis === "right");
    const domain = (ss: Series[]) => {
      const vals = ss.flatMap((s) => s.points.map((p) => p.value)).filter((v): v is number => v != null);
      if (!vals.length) return { lo: 0, hi: 1 };
      let lo = Math.min(...vals);
      let hiV = Math.max(...vals);
      const hasBars = ss.some((s) => s.role === "bar");
      if (hasBars) {
        lo = Math.min(0, lo);
        hiV = Math.max(0, hiV);
      }
      const span = hiV - lo || Math.abs(hiV) || 1;
      if (!hasBars) lo -= span * 0.22;
      else if (lo < 0) lo -= span * 0.1;
      hiV += span * 0.18;
      return { lo, hi: hiV };
    };
    const dl = domain(left);
    const dr = right.length ? domain(right) : null;
    const y = (v: number, d: { lo: number; hi: number }) => PAD_T + (1 - (v - d.lo) / (d.hi - d.lo)) * (H - PAD_T - PAD_B);
    const barW = Math.max(2, Math.min(28, slot * 0.62));
    const paths = series.map((s) => {
      const d = s.axis === "right" && dr ? dr : dl;
      const pts = s.points.map((p, i) => (p.value == null ? null : ([xc(i), y(p.value, d)] as const)));
      let line = "";
      let started = false;
      pts.forEach((p) => {
        if (!p) {
          started = false;
          return;
        }
        line += `${started ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)} `;
        started = true;
      });
      const y0 = y(Math.max(d.lo, 0) === 0 && d.lo <= 0 ? 0 : d.lo, d);
      const first = pts.find(Boolean);
      const last = [...pts].reverse().find(Boolean);
      const area = first && last ? `${line} L${last[0].toFixed(1)},${(H - PAD_B).toFixed(1)} L${first[0].toFixed(1)},${(H - PAD_B).toFixed(1)} Z` : "";
      return { s, pts, line, area, y0, d };
    });
    const ticks = yTicks(dl.lo, dl.hi).map((v) => ({ v, y: y(v, dl) }));
    const ticksRight = dr ? yTicks(dr.lo, dr.hi).map((v) => ({ v, y: y(v, dr) })) : undefined;
    const xLabels = xTickIndexes(n, W).map((i) => ({ x: xc(i), label: fmtDate(dates[i], grain), anchor: (i === 0 ? "start" : i === n - 1 ? "end" : "middle") as "start" | "middle" | "end" }));
    return { dates, n, slot, xc, barW, paths, ticks, ticksRight, xLabels, dl, dr };
  }, [series, W, H, grain]);

  if (!model) return null;
  const { dates, n, slot, xc, barW, paths, ticks, ticksRight, xLabels } = model;
  const leftUnit = series.find((s) => s.axis !== "right")?.unit ?? series[0].unit;
  const rightUnit = series.find((s) => s.axis === "right")?.unit;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left - PAD_X) / slot)));
    setHi(i);
    const rows = series.map((s) => ({ label: s.label, value: s.points[i]?.value == null ? "—" : fmtFull(s.points[i].value!, s.unit), tone: (s.points[i]?.value ?? 0) < 0 ? "bad" : "" }));
    const ys = paths.map((p) => p.pts[i]?.[1]).filter((v): v is number => v != null);
    setTip({ x: xc(i), y: ys.length ? Math.min(...ys) : H / 2, title: fmtDate(dates[i], grain), rows });
  };

  return (
    <>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="ch__svg" onPointerMove={onMove} onPointerLeave={() => (setHi(null), setTip(null))}>
        <defs>
          <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--tint)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--tint)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Grid ticks={ticks} W={W} />
        {hi != null && <rect x={PAD_X + slot * hi} y={PAD_T - 4} width={slot} height={H - PAD_T - PAD_B + 4} className="ch__band" />}
        {paths.map(({ s, pts, line, area, y0 }) =>
          s.role === "bar" ? (
            <g key={s.key}>
              {pts.map((p, i) =>
                p ? (
                  <rect
                    key={i}
                    x={p[0] - barW / 2}
                    y={Math.min(p[1], y0)}
                    width={barW}
                    height={Math.max(1, Math.abs(y0 - p[1]))}
                    rx={Math.min(3, barW / 3)}
                    className={`ch__bar ${(s.points[i].value ?? 0) < 0 ? "is-neg" : ""} ${hi != null && hi !== i ? "is-dim" : ""}`}
                  />
                ) : null,
              )}
            </g>
          ) : (
            <g key={s.key}>
              {s.role === "area" && <path d={area} fill={`url(#${id}-area)`} />}
              <path d={line} className={`ch__line ${s.role === "line" ? "ch__line--secondary" : ""}`} />
            </g>
          ),
        )}
        {hi != null && (
          <g>
            <line x1={xc(hi)} x2={xc(hi)} y1={PAD_T - 4} y2={H - PAD_B} className="xi__cross" />
            {paths.map(({ s, pts }) => (pts[hi] && s.role !== "bar" ? <circle key={s.key} cx={pts[hi]![0]} cy={pts[hi]![1]} r="4" className="xi__cross-dot" /> : null))}
          </g>
        )}
        <AxisLabels ticks={ticks} ticksRight={ticksRight} W={W} H={H} unit={leftUnit} unitRight={rightUnit} xLabels={xLabels} />
      </svg>
      <Tooltip tip={tip} W={W} />
    </>
  );
}

/* ---------- candles ---------- */

function Candles({ candles, unit, W, H, grain }: { candles: { date: string; open: number; high: number; low: number; close: number; volume: number | null }[]; unit: Unit; W: number; H: number; grain: Grain }) {
  const { tip, setTip } = useTooltip();
  const [hi, setHi] = useState<number | null>(null);
  const n = candles.length;
  const model = useMemo(() => {
    if (!n) return null;
    const plotW = W - PAD_X * 2;
    const slot = plotW / n;
    const xc = (i: number) => PAD_X + slot * (i + 0.5);
    const lo0 = Math.min(...candles.map((c) => c.low));
    const hi0 = Math.max(...candles.map((c) => c.high));
    const span = hi0 - lo0 || 1;
    const lo = lo0 - span * 0.15;
    const hiV = hi0 + span * 0.15;
    const y = (v: number) => PAD_T + (1 - (v - lo) / (hiV - lo)) * (H - PAD_T - PAD_B);
    const bw = Math.max(3, Math.min(18, slot * 0.6));
    const ticks = yTicks(lo, hiV).map((v) => ({ v, y: y(v) }));
    const xLabels = xTickIndexes(n, W).map((i) => ({ x: xc(i), label: fmtDate(candles[i].date, grain), anchor: (i === 0 ? "start" : i === n - 1 ? "end" : "middle") as "start" | "middle" | "end" }));
    return { slot, xc, y, bw, ticks, xLabels };
  }, [candles, n, W, H, grain]);
  if (!model) return null;
  const { slot, xc, y, bw, ticks, xLabels } = model;
  return (
    <>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="ch__svg"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left - PAD_X) / slot)));
          const c = candles[i];
          setHi(i);
          setTip({
            x: xc(i),
            y: y(c.high),
            title: fmtDate(c.date, grain),
            rows: [
              { label: "Open", value: fmtFull(c.open, unit) },
              { label: "High", value: fmtFull(c.high, unit) },
              { label: "Low", value: fmtFull(c.low, unit) },
              { label: "Close", value: fmtFull(c.close, unit), tone: c.close >= c.open ? "good" : "bad" },
            ],
          });
        }}
        onPointerLeave={() => (setHi(null), setTip(null))}
      >
        <Grid ticks={ticks} W={W} />
        {hi != null && <rect x={PAD_X + slot * hi} y={PAD_T - 4} width={slot} height={H - PAD_T - PAD_B + 4} className="ch__band" />}
        {candles.map((c, i) => {
          const up = c.close >= c.open;
          const top = y(Math.max(c.open, c.close));
          const bot = y(Math.min(c.open, c.close));
          return (
            <g key={c.date} className={`ch__candle ${up ? "is-up" : "is-down"} ${hi != null && hi !== i ? "is-dim" : ""}`}>
              <line x1={xc(i)} x2={xc(i)} y1={y(c.high)} y2={y(c.low)} />
              <rect x={xc(i) - bw / 2} y={top} width={bw} height={Math.max(1.5, bot - top)} rx="1.5" />
            </g>
          );
        })}
        <AxisLabels ticks={ticks} W={W} H={H} unit={unit} xLabels={xLabels} />
      </svg>
      <Tooltip tip={tip} W={W} />
    </>
  );
}

/* ---------- distribution ---------- */

function Distribution({ buckets, unit, W, H }: { buckets: { label: string; sublabel?: string; count: number; share: number | null }[]; unit: Unit; W: number; H: number }) {
  const { tip, setTip } = useTooltip();
  const [hi, setHi] = useState<number | null>(null);
  const n = buckets.length;
  const plotW = W - PAD_X * 2;
  const slot = plotW / Math.max(1, n);
  const xc = (i: number) => PAD_X + slot * (i + 0.5);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const hiV = max * 1.18;
  const padB = PAD_B + 12;
  const y = (v: number) => PAD_T + (1 - v / hiV) * (H - PAD_T - padB);
  const bw = Math.max(6, Math.min(64, slot * 0.6));
  const ticks = yTicks(0, hiV).map((v) => ({ v, y: y(v) }));
  return (
    <>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="ch__svg"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left - PAD_X) / slot)));
          const b = buckets[i];
          setHi(i);
          setTip({
            x: xc(i),
            y: y(b.count),
            title: `${b.label} to ${b.sublabel ?? ""} LTC`.replace(" to + LTC", "+ LTC"),
            rows: [
              { label: "Transactions", value: fmtFull(b.count, unit) },
              ...(b.share != null ? [{ label: "Share", value: (b.share * 100).toFixed(1) + "%" }] : []),
            ],
          });
        }}
        onPointerLeave={() => (setHi(null), setTip(null))}
      >
        <Grid ticks={ticks} W={W} />
        {buckets.map((b, i) => (
          <g key={i} className={hi != null && hi !== i ? "is-dim" : ""}>
            <rect x={xc(i) - bw / 2} y={y(b.count)} width={bw} height={Math.max(1, H - padB - y(b.count))} rx="3" className={`ch__bar ${hi != null && hi !== i ? "is-dim" : ""}`} />
            <text x={xc(i)} y={H - padB + 16} className="xi__axis" textAnchor="middle">
              {b.label}
            </text>
            <text x={xc(i)} y={H - padB + 28} className="xi__axis xi__axis--dim" textAnchor="middle">
              {b.sublabel}
            </text>
          </g>
        ))}
        {ticks.map((t, i) => (
          <text key={"t" + i} x={PAD_X} y={t.y - 6} className="xi__axis ch__axis">
            {fmtShort(t.v, unit)}
          </text>
        ))}
      </svg>
      <Tooltip tip={tip} W={W} />
    </>
  );
}

/* ---------- stacked share bands ---------- */

function Bands({ labels, snapshots, W, H, grain }: { labels: string[]; snapshots: { date: string; bands: number[] }[]; W: number; H: number; grain: Grain }) {
  const { tip, setTip } = useTooltip();
  const [hi, setHi] = useState<number | null>(null);
  const n = snapshots.length;
  const model = useMemo(() => {
    if (!n) return null;
    const plotW = W - PAD_X * 2;
    const x = (i: number) => PAD_X + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const y = (v: number) => PAD_T + (1 - v) * (H - PAD_T - PAD_B);
    const k = labels.length;
    // Cumulative tops per band, bottom band first.
    const tops = snapshots.map((s) => {
      let acc = 0;
      return s.bands.map((v) => (acc += v));
    });
    const areas = labels.map((_, b) => {
      const upper = snapshots.map((_, i) => `${x(i).toFixed(1)},${y(tops[i][b]).toFixed(1)}`);
      const lower = snapshots.map((_, i) => `${x(i).toFixed(1)},${y(b === 0 ? 0 : tops[i][b - 1]).toFixed(1)}`).reverse();
      return `M${upper.join(" L")} L${lower.join(" L")} Z`;
    });
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, y: y(v) }));
    const xLabels = xTickIndexes(n, W).map((i) => ({ x: x(i), label: fmtDate(snapshots[i].date, grain), anchor: (i === 0 ? "start" : i === n - 1 ? "end" : "middle") as "start" | "middle" | "end" }));
    return { x, y, areas, ticks, xLabels, k };
  }, [labels, snapshots, n, W, H, grain]);
  if (!model) return null;
  const { x, areas, ticks, xLabels, k } = model;
  return (
    <>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="ch__svg"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const f = (e.clientX - r.left - PAD_X) / (W - PAD_X * 2);
          const i = Math.max(0, Math.min(n - 1, Math.round(f * (n - 1))));
          setHi(i);
          setTip({
            x: x(i),
            y: PAD_T + 40,
            title: fmtDate(snapshots[i].date, grain),
            rows: labels.map((l, b) => ({ label: l, value: (snapshots[i].bands[b] * 100).toFixed(1) + "%" })).reverse(),
          });
        }}
        onPointerLeave={() => (setHi(null), setTip(null))}
      >
        <Grid ticks={ticks} W={W} />
        {areas.map((d, b) => (
          <path key={b} d={d} style={{ fill: bandColor(b, k) }} className="ch__bandarea" />
        ))}
        {hi != null && <line x1={x(hi)} x2={x(hi)} y1={PAD_T - 4} y2={H - PAD_B} className="xi__cross" />}
        <AxisLabels ticks={ticks} W={W} H={H} unit="pct" xLabels={xLabels} />
      </svg>
      <Tooltip tip={tip} W={W} />
    </>
  );
}

export function ChartFrame({ children }: { children: ReactNode }) {
  return <div className="ch__frame">{children}</div>;
}
