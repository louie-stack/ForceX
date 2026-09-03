import Link from "next/link";
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
        <h2 className="display final__title" data-reveal>
          <span className="hi">Verified</span> before
          <span className="final__line">it is displayed.</span>
        </h2>
        <p className="final__lead" data-reveal>
          Free explorer access today. API and MCP access when you are ready to build.
        </p>
        <div className="final__actions" data-reveal>
          <Magnetic>
            <Link href="/signup" className="btn btn--accent btn--lg">
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
