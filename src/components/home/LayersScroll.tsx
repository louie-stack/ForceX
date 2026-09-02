"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/Icons";

const LAYERS = [
  { title: "Structural constraints", body: "Schema design blocks invalid rows before they are committed.", tag: "190 enforcement points at write time" },
  { title: "Write-path controls", body: "Per-block checks confirm the writer committed exactly what it intended.", tag: "Runs on every block" },
  { title: "Accounting reconciliation", body: "Independently built data paths are reconciled so they never disagree.", tag: "Per-block trust signal" },
  { title: "External source cross-check", body: "The index is compared against the Litecoin node, the source of truth.", tag: "Every 1,000 blocks" },
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
            <div key={l.title} className="hz__panel" data-spot="">
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
