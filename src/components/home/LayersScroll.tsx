"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/Icons";
import { LayerFigure, type FigureKind } from "./LayerFigure";

/**
 * Four layers of integrity control as a horizontal run of dark panels.
 * Each panel is an instrument figure for that layer inside a dashed
 * frame, spec-sheet labels above, the published copy beneath.
 */
const LAYERS = [
  {
    title: "Structural constraints",
    body: "Schema design blocks invalid rows before they are committed.",
    tag: "190 enforcement points at write time",
    kind: "schema",
    figure: "lattice" as FigureKind,
  },
  {
    title: "Write-path controls",
    body: "Per-block checks confirm the writer committed exactly what it intended.",
    tag: "Runs on every block",
    kind: "write path",
    figure: "writepath" as FigureKind,
  },
  {
    title: "Accounting reconciliation",
    body: "Independently built data paths are reconciled so they never disagree.",
    tag: "Per-block trust signal",
    kind: "ledger",
    figure: "mirror" as FigureKind,
  },
  {
    title: "External source cross-check",
    body: "The index is compared against the Litecoin node, the source of truth.",
    tag: "Every 1,000 blocks",
    kind: "node",
    figure: "ruler" as FigureKind,
  },
];

export function LayersScroll() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reduceMotion() || window.innerWidth < 900) return;
    const track = el.querySelector<HTMLElement>(".hz__track")!;
    const ctx = gsap.context(() => {
      const dist = () => track.scrollWidth - window.innerWidth;
      const st = {
        trigger: el,
        start: "top top",
        end: () => `+=${dist()}`,
        pin: el.querySelector(".hz__pin"),
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      };
      gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hz" ref={root} aria-label="Four layers of integrity control">
      <div className="hz__pin">
        <div className="hz__track">
          <div className="hz__panel hz__panel--intro">
            <div>
              <span className="eyebrow">Data quality framework</span>
              <h2 className="h2" style={{ margin: "18px 0 0" }}>
                Four layers of integrity control.
              </h2>
              <p className="lead" style={{ marginTop: 18 }}>
                Each catches a different class of failure. Scroll.
              </p>
            </div>
            <span className="hero2__scroll">
              Scroll to explore <i style={{ transform: "rotate(-90deg)", transformOrigin: "left" }} />
            </span>
          </div>
          {LAYERS.map((l, i) => (
            <article key={l.title} className="hz__panel hz__card" aria-label={l.title}>
              <header className="hz__spec mono">
                <span>
                  <b>0{i + 1}</b> {l.kind}
                </span>
                <span>Layer {i + 1} of 4</span>
              </header>
              <div className="hz__fig">
                <LayerFigure kind={l.figure} />
              </div>
              <div className="hz__caption">
                <div>
                  <h3>{l.title}</h3>
                  <p>{l.body}</p>
                </div>
                <span className="hz__tag mono">
                  <i />
                  {l.tag}
                </span>
              </div>
            </article>
          ))}
          <div className="hz__panel hz__panel--end">
            <span className="eyebrow">242 enforcement points</span>
            <h3 style={{ marginTop: 16 }}>Read the methodology and the public control catalog.</h3>
            <Link href="/data-quality" className="btn btn--accent" style={{ marginTop: 28 }}>
              Data quality
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
