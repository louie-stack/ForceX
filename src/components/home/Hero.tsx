import Link from "next/link";
import type { NetworkSummary } from "@/lib/api";
import { Split } from "@/components/fx/Split";
import { Magnetic } from "@/components/fx/Magnetic";
import { ArrowUpRight } from "@/components/Icons";
import { HeroHud } from "./HeroHud";
import { LiveTicker } from "./LiveTicker";
import { HeroFieldClient } from "./HeroFieldClient";

export function Hero({ summary }: { summary: NetworkSummary }) {
  return (
    <section className="hero2">
      <HeroFieldClient />
      <div className="hero2__veil" />
      <div className="container hero2__inner">
        <div className="hero2__top">
          <span className="eyebrow" data-reveal="fade" style={{ ["--d" as string]: "900ms" }}>
            Verified Litecoin data · public beta
          </span>
          <span className="hero2__scroll" data-reveal="fade" style={{ ["--d" as string]: "1100ms" }}>
            Scroll <i />
          </span>
        </div>

        <Split as="h1" type="chars" now className="display hero2__title" delay={0.15} stagger={0.012}>
          Blockchain data should be <em className="serif">verified</em> before it is displayed.
        </Split>

        <div className="hero2__bottom">
          <div className="hero2__copy">
            <Split as="p" type="lines" now className="lead" delay={0.9} style={{ margin: 0 }}>
              ForceX is a data-quality-first blockchain intelligence platform starting with Litecoin. Every block is reconciled,
              validated, and cross-checked against the node before you see it.
            </Split>
            <div className="hero__actions" data-reveal style={{ ["--d" as string]: "1250ms" }}>
              <Magnetic>
                <Link href="/signup" className="btn btn--accent btn--lg" data-cursor="Go">
                  Create free account
                  <span className="btn__ico">
                    <ArrowUpRight />
                  </span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/data-quality" className="btn btn--ghost btn--lg">
                  How verification works
                </Link>
              </Magnetic>
            </div>
          </div>
          <div data-reveal="scale" style={{ ["--d" as string]: "1150ms" }}>
            <HeroHud initial={summary} />
          </div>
        </div>
      </div>
      <div className="hero2__ticker" data-reveal="fade" style={{ ["--d" as string]: "1400ms" }}>
        <LiveTicker initial={summary} />
      </div>
    </section>
  );
}

