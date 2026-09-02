"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText, reduceMotion } from "@/lib/gsap";

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    document.fonts.ready.then(() => {
      split = new SplitText(el, { type: "words", wordsClass: "sw" });
      el.classList.add("scrub");
      tween = gsap.to(split.words, {
        opacity: 1,
        stagger: 0.04,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
      });
    });
    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, []);

  return (
    <section className="manifesto">
      <div className="container">
        <span className="eyebrow" data-reveal="fade">
          Not just another explorer
        </span>
        <p ref={ref} className="manifesto__text" style={{ marginTop: 28 }}>
          An explorer can show you what happened. ForceX is built to <em className="serif">prove</em> that what is being shown is
          correct. On-chain data is often treated as self-evident, yet every parse, index, transform, and join is a chance
          to drift from the chain while still looking perfectly healthy.
        </p>
        <div className="manifesto__meta" data-reveal>
          <span>Bad joins</span>
          <span>Missed edge cases</span>
          <span>Incomplete reconciliation</span>
          <span>Improper supply logic</span>
          <span>Stale metadata</span>
          <span>Unvalidated calculations</span>
        </div>
      </div>
    </section>
  );
}
