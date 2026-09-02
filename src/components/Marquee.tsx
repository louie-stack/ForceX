import type { ReactNode } from "react";

export function Marquee({ items, duration = 60, className = "" }: { items: ReactNode[]; duration?: number; className?: string }) {
  const row = (
    <>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
          {it}
        </span>
      ))}
    </>
  );
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee__track" style={{ ["--marquee-duration" as string]: `${duration}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}
