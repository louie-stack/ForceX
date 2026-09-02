"use client";

import { useEffect } from "react";

/**
 * One document-level listener drives the pointer-tracked highlight on every
 * [data-spot] card, so cards stay server components.
 */
export function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let current: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-spot]");
      if (current && current !== t) {
        current.style.setProperty("--spot", "0");
      }
      current = t;
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
      t.style.setProperty("--spot", "1");
    };
    const leave = () => {
      if (current) current.style.setProperty("--spot", "0");
      current = null;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);
  return null;
}
