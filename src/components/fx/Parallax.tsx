"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";

/** Moves its child vertically by `amount` px across its scroll through the viewport. */
export function Parallax({ amount = 80, className, children, style }: { amount?: number; className?: string; children: ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;
    const tween = gsap.fromTo(
      el,
      { y: amount },
      { y: -amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [amount]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
