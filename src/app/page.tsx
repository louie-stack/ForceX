import Link from "next/link";
import { getNetworkSummary } from "@/lib/api";
import { LiveNetworkPanel } from "@/components/LiveNetworkPanel";
import { VerificationStream } from "@/components/VerificationStream";
import { ArrowUpRight, ArrowRight } from "@/components/Icons";
import { Statement } from "@/components/home/Statement";
import { Surfaces } from "@/components/home/Surfaces";
import { QualityLayers } from "@/components/home/QualityLayers";
import { DeveloperStrip } from "@/components/home/DeveloperStrip";
import { McpSection } from "@/components/home/McpSection";
import { Belief } from "@/components/home/Belief";
import { CtaBand } from "@/components/CtaBand";

export const revalidate = 30;

export default async function Home() {
  const summary = await getNetworkSummary();

  return (
    <>
      <section className="hero">
        <div className="glow hero__glow" />
        <div className="grid-bg" />
        <div className="container">
          <span className="eyebrow" data-reveal="fade">
            Verified Litecoin data · public beta
          </span>
          <h1 className="display hero__title" data-reveal-lines style={{ marginTop: 22 }}>
            <span className="line">
              <span>Blockchain data</span>
            </span>
            <span className="line">
              <span>
                should be <em className="serif">verified</em>
              </span>
            </span>
            <span className="line">
              <span>before it is displayed.</span>
            </span>
          </h1>

          <div className="hero__row">
            <div className="hero__copy">
              <p className="lead" data-reveal style={{ margin: 0, ["--d" as string]: "120ms" }}>
                ForceX is a data-quality-first blockchain intelligence platform starting with Litecoin. Every block is
                reconciled, validated, and cross-checked against the node before you see it.
              </p>
              <div className="hero__actions" data-reveal style={{ ["--d" as string]: "200ms" }}>
                <Link href="/signup" className="btn btn--accent btn--lg">
                  Create free account
                  <span className="btn__ico">
                    <ArrowUpRight />
                  </span>
                </Link>
                <Link href="/about" className="btn btn--ghost btn--lg">
                  Who we are
                </Link>
              </div>
              <div className="hero__trust" data-reveal style={{ ["--d" as string]: "280ms" }}>
                <span className="chip">
                  <span className="chip__dot" />
                  242 enforcement points
                </span>
                <span className="chip">
                  <span className="chip__dot" />
                  Node cross-check every 1,000 blocks
                </span>
                <span className="chip">
                  <span className="chip__dot" />
                  ISO 8000 framework
                </span>
              </div>
            </div>
            <div data-reveal="scale" style={{ ["--d" as string]: "160ms" }}>
              <LiveNetworkPanel initial={summary} />
            </div>
          </div>
        </div>
      </section>

      <VerificationStream height={summary.asOf.height} />

      <Statement />

      <Surfaces />

      <QualityLayers quality={summary.quality} />

      <DeveloperStrip quality={summary.quality} />

      <McpSection height={summary.asOf.height} />

      <Belief />

      <CtaBand />

      <div className="container" style={{ paddingBottom: 24 }}>
        <p className="small" style={{ margin: 0, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          Litecoin is the starting point. The standard is the product.
          <Link href="/about" className="link-arrow" style={{ fontSize: 14 }}>
            Read why <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </>
  );
}
