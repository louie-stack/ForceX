"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Dot + ring cursor. Pointer devices only; the ring swells over interactive targets. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const d = dot.current!;
    const r = ring.current!;
    document.documentElement.classList.add("has-cursor");
    const xD = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const yD = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const xR = gsap.quickTo(r, "x", { duration: 0.35, ease: "power3" });
    const yR = gsap.quickTo(r, "y", { duration: 0.35, ease: "power3" });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
        shown = true;
      }
      xD(e.clientX);
      yD(e.clientY);
      xR(e.clientX);
      yR(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest("a, button, [role=button], input, textarea, summary, [data-cursor]");
      const label = t?.getAttribute("data-cursor");
      r.classList.toggle("is-active", !!t);
      r.classList.toggle("is-text", label === "text");
      r.dataset.label = label && label !== "text" ? label : "";
    };
    const down = () => r.classList.add("is-down");
    const up = () => r.classList.remove("is-down");
    const leave = () => gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cur cur--dot" aria-hidden="true" />
      <div ref={ring} className="cur cur--ring" aria-hidden="true" />
    </>
  );
}
