"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/Icons";

const LAYERS = [
  { title: "Structural constraints", body: "Invalid relational states are blocked by schema design. Primary keys, foreign keys, uniqueness rules, and check constraints prevent invalid rows from being committed in the first place.", tag: "190 enforcement points at write time" },
  { title: "Write-path controls", body: "Per-block and inline checks confirm that the writer committed what it intended to write: parser defects, partial writes, and disagreements between in-memory state and stored results.", tag: "Runs on every block" },
  { title: "Accounting reconciliation", body: "Balances, totals, counts, and supply-related values are reconciled across canonical and derived data surfaces so independently built paths remain aligned.", tag: "Per-block trust signal" },
  { title: "External source cross-check", body: "Periodic node-level comparison confirms that ForceX is not only internally consistent, but aligned with the Litecoin node as an independent source of truth.", tag: "Every 1,000 blocks" },
];

export function LayersScroll() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reduceMotion() || window.innerWidth < 900) return;
    const track = el.querySelector<HTMLElement>(".hz__track")!;
    const ctx = gsap.context(() => {
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: el.querySelector(".hz__pin"),
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
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
                Four layers. No single one is sufficient.
              </h2>
              <p className="lead" style={{ marginTop: 20 }}>
                Each layer detects a different class of failure. Together they close the gap between what an index stores and
                what the chain actually says.
              </p>
            </div>
            <span className="hero2__scroll">
              Scroll to explore <i style={{ transform: "rotate(-90deg)", transformOrigin: "left" }} />
            </span>
          </div>
          {LAYERS.map((l, i) => (
            <div key={l.title} className="hz__panel">
              <span className="hz__num">0{i + 1}</span>
              <div>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
                <span className="chip" style={{ marginTop: 20 }}>
                  <span className="chip__dot" />
                  {l.tag}
                </span>
              </div>
            </div>
          ))}
          <div className="hz__panel hz__panel--end">
            <span className="eyebrow">242 enforcement points</span>
            <h3 style={{ marginTop: 16 }}>Read the full methodology and the public control catalog.</h3>
            <Link href="/data-quality" className="btn btn--accent" style={{ marginTop: 28 }} data-cursor="Read">
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
