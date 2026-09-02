import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { FooterStatus } from "./FooterStatus";

export function AuthShell({ children, quote, eyebrow }: { children: ReactNode; quote: ReactNode; eyebrow: string }) {
  return (
    <section className="auth">
      <aside className="auth__side">
        <div className="glow" style={{ top: "-20%", left: "-20%", width: "70%", height: "70%" }} />
        <div className="grid-bg" />
        <div style={{ position: "relative" }}>
          <span className="eyebrow">{eyebrow}</span>
          <p className="auth__side-quote" style={{ margin: "20px 0 0" }}>
            {quote}
          </p>
        </div>
        <div style={{ position: "relative" }}>
          <FooterStatus />
          <p className="small" style={{ marginTop: 16 }}>
            Every ForceX surface reads from data that has already passed validation.{" "}
            <Link href="/data-quality" style={{ color: "var(--text)" }}>
              How it works
            </Link>
          </p>
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
