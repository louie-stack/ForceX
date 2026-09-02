import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { FooterStatus } from "./FooterStatus";
import { BlockClient } from "./fx/BlockClient";

export function AuthShell({ children, quote, eyebrow }: { children: ReactNode; quote: ReactNode; eyebrow: string }) {
  return (
    <section className="auth">
      <aside className="auth__side">
        <BlockClient className="auth__gl" mode="morph" scale={1} x={0} y={-0.4} density={22} opacity={0.85} />
        <div className="auth__veil" />
        <div style={{ position: "relative" }}>
          <span className="eyebrow">{eyebrow}</span>
          <p className="auth__side-quote" style={{ margin: "20px 0 0" }}>
            {quote}
          </p>
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
