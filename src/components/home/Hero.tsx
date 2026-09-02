import Link from "next/link";
import type { NetworkSummary } from "@/lib/api";
import { Magnetic } from "@/components/fx/Magnetic";
import { HeroStage } from "@/components/fx/HeroStage";
import { ArrowUpRight } from "@/components/Icons";
import { HeroMotion } from "./HeroMotion";
import { LiveTicker } from "./LiveTicker";

/**
 * The hero is the block. Particles assemble into VERIFIED, then cycle
 * through the cube and the sphere; each shape carries its own live facts
 * and a caption that completes the sentence.
 */
export function Hero({ summary }: { summary: NetworkSummary }) {
  return (
    <HeroMotion>
      <section className="hero3">
        <div className="hero3__glow" />
        <div className="hero3__veil" />
        <div className="container hero3__inner">
          <div className="hero3__top">
            <span className="eyebrow" data-reveal="fade" style={{ ["--d" as string]: "500ms" }}>
              Litecoin on-chain intelligence
            </span>
            <span className="hero3__live mono" data-reveal="fade" style={{ ["--d" as string]: "600ms" }}>
              <span className="pulse" /> Live at tip
            </span>
          </div>

          <HeroStage initial={summary} />

          <div className="hero3__actions" data-reveal style={{ ["--d" as string]: "1400ms" }}>
            <Magnetic>
              <Link href="/signup" className="btn btn--accent btn--lg">
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

        <div className="hero3__ticker" data-reveal="fade" style={{ ["--d" as string]: "1600ms" }}>
          <LiveTicker initial={summary} />
        </div>
      </section>
    </HeroMotion>
  );
}
