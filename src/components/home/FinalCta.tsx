import Link from "next/link";
import { Split } from "@/components/fx/Split";
import { Magnetic } from "@/components/fx/Magnetic";
import { ArrowUpRight } from "@/components/Icons";

export function FinalCta() {
  return (
    <section className="final">
      <div className="glow final__glow" />
      <div className="container">
        <span className="eyebrow" data-reveal="fade" style={{ justifyContent: "center" }}>
          Public beta is open
        </span>
        <Split as="h2" type="words" className="display final__title">
          Explore data that has been <em className="serif">verified</em>.
        </Split>
        <p className="lead" data-reveal style={{ maxWidth: 560, margin: "24px auto 0" }}>
          Free accounts include the explorer, analytics, watchlist alerts, and platform API keys.
        </p>
        <div className="final__actions" data-reveal>
          <Magnetic>
            <Link href="/signup" className="btn btn--accent btn--lg" data-cursor="Go">
              Create free account
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/xtract" className="btn btn--ghost btn--lg">
              Explore Xtract
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
