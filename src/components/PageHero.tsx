import type { ReactNode } from "react";
import { HeroGate } from "@/components/fx/HeroGate";
import { BlockClient } from "@/components/fx/BlockClient";
import { BarField } from "@/components/fx/scenes/BarField";
import { Streams } from "@/components/fx/scenes/Streams";
import { StatusBoard } from "@/components/fx/scenes/StatusBoard";
import { NodeGraph } from "@/components/fx/scenes/NodeGraph";

export type HeroTint = "accent" | "xplorer" | "xamine" | "xtract" | "mcp" | "good";
export type HeroVisual = "gate" | "bars" | "streams" | "board" | "graph" | "block";

const TINTS: Record<HeroTint, { dark: string; light: string; css: string }> = {
  accent: { dark: "#3b82f6", light: "#2563eb", css: "var(--accent)" },
  xplorer: { dark: "#60a5fa", light: "#2563eb", css: "var(--xplorer)" },
  xamine: { dark: "#2dd4bf", light: "#0d9488", css: "var(--xamine)" },
  xtract: { dark: "#a78bfa", light: "#7c3aed", css: "var(--xtract)" },
  mcp: { dark: "#f472b6", light: "#db2777", css: "var(--mcp)" },
  good: { dark: "#4ade80", light: "#16a34a", css: "var(--good)" },
};

/**
 * Opener for every secondary page. Each page carries its own scene, built
 * from what that product is: a bar terrain for analytics, data streams for
 * the API, a control board for data quality, a relationship graph for MCP
 * and Address LinX, the point-lattice block for the company pages. The
 * scene sits to the right behind a left-aligned headline. Everything is
 * present on first paint; nothing staggers in.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  meta,
  tint = "accent",
  visual = "block",
  shape = "cube",
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  tint?: HeroTint;
  visual?: HeroVisual;
  /** Form of the point-lattice block when `visual` is `block`. */
  shape?: "cube" | "sphere" | "morph";
  compact?: boolean;
}) {
  const t = TINTS[tint];
  const scene =
    visual === "gate" ? (
      <HeroGate className="ph__gl" variant="page" tint={t.dark} tintLight={t.light} />
    ) : visual === "bars" ? (
      <BarField className="ph__gl" tint={t.dark} tintLight={t.light} />
    ) : visual === "streams" ? (
      <Streams className="ph__gl" tint={t.dark} tintLight={t.light} />
    ) : visual === "board" ? (
      <StatusBoard className="ph__gl" tint={t.dark} tintLight={t.light} />
    ) : visual === "graph" ? (
      <NodeGraph className="ph__gl" tint={t.dark} tintLight={t.light} />
    ) : (
      <BlockClient className="ph__gl" tint={t.dark} tintLight={t.light} mode={shape} scale={0.92} x={4.6} y={0.6} density={24} opacity={0.9} spin={0.8} />
    );
  return (
    <section className={`ph ${compact ? "ph--compact" : ""}`} style={{ ["--tint" as string]: t.css }} data-gate>
      <div className="ph__glow" />
      {scene}
      <div className="ph__veil" />
      <div className="container ph__inner">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="h1 ph__title">{title}</h1>
        {lead && <p className="lead ph__lead">{lead}</p>}
        {actions && <div className="ph__actions">{actions}</div>}
        {meta && <div className="ph__meta mono">{meta}</div>}
      </div>
    </section>
  );
}
