import type { ReactNode } from "react";
import { Split } from "@/components/fx/Split";
import { BlockClient } from "@/components/fx/BlockClient";

export type HeroTint = "accent" | "xplorer" | "xamine" | "xtract" | "mcp" | "good";

const TINTS: Record<HeroTint, { dark: string; light: string; css: string }> = {
  accent: { dark: "#3b82f6", light: "#2563eb", css: "var(--accent)" },
  xplorer: { dark: "#60a5fa", light: "#2563eb", css: "var(--xplorer)" },
  xamine: { dark: "#2dd4bf", light: "#0d9488", css: "var(--xamine)" },
  xtract: { dark: "#a78bfa", light: "#7c3aed", css: "var(--xtract)" },
  mcp: { dark: "#f472b6", light: "#db2777", css: "var(--mcp)" },
  good: { dark: "#4ade80", light: "#16a34a", css: "var(--good)" },
};

/**
 * Cinematic opener for every secondary page: a page-tinted block bleeding
 * off the right edge, headline and one line of copy anchored bottom-left,
 * optional mono meta row. Same system everywhere, different tint and shape.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  meta,
  tint = "accent",
  shape = "cube",
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  tint?: HeroTint;
  shape?: "cube" | "sphere" | "morph";
  compact?: boolean;
}) {
  const t = TINTS[tint];
  return (
    <section className={`ph ${compact ? "ph--compact" : ""}`} style={{ ["--tint" as string]: t.css }}>
      <div className="ph__glow" />
      <BlockClient className="ph__gl" tint={t.dark} tintLight={t.light} mode={shape} scale={0.92} x={4.6} y={0.6} density={24} opacity={0.9} spin={0.8} />
      <div className="ph__veil" />
      <div className="container ph__inner">
        <span className="eyebrow" data-reveal="fade">
          {eyebrow}
        </span>
        <Split as="h1" type="words" now className="h1 ph__title">
          {title}
        </Split>
        {lead && (
          <Split as="p" type="lines" now delay={0.35} className="lead ph__lead">
            {lead}
          </Split>
        )}
        {actions && (
          <div className="ph__actions" data-reveal style={{ ["--d" as string]: "500ms" }}>
            {actions}
          </div>
        )}
        {meta && (
          <div className="ph__meta mono" data-reveal="fade" style={{ ["--d" as string]: "650ms" }}>
            {meta}
          </div>
        )}
      </div>
    </section>
  );
}
