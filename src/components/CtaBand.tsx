import Link from "next/link";
import { ArrowUpRight } from "./Icons";

export function CtaBand({
  eyebrow = "Public beta is open",
  title = "Create a free account and explore verified Litecoin data.",
  body = "Accounts include the explorer, analytics, watchlist alerts, and platform API keys.",
  primary = { href: "/signup", label: "Create free account" },
  secondary = { href: "/xtract", label: "Explore Xtract" },
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
}) {
  return (
    <section className="section--tight">
      <div className="container">
        <div className="cta" data-reveal="scale">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="h2" style={{ margin: "18px 0 0", maxWidth: "18ch" }}>
              {title}
            </h2>
            <p className="lead" style={{ margin: "18px 0 0", maxWidth: 520 }}>
              {body}
            </p>
          </div>
          <div className="cta__actions">
            <Link href={primary.href} className="btn btn--accent btn--lg">
              {primary.label}
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
            {secondary && (
              <Link href={secondary.href} className="btn btn--ghost btn--lg">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
