"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Dot + ring cursor. Activates on the first real mouse movement (no media
 * query gate, which fails on touch-capable laptops), hides on touch, returns
 * on re-entry. The native cursor is only suppressed while the custom one is
 * drawn, so there is never a state with no cursor at all.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dot.current!;
    const r = ring.current!;
    const root = document.documentElement;
    const xD = gsap.quickTo(d, "x", { duration: 0.05, ease: "power3" });
    const yD = gsap.quickTo(d, "y", { duration: 0.05, ease: "power3" });
    const xR = gsap.quickTo(r, "x", { duration: 0.28, ease: "power3" });
    const yR = gsap.quickTo(r, "y", { duration: 0.28, ease: "power3" });
    let shown = false;

    const show = () => {
      if (shown) return;
      shown = true;
      gsap.to([d, r], { autoAlpha: 1, duration: 0.25, overwrite: true });
      root.classList.add("has-cursor");
    };
    const hide = () => {
      if (!shown) return;
      shown = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.2, overwrite: true });
      root.classList.remove("has-cursor");
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        hide();
        return;
      }
      xD(e.clientX);
      yD(e.clientY);
      xR(e.clientX);
      yR(e.clientY);
      show();
    };
    const over = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      const t = el.closest?.("a, button, [role=button], summary, [data-cursor]");
      const label = t?.getAttribute("data-cursor");
      r.classList.toggle("is-active", !!t);
      r.dataset.label = label && label !== "text" ? label : "";
      const field = el.closest?.("input, textarea, select");
      root.classList.toggle("cursor-native", !!field);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      r.classList.add("is-down");
    };
    const up = () => r.classList.remove("is-down");
    const out = (e: PointerEvent) => {
      if (!e.relatedTarget) hide();
    };
    const vis = () => document.hidden && hide();
    const touch = () => hide();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("touchstart", touch, { passive: true });
    document.addEventListener("pointerout", out);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("touchstart", touch);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("visibilitychange", vis);
      root.classList.remove("has-cursor", "cursor-native");
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cur cur--dot" aria-hidden="true" />
      <div ref={ring} className="cur cur--ring" aria-hidden="true" />
    </>
  );
}
