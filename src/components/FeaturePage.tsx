import Link from "next/link";
import type { ReactNode } from "react";
import { PageHero, type HeroTint } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ArrowUpRight } from "@/components/Icons";
import { AUTH_LINKS_SERVER } from "@/lib/links";

/**
 * Shared layout for the account-gated Xamine features (Economic Throughput,
 * Address LinX): a short hero, one visual, three facts, and the sign-in path
 * into the live application.
 */
export function FeaturePage({
  eyebrow,
  title,
  lead,
  visual,
  facts,
  appPath,
  tint = "var(--xamine)",
  heroTint = "xamine",
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  visual: ReactNode;
  facts: [string, string][];
  appPath: string;
  tint?: string;
  heroTint?: HeroTint;
}) {
  return (
    <>
      <PageHero
        tint={heroTint}
        shape="sphere"
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        actions={
          <>
            <a href={AUTH_LINKS_SERVER.signinTo(appPath)} className="btn btn--accent btn--lg" data-cursor="Open">
              Sign in to open
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </a>
            <Link href="/signup" className="btn btn--ghost btn--lg">
              Create free account
            </Link>
          </>
        }
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="feature__visual" data-reveal="scale" data-spot="tint" style={{ ["--tint" as string]: tint }}>
            {visual}
          </div>
          <div className="feature__facts">
            {facts.map(([k, v], i) => (
              <div key={k} className="feature__fact" data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                <b>{k}</b>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand
        eyebrow="Included with every account"
        title="Part of the public beta."
        body="Free accounts include Xplorer, Xamine, watchlists, and platform API keys."
        primary={{ href: "/signup", label: "Create free account" }}
        secondary={{ href: "/xamine", label: "All Xamine features" }}
      />
    </>
  );
}
