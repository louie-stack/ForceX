import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { XLogo } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about ForceX, beta access, the data platform, or anything else? Send the team a message.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        tint="accent"
        visual="block"
        shape="sphere"
        compact
        eyebrow="Contact"
        title={
          <>
            Reach the ForceX <span className="hi">team</span>.
          </>
        }
        lead="Questions about ForceX, beta access, or the platform. We reply to every message."
      />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container split">
          <div className="split__sticky" style={{ display: "grid", gap: 24 }}>
            <div className="card" style={{ padding: 24, display: "grid", gap: 8 }}>
              <span className="eyebrow eyebrow--plain">Email</span>
              <a href="mailto:contact@forcex.com" className="h4" style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                contact@forcex.com
              </a>
            </div>
            <div className="card" style={{ padding: 24, display: "grid", gap: 8 }}>
              <span className="eyebrow eyebrow--plain">Social</span>
              <a href="https://x.com/ForceXHQ" target="_blank" rel="noopener noreferrer" className="link-arrow">
                <XLogo size={14} /> @ForceXHQ
              </a>
            </div>
            <div className="card" style={{ padding: 24, display: "grid", gap: 8 }}>
              <span className="eyebrow eyebrow--plain">Company</span>
              <p className="small" style={{ margin: 0 }}>
                OMIED LLC d/b/a ForceX.com
                <br />
                Texas, United States
              </p>
            </div>
          </div>
          <div className="card" style={{ padding: "clamp(24px, 3vw, 40px)" }} data-reveal>
            <h2 className="h3" style={{ margin: "0 0 24px" }}>
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
