"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";
import { Counter } from "@/components/Counter";
import { ArrowUpRight } from "@/components/Icons";
import type { NetworkSummary } from "@/lib/api";
import { fmtSignedPct, pctTone } from "@/lib/format";

/**
 * Xamine opener. The headline sits centred above a working instrument: a
 * governed chart built from the live 30-day series, with the validated
 * height, the live window, and the rolling 24h readouts wired to the
 * public API. No decorative scene; the product is the visual.
 */
export type SeriesPoint = { date: string; value: number };

export interface HeroSeries {
  key: string;
  label: string;
  /** Scale raw values before display (MWEB arrives in litoshi). */
  divisor: number;
  /** Anchor the axis at zero rather than the series minimum. */
  zero: boolean;
  unit: string;
  data: SeriesPoint[];
  /** True when the live series was unavailable and a placeholder is shown. */
  sample: boolean;
}

const PAD_T = 30;
const PAD_B = 28;
const PAD_X = 18;

const fmtDate = (s: string) =>
  new Date(s + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const short = (n: number) =>
  Math.abs(n) >= 1_000_000
    ? (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M"
    : Math.abs(n) >= 1000
      ? (n / 1000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, "") + "K"
      : n.toFixed(0);
const full = (n: number) => Math.round(n).toLocaleString("en-US");

export function XamineHero({ summary, series, appHref }: { summary: NetworkSummary; series: HeroSeries[]; appHref: string }) {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const s = series[active] ?? series[0];

  // Scroll depth: copy lifts away while the instrument, leaning well back at
  // rest, swings forward to flat as it takes the viewport. No pointer tilt.
  useEffect(() => {
    const el = root.current;
    if (!el || reduceMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(".xh__copy", {
        y: -70,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "45% top",
          scrub: true,
        },
      });
      gsap.to(".xh__rail", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "45% top",
          scrub: true,
        },
      });
      gsap.fromTo(
        panel.current,
        { "--sx": "34deg", "--sy": "0px", "--ss": 0.94 },
        { "--sx": "0deg", "--sy": "0px", "--ss": 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom 72%", scrub: 0.5 } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const q = summary.quality;
  const validated = q?.state === "validated";
  const height = q?.tip_height ?? summary.asOf.height;

  return (
    <section className="xh" ref={root} aria-labelledby="xh-title">
      <div className="xh__beam xh__beam--l" aria-hidden="true" />
      <div className="xh__beam xh__beam--r" aria-hidden="true" />
      <div className="container xh__inner">
        <div className="xh__copy">
          <span className="xh__kicker mono">
            <span className="pulse" />
            Xamine · Analytics and intelligence
          </span>
          <h1 className="xh__title" id="xh-title">
            Analytics designed to reveal insights with <span className="xh__hi">confidence</span>.
          </h1>
          <p className="xh__lead">Trends, supply, network behavior, and address relationships on governed Litecoin data.</p>
        </div>

        <div className="xh__rail">
          <div className="xh__actions">
            <a href={appHref} className="vgb vgb--primary">
              <i className="vgb__dot" aria-hidden="true" />
              <span className="vgb__label">Open Xamine</span>
              <span className="vgb__ico" aria-hidden="true">
                <ArrowUpRight size={14} />
              </span>
            </a>
            <Link href="/signup" className="vgb vgb--glass">
              <i className="vgb__dot" aria-hidden="true" />
              <span className="vgb__label">Create free account</span>
              <span className="vgb__ico" aria-hidden="true">
                <ArrowUpRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        <div className="xh__stage">
          <div className="xh__glow" aria-hidden="true" />
          <div className="xh__panel" ref={panel}>
            <div className="xi">
              <i className="xi__corner xi__corner--tl" aria-hidden="true" />
              <i className="xi__corner xi__corner--tr" aria-hidden="true" />
              <i className="xi__corner xi__corner--bl" aria-hidden="true" />
              <i className="xi__corner xi__corner--br" aria-hidden="true" />

              <header className="xi__head">
                <div className="xi__id mono">
                  <span className="xi__dot" aria-hidden="true" />
                  <span>Xamine</span>
                  <em>/</em>
                  <span>LTC</span>
                  <em>/</em>
                  <span>30 days · UTC</span>
                </div>
                <div className="xi__tabs" role="tablist" aria-label="Series">
                  {series.map((it, i) => (
                    <button key={it.key} type="button" role="tab" aria-selected={i === active} className="xi__tab mono" onClick={() => setActive(i)}>
                      {it.label}
                    </button>
                  ))}
                </div>
                <div className={`xi__state mono ${s.sample ? "is-sample" : validated ? "is-ok" : "is-pending"}`}>
                  <i aria-hidden="true" />
                  {s.sample ? "Sample series" : validated ? "Validated" : "Pending"}
                  {height != null && !s.sample && <b>#{full(height)}</b>}
                </div>
              </header>

              <Plot key={s.key} series={s} />

              <footer className="xi__stats">
                <Stat label="Validated height" value={height} tone="" />
                <Stat label="Transactions · 24h" value={summary.tx.count} delta={summary.tx.changePct} />
                <Stat label="Active addresses · 24h" value={summary.addresses.active} delta={summary.addresses.changePct} />
                <Stat
                  label="Controls passing"
                  custom={
                    q ? (
                      <>
                        {q.controls.passing}
                        <span className="xi__of">/ {q.controls.total}</span>
                      </>
                    ) : (
                      "—"
                    )
                  }
                />
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, delta, custom, tone }: { label: string; value?: number | null; delta?: number | null; custom?: ReactNode; tone?: string }) {
  const t = tone ?? pctTone(delta);
  return (
    <div className="xi__stat">
      <span className="xi__stat-label mono">{label}</span>
      <span className="xi__stat-value">{custom ?? <Counter value={value} />}</span>
      {delta != null && (
        <span className={`xi__stat-delta mono ${t}`} aria-label={`change ${fmtSignedPct(delta)}`}>
          {delta > 0 ? "▲" : delta < 0 ? "▼" : ""} {fmtSignedPct(delta)}
        </span>
      )}
    </div>
  );
}

/**
 * The chart. Geometry is computed in pixels from the measured plot so text
 * stays crisp; the crosshair sweeps the series on its own and follows the
 * pointer when hovered. Per-frame updates write to the DOM directly.
 */
function Plot({ series }: { series: HeroSeries }) {
  const id = useId();
  const host = useRef<HTMLDivElement>(null);
  const linePath = useRef<SVGPathElement>(null);
  const areaPath = useRef<SVGPathElement>(null);
  const cross = useRef<SVGGElement>(null);
  const crossLine = useRef<SVGLineElement>(null);
  const crossDot = useRef<SVGCircleElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const tipDate = useRef<HTMLSpanElement>(null);
  const tipValue = useRef<HTMLElement>(null);
  const tipDelta = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const hover = useRef<number | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const model = useMemo(() => {
    const { w: W, h: H } = size;
    const data = series.data;
    if (!W || !H || data.length < 2) return null;
    const vals = data.map((d) => d.value / series.divisor);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || Math.abs(max) || 1;
    const lo = series.zero ? 0 : min - span * 0.22;
    const hi = series.zero ? max * 1.14 : max + span * 0.18;
    const x = (i: number) => PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2);
    const y = (v: number) => PAD_T + (1 - (v - lo) / (hi - lo)) * (H - PAD_T - PAD_B);
    const pts = vals.map((v, i) => [x(i), y(v)] as [number, number]);
    const line = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${(H - PAD_B).toFixed(1)} L${pts[0][0].toFixed(1)},${(H - PAD_B).toFixed(1)} Z`;
    const ticks = [0, 1, 2, 3].map((k) => {
      const t = k / 3;
      return { y: PAD_T + t * (H - PAD_T - PAD_B), v: hi - t * (hi - lo) };
    });
    const step = Math.max(1, Math.round((data.length - 1) / (W < 520 ? 3 : 5)));
    const xTicks: number[] = [];
    for (let i = 0; i < data.length - 1; i += step) if (data.length - 1 - i > step * 0.6) xTicks.push(i);
    xTicks.push(data.length - 1);
    return {
      W,
      H,
      vals,
      pts,
      line,
      area,
      ticks,
      xTicks,
      lastX: pts[pts.length - 2][0],
    };
  }, [size, series]);

  // Draw the line in, then release the crosshair.
  const drawn = useRef(false);
  useEffect(() => {
    const lp = linePath.current;
    const ap = areaPath.current;
    if (!lp || !ap || !model) return;
    if (drawn.current) return;
    drawn.current = true;
    if (reduceMotion()) {
      gsap.set([lp, ap], { opacity: 1 });
      return;
    }
    const L = lp.getTotalLength();
    gsap.set(lp, { strokeDasharray: L, strokeDashoffset: L, opacity: 1 });
    gsap.to(lp, { strokeDashoffset: 0, duration: 1.9, ease: "power2.inOut" });
    gsap.fromTo(ap, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.7, ease: "power2.out" });
    gsap.fromTo(cross.current, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.9 });
    gsap.fromTo(tip.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.9 });
  }, [model]);

  // Crosshair sweep and pointer follow.
  useEffect(() => {
    if (!model) return;
    const reduce = reduceMotion();
    const { pts, vals, W } = model;
    const n = pts.length;
    const data = series.data;
    const el = host.current;
    let raf = 0;
    let u = 0.72;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0,
    });
    if (el) io.observe(el);
    const t0 = performance.now();

    const place = (uu: number) => {
      const f = uu * (n - 1);
      const i0 = Math.max(0, Math.min(n - 2, Math.floor(f)));
      const k = f - i0;
      const px = pts[i0][0] + (pts[i0 + 1][0] - pts[i0][0]) * k;
      const py = pts[i0][1] + (pts[i0 + 1][1] - pts[i0][1]) * k;
      const i = Math.round(f);
      crossLine.current?.setAttribute("x1", px.toFixed(1));
      crossLine.current?.setAttribute("x2", px.toFixed(1));
      crossDot.current?.setAttribute("cx", px.toFixed(1));
      crossDot.current?.setAttribute("cy", py.toFixed(1));
      const t = tip.current;
      if (t) {
        const flipX = px > W - 170;
        const below = py < PAD_T + 66;
        t.style.left = `${px.toFixed(1)}px`;
        t.style.top = `${(below ? py + 14 : py - 14).toFixed(1)}px`;
        t.style.transform = `translate(${flipX ? "calc(-100% - 14px)" : "14px"}, ${below ? "0" : "-100%"})`;
        if (tipDate.current) tipDate.current.textContent = fmtDate(data[i].date) + (i === n - 1 ? " · live" : "");
        if (tipValue.current) tipValue.current.textContent = full(vals[i]) + series.unit;
        if (tipDelta.current) {
          const prev = vals[i - 1];
          if (i > 0 && prev) {
            const d = ((vals[i] - prev) / Math.abs(prev)) * 100;
            tipDelta.current.textContent = (d > 0 ? "▲ " : d < 0 ? "▼ " : "") + fmtSignedPct(d);
            tipDelta.current.className = `xi__tip-delta ${pctTone(d)}`;
          } else {
            tipDelta.current.textContent = "";
          }
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      const h = hover.current;
      let target: number;
      if (h != null) target = h;
      else if (reduce) target = 0.72;
      else {
        const t = (now - t0) / 1000;
        target = 0.5 + 0.47 * Math.sin(t * 0.26 - 0.9);
      }
      u += (target - u) * (h != null ? 0.22 : 0.05);
      place(u);
    };
    place(u);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [model, series]);

  return (
    <div
      className="xi__plot"
      ref={host}
      onPointerMove={(e) => {
        if (!model) return;
        const r = e.currentTarget.getBoundingClientRect();
        const f = (e.clientX - r.left - PAD_X) / (r.width - PAD_X * 2);
        hover.current = Math.max(0, Math.min(1, f));
      }}
      onPointerLeave={() => (hover.current = null)}
    >
      {model && (
        <svg width={model.W} height={model.H} viewBox={`0 0 ${model.W} ${model.H}`} className="xi__svg" role="img" aria-label={`${series.label}, last 30 days`}>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--tint)" stopOpacity="0.34" />
              <stop offset="70%" stopColor="var(--tint)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="var(--tint)" stopOpacity="0" />
            </linearGradient>
            <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="xi__hatch" />
            </pattern>
            <filter id={`${id}-glow`} x="-10%" y="-40%" width="120%" height="180%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {model.ticks.map((t, i) => (
            <g key={i}>
              <line x1={PAD_X} x2={model.W - PAD_X} y1={t.y} y2={t.y} className="xi__grid" />
              <text x={PAD_X} y={t.y - 6} className="xi__axis">
                {short(t.v)}
              </text>
            </g>
          ))}
          {model.xTicks.map((i) => (
            <text key={i} x={model.pts[i][0]} y={model.H - 9} className="xi__axis" textAnchor={i === 0 ? "start" : i === model.pts.length - 1 ? "end" : "middle"}>
              {fmtDate(series.data[i].date)}
            </text>
          ))}

          {/* Live window: the latest interval is still being written. */}
          <rect x={model.lastX} y={PAD_T} width={model.W - PAD_X - model.lastX} height={model.H - PAD_T - PAD_B} fill={`url(#${id}-hatch)`} />
          <line x1={model.lastX} x2={model.lastX} y1={PAD_T - 8} y2={model.H - PAD_B} className="xi__live-edge" />

          <path ref={areaPath} d={model.area} fill={`url(#${id}-fill)`} style={{ opacity: 0 }} />
          <path ref={linePath} d={model.line} className="xi__line" style={{ opacity: 0 }} filter={`url(#${id}-glow)`} />

          <g ref={cross} style={{ opacity: 0 }}>
            <line ref={crossLine} y1={PAD_T - 4} y2={model.H - PAD_B} className="xi__cross" />
            <circle ref={crossDot} r="4.5" className="xi__cross-dot" />
          </g>
        </svg>
      )}
      <div ref={tip} className="xi__tip mono" style={{ opacity: 0 }} aria-hidden="true">
        <span ref={tipDate} className="xi__tip-date" />
        <b ref={tipValue} />
        <span ref={tipDelta} className="xi__tip-delta" />
      </div>
      {model && (
        <span className="xi__live mono" style={{ right: PAD_X }} aria-hidden="true">
          Live window
        </span>
      )}
    </div>
  );
}
