"use client";

import { useEffect, useRef } from "react";

/**
 * Counts from 0 to `value` when it enters the viewport, and re-animates on
 * subsequent value changes (used for live numbers).
 */
export function Counter({
  value,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  duration = 1400,
  className,
}: {
  value: number | null | undefined;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || value == null) return;
    let raf = 0;
    const run = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const from = current.current;
      const to = value;
      if (reduce || duration <= 0) {
        el.textContent = format(to);
        current.current = to;
        return;
      }
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const e = 1 - Math.pow(1 - p, 4);
        const n = from + (to - from) * e;
        el.textContent = format(n);
        if (p < 1) raf = requestAnimationFrame(tick);
        else current.current = to;
      };
      raf = requestAnimationFrame(tick);
    };
    if (started.current) {
      run();
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          started.current = true;
          io.disconnect();
          run();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, format]);

  return (
    <span ref={ref} className={className}>
      {value == null ? "—" : format(value)}
    </span>
  );
}
