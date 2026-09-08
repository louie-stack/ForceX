import { XLogo } from "@/components/Icons";
import { Composer } from "@/components/contact/Composer";
import { Streams } from "@/components/fx/scenes/Streams";

/**
 * The whole page: the data streams from the API docs run full-bleed
 * behind it, tinted to the company accent, so a message reads as one more
 * thing entering the network. Headline and channels sit left; the form
 * floats right on glass so the streams pass behind it.
 */
export function Hero() {
  return (
    <section className="xtp-sec ctp-hero" aria-label="Contact ForceX">
      <Streams className="ctp-scene" tint="#3b82f6" tintLight="#2563eb" />
      <div className="ctp-veil" aria-hidden="true" />
      <div className="container ctp-hero__grid">
        <div className="ctp-hero__copy">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Contact
          </span>
          <h1 className="xtp-h1" data-reveal-lines>
            <span className="line">
              <span>Get in</span>
            </span>
            <span className="line">
              <span>
                <em>touch.</em>
              </span>
            </span>
          </h1>
          <p className="xtp-lead xtp-hero__lead" data-reveal style={{ ["--d" as string]: "220ms" }}>
            Every message is read by a person and gets a reply.
          </p>

          <dl className="ctp-channels" data-reveal style={{ ["--d" as string]: "320ms" }}>
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:contact@forcex.com" className="mono ctp-channels__mail">
                  contact@forcex.com
                </a>
              </dd>
            </div>
            <div>
              <dt>Social</dt>
              <dd>
                <a href="https://x.com/ForceXHQ" target="_blank" rel="noopener noreferrer" className="ctp-channels__x">
                  <XLogo size={13} /> @ForceXHQ
                </a>
              </dd>
            </div>
          </dl>
          <p className="ctp-fine" data-reveal style={{ ["--d" as string]: "400ms" }}>
            OMIED LLC d/b/a ForceX.com · Texas, United States
          </p>
        </div>

        <Composer />
      </div>
    </section>
  );
}
