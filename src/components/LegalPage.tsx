import Link from "next/link";
import type { LegalDoc } from "@/content/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <section className="page-hero" style={{ paddingBottom: "clamp(64px, 8vw, 120px)" }}>
      <div className="container">
        <Link href="/" className="link-arrow small" style={{ marginBottom: 28, display: "inline-flex" }}>
          ← Back to home
        </Link>
        <article className="prose">
          <h1>{doc.title}</h1>
          <div className="legal-meta" dangerouslySetInnerHTML={{ __html: doc.meta }} />
          <div dangerouslySetInnerHTML={{ __html: doc.html }} />
        </article>
      </div>
    </section>
  );
}
