import Link from "next/link";
import { HeroGate } from "@/components/fx/HeroGate";
import { ArrowUpRight } from "@/components/Icons";
import { HeroMotion } from "./HeroMotion";

/**
 * The hero is the verification gate. Blocks flow toward the viewer, hollow
 * until they cross the plane, solid after. The copy sits above the stream,
 * the calls to action are mounted on the glass panel as a HUD bar
 * (positioned from the projected gate edge), and the live readouts are
 * pinned to the scene. Everything is present on first paint; nothing
 * staggers in.
 */
export function Hero() {
  return (
    <HeroMotion>
      <section className="vg" aria-labelledby="vg-title" data-gate>
        <div className="vg__beam vg__beam--l" aria-hidden="true" />
        <div className="vg__beam vg__beam--r" aria-hidden="true" />
        <div className="vg__glow" />
        <HeroGate />
        <div className="vg__veil" />
        <div className="container vg__inner">
          <div className="vg__copy">
            <span className="vg__kicker mono">
              <span className="pulse" />
              Litecoin on-chain intelligence
            </span>
            <h1 className="vg__title" id="vg-title">
              Blockchain <span className="vg__hi">Intelligence</span>
              <span className="vg__line">Platform</span>
            </h1>
            <p className="vg__lead">Explore verified on-chain data you can trust.</p>
          </div>

          <div className="vg__panel">
            <div className="vg__actions">
              <Link href="/signup" className="vgb vgb--primary">
                <i className="vgb__dot" aria-hidden="true" />
                <span className="vgb__label">Create free account</span>
                <span className="vgb__ico" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </Link>
              <Link href="/xplorer/litecoin" className="vgb vgb--glass">
                <i className="vgb__dot" aria-hidden="true" />
                <span className="vgb__label">Open the explorer</span>
                <span className="vgb__ico" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            </div>
          </div>

          <div className="vg__cuewrap" aria-hidden="true">
            <div className="vg__cue mono">
              <span>Scroll</span>
              <i />
            </div>
          </div>
        </div>
      </section>
    </HeroMotion>
  );
}
