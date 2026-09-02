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
        <div className="hero2__copy">
          <span className="eyebrow" data-reveal="fade" style={{ ["--d" as string]: "700ms" }}>
            Verified Litecoin data
          </span>
          <Split as="h1" type="chars" now className="display hero2__title" delay={0.1} stagger={0.014}>
            Blockchain data, <span className="hi">verified</span> before it is displayed.
          </Split>
          <Split as="p" type="lines" now className="lead hero2__lead" delay={0.75} style={{ margin: 0 }}>
            Every Litecoin block is reconciled, validated, and cross-checked against the node before you see it.
          </Split>
          <div className="hero__actions" data-reveal style={{ ["--d" as string]: "1000ms" }}>
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
        <div className="hero2__hud" data-reveal="scale" style={{ ["--d" as string]: "1100ms" }}>
          <HeroHud initial={summary} />
        </div>
      </div>
      <div className="hero2__ticker" data-reveal="fade" style={{ ["--d" as string]: "1300ms" }}>
        <LiveTicker initial={summary} />
      </div>
    </section>
  );
}
