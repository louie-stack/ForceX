"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis drives native scroll; GSAP's ticker drives Lenis so ScrollTrigger and
 * Lenis share one clock (no jitter on pinned sections).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const lenis = window.__lenis;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        if (lenis) lenis.scrollTo(el as HTMLElement, { immediate: true, offset: -90 });
        else el.scrollIntoView();
        return;
      }
    }
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    // Layout of the new route settles after paint; refresh triggers then.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
