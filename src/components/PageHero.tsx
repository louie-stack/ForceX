import type { ReactNode } from "react";

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
        <h1 className="h1 page-hero__title" data-reveal style={center ? { marginInline: "auto" } : undefined}>
          {title}
        </h1>
        {lead && (
          <p className="lead" data-reveal style={{ ["--d" as string]: "80ms", ...(center ? { marginInline: "auto" } : {}) }}>
            {lead}
          </p>
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
