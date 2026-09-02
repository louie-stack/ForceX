import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { XLogo } from "./Icons";
import { FX_APP_ORIGIN } from "@/lib/api";
import { FooterStatus } from "./FooterStatus";

export function Footer() {
  const year = new Date().getUTCFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link href="/" aria-label="ForceX home" style={{ display: "inline-block", color: "var(--text)" }}>
              <Wordmark height={18} />
            </Link>
            <p className="body" style={{ maxWidth: 340, marginTop: 20 }}>
              Quality first on-chain intelligence. Built for accuracy, transparency, and trust.
            </p>
            <FooterStatus />
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link href="/xplorer/litecoin">Xplorer</Link></li>
              <li><Link href="/xamine">Xamine</Link></li>
              <li><Link href="/xtract">Xtract</Link></li>
              <li><Link href="/xtract/docs/mcp">MCP Server</Link></li>
              <li><a href={`${FX_APP_ORIGIN}/xamine/diagrams/address-relationships`}>Address LinX</a></li>
            </ul>
          </div>
          <div>
            <h4>Data Quality</h4>
            <ul>
              <li><Link href="/data-quality">How we verify data</Link></li>
              <li><Link href="/data-quality#catalog">Public control catalog</Link></li>
              <li><Link href="/about">Who we are</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/beta-terms">Beta Terms</Link></li>
              <li><Link href="/signin">Sign in</Link></li>
              <li><Link href="/signup">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div data-reveal="fade">
          <Wordmark className="footer__wordmark" height={0} style={{ width: "100%", aspectRatio: "1301 / 232", height: "auto" }} />
        </div>
        <div className="footer__rail">
          <p style={{ margin: 0 }}>© {year} OMIED LLC d/b/a ForceX.com. All rights reserved.</p>
          <div className="footer__social" aria-label="Social links">
            <a href="https://x.com/ForceXHQ" target="_blank" rel="noopener noreferrer" aria-label="ForceX on X">
              <XLogo />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
