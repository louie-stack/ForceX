"use client";

import { useId, useMemo, useState } from "react";

type Point = { date: string; value: number };

/**
 * Dependency-free SVG area chart with hover readout. Values are scaled by
 * `divisor` before formatting (MWEB series arrive in litoshi).
 */
export function SeriesChart({
  data,
  color = "var(--accent)",
  divisor = 1,
  format = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 }),
  unit = "",
  zero = true,
}: {
  data: Point[];
  color?: string;
  divisor?: number;
  format?: (n: number) => string;
  unit?: string;
  zero?: boolean;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 220;
  const padL = 44;
  const padR = 8;
  const padT = 14;
  const padB = 26;

  const model = useMemo(() => {
    const vals = data.map((d) => d.value / divisor);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const lo = zero ? 0 : min - span * 0.15;
    const hi = zero ? max * 1.12 : max + span * 0.1;
    const x = (i: number) => padL + (i / Math.max(1, data.length - 1)) * (W - padL - padR);
    const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
    const pts = vals.map((v, i) => [x(i), y(v)] as const);
    const line = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1]?.[0].toFixed(1)},${H - padB} L${padL},${H - padB} Z`;
    const ticks = [0, 0.5, 1].map((t) => ({ y: padT + t * (H - padT - padB), v: hi - t * (hi - lo) }));
    return { vals, pts, line, area, ticks, x };
  }, [data, divisor, zero]);

  if (!data.length) {
    return (
      <div className="chart-box" style={{ display: "grid", placeItems: "center" }}>
        <span className="small">Series unavailable</span>
      </div>
    );
  }

  const fmtDate = (s: string) => {
    const d = new Date(s + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  };
  const short = (n: number) => (n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(0) + "K" : n.toFixed(0));
  const h = hover ?? data.length - 1;

  return (
    <div className="chart-box">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="30 day series"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - padL) / (W - padL - padR)) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {model.ticks.map((t) => (
          <g key={t.y}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke="var(--line)" />
            <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
              {short(t.v)}
            </text>
          </g>
        ))}
        <path d={model.area} fill={`url(#${id}-fill)`} />
        <path d={model.line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => (
          <text key={i} x={model.x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
            {fmtDate(data[i].date)}
          </text>
        ))}
        <line x1={model.pts[h][0]} x2={model.pts[h][0]} y1={padT} y2={H - padB} stroke="var(--line-strong)" strokeDasharray="3 3" />
        <circle cx={model.pts[h][0]} cy={model.pts[h][1]} r="4" fill={color} stroke="var(--bg)" strokeWidth="2" />
      </svg>
      <div
        className="mono"
        style={{
          position: "absolute",
          top: -6,
          right: 0,
          fontSize: 12,
          color: "var(--text-2)",
          display: "flex",
          gap: 10,
          background: "var(--surface)",
          padding: "2px 6px",
          borderRadius: 6,
        }}
      >
        <span style={{ color: "var(--muted)" }}>{fmtDate(data[h].date)}</span>
        <b style={{ fontWeight: 500, color: "var(--text)" }}>
          {format(model.vals[h])}
          {unit}
        </b>
      </div>
    </div>
  );
}
