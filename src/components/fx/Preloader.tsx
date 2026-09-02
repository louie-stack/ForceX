"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { Wordmark } from "@/components/Wordmark";

/**
 * First-visit-per-session loader. The markup is server-rendered and shown
 * instantly by the inline boot script (html[data-pre]) so there is no blank
 * frame before hydration. Once hydrated it counts up to the current block
 * height and wipes away; the document gets [data-loaded] so the hero
 * choreography can wait for it.
 */
export function Preloader({ height }: { height: number | null }) {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const wanted = useSyncExternalStore(
    () => () => {},
    () => document.documentElement.hasAttribute("data-pre"),
    () => true,
  );

  useEffect(() => {
    if (!wanted || !root.current) return;
    const target = height ?? 3_170_000;
    const obj = { v: Math.max(0, target - 4200) };
    const el = root.current;
    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem("fx-loaded", "1");
        } catch {}
        document.documentElement.removeAttribute("data-pre");
        document.documentElement.setAttribute("data-loaded", "1");
        window.dispatchEvent(new Event("fx:loaded"));
        setDone(true);
      },
    });
    tl.set(el, { autoAlpha: 1 })
      .fromTo(el.querySelector(".pre__mark"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "power4.out" }, 0.1)
      .to(
        obj,
        {
          v: target,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            if (num.current) num.current.textContent = Math.round(obj.v).toLocaleString("en-US");
          },
        },
        0.2,
      )
      .fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.2)
      .call(
        () => {
          const l = el.querySelector(".pre__label");
          if (l) l.textContent = "Verified through";
        },
        undefined,
        ">-0.05",
      )
      .to(el.querySelector(".pre__inner"), { yPercent: -20, autoAlpha: 0, duration: 0.5, ease: "power3.in" }, "+=0.15")
      .to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<0.1");
    return () => {
      tl.kill();
    };
  }, [wanted, height]);

  if (done) return null;
  return (
    <div ref={root} className="pre" aria-hidden="true">
      <div className="pre__inner">
        <div className="pre__row">
          <span className="pre__clip">
            <span className="pre__mark">
              <Wordmark height={26} />
            </span>
          </span>
          <span className="pre__meta mono">
            <span className="pre__label">Validating block</span>
            <span ref={num} className="pre__num">
              {height ? Math.max(0, height - 4200).toLocaleString("en-US") : "0"}
            </span>
          </span>
        </div>
        <span className="pre__bar">
          <span ref={bar} />
        </span>
      </div>
    </div>
  );
}
