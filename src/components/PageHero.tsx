import type { ReactNode } from "react";
import { Split } from "@/components/fx/Split";

export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <section className="page-hero">
      <div className="glow page-hero__glow" />
      <div className="grid-bg" />
      <div className="container" style={center ? { textAlign: "center" } : undefined}>
        <span className="eyebrow" data-reveal="fade">
          {eyebrow}
        </span>
        <Split as="h1" type="words" now className="h1 page-hero__title" style={center ? { marginInline: "auto" } : undefined}>
          {title}
        </Split>
        {lead && (
          <Split as="p" type="lines" now delay={0.35} className="lead" style={center ? { marginInline: "auto" } : undefined}>
            {lead}
          </Split>
        )}
        {actions && (
          <div className="page-hero__actions" data-reveal style={{ ["--d" as string]: "160ms", ...(center ? { justifyContent: "center" } : {}) }}>
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
