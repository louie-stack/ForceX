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
          Trust is earned through <span className="hi">process</span>.
        </Split>
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
              Get API access
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
