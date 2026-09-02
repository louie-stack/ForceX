import Link from "next/link";
import type { NetworkSummary } from "@/lib/api";
import { Split } from "@/components/fx/Split";
import { Magnetic } from "@/components/fx/Magnetic";
import { BlockClient } from "@/components/fx/BlockClient";
import { ArrowUpRight } from "@/components/Icons";
import { HeroAnnotations } from "./HeroAnnotations";
import { HeroMotion } from "./HeroMotion";
import { LiveTicker } from "./LiveTicker";

/**
 * Centered composition: the block is the hero. Live annotations orbit it,
 * the headline sits over its lower half, and scroll pushes the block away
 * while the copy lifts, so the section has depth instead of two columns.
 */
export function Hero({ summary }: { summary: NetworkSummary }) {
  return (
    <HeroMotion>
      <section className="hero3">
        <div className="hero3__glow" />
        <BlockClient className="hero3__gl" mode="morph" scale={1.08} x={0} y={0.9} />
        <div className="hero3__veil" />

        <div className="container hero3__inner">
          <div className="hero3__top">
            <span className="eyebrow" data-reveal="fade" style={{ ["--d" as string]: "600ms" }}>
              Verified Litecoin data
            </span>
            <span className="hero3__live mono" data-reveal="fade" style={{ ["--d" as string]: "700ms" }}>
              <span className="pulse" /> Live at tip
            </span>
          </div>

          <div className="hero3__stage">
            <HeroAnnotations initial={summary} />
          </div>

          <div className="hero3__copy">
            <Split as="h1" type="chars" now className="display hero3__title" delay={0.1} stagger={0.012}>
              Blockchain data, <span className="hi">verified</span> before it is displayed.
            </Split>
            <Split as="p" type="lines" now className="lead hero3__lead" delay={0.7}>
              Every Litecoin block is reconciled, validated, and cross-checked against the node before you see it.
            </Split>
            <div className="hero3__actions" data-reveal style={{ ["--d" as string]: "950ms" }}>
              <Magnetic>
                <Link href="/signup" className="btn btn--accent btn--lg" data-cursor="Go">
                  Create free account
                  <span className="btn__ico">
                    <ArrowUpRight />
                  </span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/xplorer/litecoin" className="btn btn--ghost btn--lg">
                  Open the explorer
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>

        <div className="hero3__ticker" data-reveal="fade" style={{ ["--d" as string]: "1200ms" }}>
          <LiveTicker initial={summary} />
        </div>
      </section>
    </HeroMotion>
  );
}
