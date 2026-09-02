"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";

/** Scroll depth for the hero: block recedes and fades, annotations drift, copy lifts. */
export function HeroMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero3__gl", { scale: 1.18, y: -120, opacity: 0.15, ease: "none", scrollTrigger: st });
      gsap.to(".hero3__glow", { opacity: 0, ease: "none", scrollTrigger: st });
      gsap.to(".hero3__stage", { y: -60, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "60% top" } });
      gsap.to(".hero3__actions", { y: -100, ease: "none", scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref}>{children}</div>;
}
