import { XLogo } from "@/components/Icons";
import { Composer } from "@/components/contact/Composer";
import { Streams } from "@/components/fx/scenes/Streams";

/**
 * The whole page, built around the form. Headline centred above, the
 * composer wide beneath it, and the other ways to reach the team on one
 * quiet line under that. The data streams from the API docs run
 * full-bleed behind everything, tinted to the company accent, so a
 * message reads as one more thing entering the network.
 */
export function Hero() {
  return (
    <section className="xtp-sec ctp-hero" aria-labelledby="ctp-title">
      <Streams className="ctp-scene" tint="#3b82f6" tintLight="#2563eb" />
      <div className="ctp-veil" aria-hidden="true" />
      <div className="container ctp-hero__inner">
        <header className="ctp-hero__copy" data-reveal="fade">
          <span className="vg__kicker mono">
            <span className="pulse" />
            Replies within one business day
          </span>
          <h1 className="vg__title ctp-title" id="ctp-title">
            Tell us what
            <span className="vg__line">
              you&rsquo;re <span className="vg__hi">building.</span>
            </span>
          </h1>
          <p className="vg__lead ctp-lead">
            Beta access, API keys, data questions, partnerships. One form, read and answered by a person on the team.
          </p>
        </header>

        <Composer />

        <footer className="ctp-after" data-reveal style={{ ["--d" as string]: "360ms" }}>
          <ul className="ctp-channels">
            <li>
              <span className="ctp-channels__k">Email</span>
              <a href="mailto:contact@forcex.com" className="mono ctp-channels__mail">
                contact@forcex.com
              </a>
            </li>
            <li>
              <span className="ctp-channels__k">Social</span>
              <a href="https://x.com/ForceXHQ" target="_blank" rel="noopener noreferrer" className="ctp-channels__x">
                <XLogo size={13} /> @ForceXHQ
              </a>
            </li>
          </ul>
          <p className="ctp-fine">OMIED LLC d/b/a ForceX.com · Texas, United States</p>
        </footer>
      </div>
    </section>
  );
}
