"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, reduceMotion } from "@/lib/gsap";

/**
 * Splits its text into lines, words, or chars and reveals them on scroll
 * (or immediately when `now` is set, gated on the preloader finishing).
 */
export function Split({
  as: Tag = "div",
  type = "lines",
  className,
  children,
  delay = 0,
  now = false,
  stagger,
  style,
}: {
  as?: ElementType;
  type?: "lines" | "words" | "chars";
  className?: string;
  children: ReactNode;
  delay?: number;
  now?: boolean;
  stagger?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion()) return;
    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let st: ScrollTrigger | null = null;
    const run = () => {
      split = new SplitText(el, {
        type: type === "chars" ? "chars,words,lines" : type === "words" ? "words,lines" : "lines",
        linesClass: "sl",
        wordsClass: "sw",
        charsClass: "sc",
        mask: "lines",
      });
      const targets = type === "chars" ? split.chars : type === "words" ? split.words : split.lines;
      const st_ = stagger ?? (type === "chars" ? 0.018 : type === "words" ? 0.045 : 0.1);
      gsap.set(el, { visibility: "visible" });
      const vars: gsap.TweenVars = {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration: type === "chars" ? 0.9 : 1.2,
        ease: "power4.out",
        stagger: st_,
        delay,
      };
      gsap.set(targets, { yPercent: 110, rotate: type === "lines" ? 0 : 2, opacity: type === "lines" ? 1 : 0.001 });
      if (now) {
        tween = gsap.to(targets, vars);
      } else {
        tween = gsap.to(targets, { ...vars, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        st = tween.scrollTrigger ?? null;
      }
    };
    const ready = () => document.fonts?.ready ?? Promise.resolve();
    let cancelled = false;
    const go = () => {
      ready().then(() => {
        if (cancelled) return;
        if (now && !document.documentElement.hasAttribute("data-loaded")) {
          window.addEventListener("fx:loaded", run, { once: true });
        } else run();
      });
    };
    go();
    return () => {
      cancelled = true;
      window.removeEventListener("fx:loaded", run);
      st?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [type, delay, now, stagger]);

  return (
    <Tag ref={ref} className={`st ${className ?? ""}`} style={style}>
      {children}
    </Tag>
  );
}
