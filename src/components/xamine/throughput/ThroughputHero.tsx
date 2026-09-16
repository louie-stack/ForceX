"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/Icons";

/**
 * Economic Throughput opener. Same construction as the Xamine hero (centred
 * copy, HUD rail, an instrument that leans back and swings flat on scroll),
 * but the instrument is the idea of the page: every day's gross output
 * volume as a column, the adjusted payment volume filled inside it, and the
 * hatched remainder is what the methodology removed.
 */
export interface ThroughputDay {
  date: string;
  gross: number;
  payment: number;
}

const LTC = 1e8;
const fmtDate = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const compact = (atomic: number) => {
  const v = atomic / LTC;
  if (v >= 1e9) return (v / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace(/\.0+$/, "") + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
  return v.toFixed(0);
};
const pct = (v: number) => (v * 100).toFixed(1) + "%";

export function ThroughputHero({ days, sample, height, appHref, chartHref }: { days: ThroughputDay[]; sample: boolean; height: number | null; appHref: string; chartHref: string }) {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const n = days.length;
  const [active, setActive] = useState(n - 1);
  const hovering = useRef(false);

  const max = Math.max(1, ...days.map((d) => d.gross));
  const top = Math.ceil((max * 1.08) / (10_000_000 * LTC)) * 10_000_000 * LTC;
  const ticks = [1, 0.5, 0].map((t) => ({ t, v: top * t }));
  const grossSum = days.reduce((a, d) => a + d.gross, 0);
  const paySum = days.reduce((a, d) => a + d.payment, 0);
  const removedShare = grossSum ? 1 - paySum / grossSum : 0;
  const d = days[Math.min(active, n - 1)];

  // Scroll: copy lifts away, the instrument swings from leaning back to flat.
  useEffect(() => {
    const el = root.current;
    if (!el || reduceMotion() || window.matchMedia("(max-width: 759px)").matches) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top top", end: "45% top", scrub: true };
      gsap.to(".xh__copy", { y: -70, opacity: 0, ease: "none", scrollTrigger: st });
      gsap.to(".xh__rail", { opacity: 0, ease: "none", scrollTrigger: { ...st } });
      gsap.fromTo(panel.current, { "--sx": "34deg", "--ss": 0.94 }, { "--sx": "0deg", "--ss": 1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom 72%", scrub: 0.5 } });
    }, el);
    return () => ctx.revert();
  }, []);

  // At rest the readout walks the month on its own; the pointer takes over.
  useEffect(() => {
    if (reduceMotion() || n < 2) return;
    let i = n - 1;
    const id = window.setInterval(() => {
      if (hovering.current || document.hidden) return;
      i = (i + 1) % n;
      setActive(i);
    }, 1400);
    return () => window.clearInterval(id);
  }, [n]);

  const pick = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.floor(((e.clientX - r.left) / r.width) * n);
    setActive(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <section className="xh et-hero" ref={root} aria-labelledby="et-title">
      <div className="xh__beam xh__beam--l" aria-hidden="true" />
      <div className="xh__beam xh__beam--r" aria-hidden="true" />
      <div className="container xh__inner">
        <div className="xh__copy">
          <span className="xh__kicker mono">
            <span className="pulse" />
            Xamine · Economic Throughput
          </span>
          <h1 className="xh__title" id="et-title">
            Real economic activity, <span className="xh__hi">not</span> raw volume.
          </h1>
          <p className="xh__lead">Adjusted volume removes change outputs and self-transfers, so the number you see is value that actually moved between parties.</p>
        </div>

        <div className="xh__rail">
          <div className="xh__actions">
            <Link href={chartHref} className="vgb vgb--primary">
              <i className="vgb__dot" aria-hidden="true" />
              <span className="vgb__label">Open the chart</span>
              <span className="vgb__ico" aria-hidden="true">
                <ArrowUpRight size={14} />
              </span>
            </Link>
            <a href={appHref} className="vgb vgb--glass">
              <i className="vgb__dot" aria-hidden="true" />
              <span className="vgb__label">Open in Xamine</span>
              <span className="vgb__ico" aria-hidden="true">
                <ArrowUpRight size={14} />
              </span>
            </a>
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
                <div className="et-legend mono" aria-hidden="true">
                  <span>
                    <i className="et-sw et-sw--pay" /> Payment
                  </span>
                  <span>
                    <i className="et-sw et-sw--cut" /> Change + self-transfer
                  </span>
                </div>
                <div className={`xi__state mono ${sample ? "is-sample" : "is-ok"}`}>
                  <i aria-hidden="true" />
                  {sample ? "Sample data" : "Validated"}
                  {height != null && !sample && <b>#{height.toLocaleString("en-US")}</b>}
                </div>
              </header>

              <div className="et-plot">
                <div className="et-plot__axis mono" aria-hidden="true">
                  {ticks.map(({ t, v }) => (
                    <span key={t} style={{ bottom: `${t * 100}%` }}>
                      {v ? compact(v) : "0"}
                    </span>
                  ))}
                </div>
                <div
                  className="et-plot__cols"
                  role="img"
                  aria-label={`Daily gross output volume and adjusted payment volume over ${n} days`}
                  onPointerEnter={() => (hovering.current = true)}
                  onPointerMove={pick}
                  onPointerLeave={() => (hovering.current = false)}
                >
                  {ticks.map(({ t }) => (
                    <i key={t} className="et-plot__grid" style={{ bottom: `${t * 100}%` }} aria-hidden="true" />
                  ))}
                  {days.map((day, i) => (
                    <div key={day.date} className={`et-col ${i === active ? "is-active" : ""}`} style={{ ["--g" as string]: day.gross / top, ["--p" as string]: day.gross ? day.payment / day.gross : 0, ["--i" as string]: i }}>
                      <span className="et-col__gross">
                        <span className="et-col__pay" />
                      </span>
                    </div>
                  ))}
                  <div className="et-read" style={{ ["--x" as string]: (active + 0.5) / n }} aria-hidden="true">
                    <span className="et-read__date mono">{fmtDate(d.date)}</span>
                    <span className="et-read__row">
                      <em className="mono">Gross</em>
                      <b>{compact(d.gross)}</b>
                    </span>
                    <span className="et-read__row is-pay">
                      <em className="mono">Payment</em>
                      <b>{compact(d.payment)}</b>
                    </span>
                    <span className="et-read__cut mono">−{pct(d.gross ? 1 - d.payment / d.gross : 0)} removed</span>
                  </div>
                </div>
                <div className="et-plot__x mono" aria-hidden="true">
                  <span>{fmtDate(days[0].date)}</span>
                  <span>{fmtDate(days[Math.floor(n / 2)].date)}</span>
                  <span>{fmtDate(days[n - 1].date)}</span>
                </div>
              </div>

              <footer className="xi__stats">
                <Stat label="Gross output · 30d" value={`${compact(grossSum)} LTC`} />
                <Stat label="Adjusted payment · 30d" value={`${compact(paySum)} LTC`} tone="pay" />
                <Stat label="Removed as plumbing" value={pct(removedShare)} />
                <Stat label="Validated height" value={height != null ? height.toLocaleString("en-US") : "—"} />
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="xi__stat">
      <span className="xi__stat-label mono">{label}</span>
      <span className={`xi__stat-value ${tone ? `et-stat--${tone}` : ""}`}>{value}</span>
    </div>
  );
}
