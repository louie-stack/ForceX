"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";

/** Scroll depth for the hero DOM: copy lifts and fades, the scene dissolves into the next section. */
export function HeroMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".vg__copy", { y: -90, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "55% top" } });
      gsap.to(".vg__cuewrap", { opacity: 0, ease: "none", scrollTrigger: { ...st, end: "30% top" } });
      gsap.to(".vg__panel", { opacity: 0, ease: "none", scrollTrigger: { ...st, end: "40% top" } });
      gsap.to(".vg__gl", { opacity: 0, ease: "none", scrollTrigger: { ...st, start: "55% top" } });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref}>{children}</div>;
}
