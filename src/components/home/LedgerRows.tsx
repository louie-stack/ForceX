"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";
import { Check } from "@/components/Icons";

export type LedgerRow = { risk: string; effect: string; control: string; name: string };

/**
 * The drift ledger rows. On desktop the whole section pins while the rows
 * land one by one, driven by scroll (scrub), so the copy on the left holds
 * still and a fast scroll simply plays the sequence faster. On phones and
 * for reduced motion the rows reveal as they enter the viewport.
 */
export function LedgerRows({ rows }: { rows: LedgerRow[] }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ol = ref.current;
    if (!ol) return;
    const section = ol.closest<HTMLElement>(".ledger");
    const items = Array.from(ol.querySelectorAll<HTMLElement>(".ledger__row"));
    if (!section) return;

    if (reduceMotion() || window.innerWidth < 960) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.2 },
      );
      items.forEach((r) => io.observe(r));
      return () => io.disconnect();
    }

    section.classList.add("ledger--pin");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top+=72",
          end: `+=${items.length * 22}%`,
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
        },
      });
      items.forEach((row, i) => {
        const flip = row.querySelector<HTMLElement>(".ledger__flip");
        const status = row.querySelector<HTMLElement>(".ledger__status");
        const at = i;
        tl.fromTo(row, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, at);
        if (flip) tl.to(flip, { y: -30, duration: 0.4, ease: "power2.inOut" }, at + 0.45);
        if (status) tl.to(status, { borderColor: "color-mix(in srgb, var(--good) 35%, var(--line))", duration: 0.3 }, at + 0.55);
      });
      tl.to({}, { duration: 0.6 });
    }, section);
    return () => {
      ctx.revert();
      section.classList.remove("ledger--pin");
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <ol className="ledger__rows" id="ledger-title" ref={ref}>
      {rows.map((r, i) => (
        <li key={r.risk} className="ledger__row" style={{ ["--i" as string]: i }}>
          <span className="ledger__idx mono">0{i + 1}</span>
          <span className="ledger__main">
            <b>{r.risk}</b>
            <span>{r.effect}</span>
          </span>
          <span className="ledger__status" aria-label={`Caught by ${r.control}, ${r.name}`}>
            <span className="ledger__flip">
              <span className="ledger__risk">
                <i />
                Risk
              </span>
              <span className="ledger__caught">
                <Check size={11} />
                Caught · {r.control}
              </span>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
