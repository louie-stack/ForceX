import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { FooterStatus } from "./FooterStatus";
import { HeroGate } from "./fx/HeroGate";

/**
 * Sign-in and sign-up share this shell. The side panel repeats the home
 * hero: the kicker, the title with its highlight, the lead, and the
 * verification gate running beneath. Pages may swap the kicker text.
 */
export function AuthShell({ children, kicker = "Litecoin on-chain intelligence" }: { children: ReactNode; kicker?: string }) {
  return (
    <section className="auth">
      <aside className="auth__side" data-gate>
        <HeroGate className="auth__gl" variant="page" />
        <div className="auth__veil" />
        <div className="auth__copy">
          <span className="vg__kicker mono">
            <span className="pulse" />
            {kicker}
          </span>
          <h2 className="vg__title auth__title">
            Blockchain <span className="vg__hi">Intelligence</span>
            <span className="vg__line">Platform</span>
          </h2>
          <p className="vg__lead auth__lead">Explore verified on-chain data you can trust.</p>
        </div>
        <div style={{ position: "relative" }}>
          <FooterStatus />
        </div>
      </aside>
      <div className="auth__form">
        <div>
          <Link href="/" aria-label="ForceX home" style={{ display: "inline-block", color: "var(--text)", marginBottom: 36 }}>
            <Wordmark height={18} />
          </Link>
          {children}
        </div>
      </div>
    </section>
  );
}
