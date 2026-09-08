import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import type { LegalDoc } from "@/content/legal";

/**
 * Legal documents on the compact docs construction shared with Data
 * Quality, MCP and the API docs: kicker, title and one line of lead on the
 * left, the version pill and the sibling documents on the right, then the
 * page map beside the text. Section ids are derived from the numbered
 * headings in the source HTML, which is otherwise rendered verbatim.
 */

const DOCS: { href: string; title: string; lead: string }[] = [
  { href: "/terms", title: "Terms of Service", lead: "The agreement that governs access to and use of ForceX websites, APIs, data products, and related services." },
  { href: "/privacy", title: "Privacy Policy", lead: "What ForceX collects, how it is used and shared, how long it is kept, and the choices and rights available to you." },
  { href: "/beta-terms", title: "Beta Access Terms", lead: "The additional terms that apply to invite-only, beta, and pre-release features while they remain in testing." },
];

const slug = (text: string, i: number) => {
  const m = text.match(/^(\d+)\./);
  if (m) return `s-${m[1]}`;
  const s = text
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `s-${i + 1}`;
};

function prepare(html: string) {
  const toc: { id: string; label: string }[] = [];
  let i = 0;
  const out = html.replace(/<h2>([^<]*)<\/h2>/g, (_, text: string) => {
    const id = slug(text, i);
    i += 1;
    toc.push({ id, label: text.replace(/^\d+\.\s*/, "") });
    return `<h2 id="${id}" class="h3">${text}</h2>`;
  });
  return { toc, out };
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const self = DOCS.find((d) => d.title === doc.title);
  const others = DOCS.filter((d) => d.title !== doc.title);
  const [rawVersion, rawUpdated] = doc.meta.split(/\s*&mdash;\s*/);
  const version = rawVersion.replace(/^Version\s+/i, "v");
  const updated = (rawUpdated ?? "").replace(/^Last updated\s+/i, "Updated ");
  const { toc, out } = prepare(doc.html);

  return (
    <div className="xtp dcp dcp--legal">
      <header className="dcp-head" aria-label={doc.title}>
        <div className="container dcp-head__row" data-reveal="fade">
          <div className="dcp-head__copy">
            <span className="eyebrow xtp-eyebrow dcp-head__kicker">Legal</span>
            <h1 className="dcp-head__title">{doc.title}</h1>
            {self && <p className="dcp-head__sub">{self.lead}</p>}
          </div>
          <div className="dcp-head__aside">
            <span className="dcp-head__status mono">
              <span className="xtp-dot" aria-hidden="true" />
              <span>{version}</span>
              <i className="dcp-head__sep" aria-hidden="true" />
              <span dangerouslySetInnerHTML={{ __html: updated ?? "" }} />
            </span>
            {others.map((d) => (
              <Link key={d.href} href={d.href} className="dcp-head__status dcp-head__link mono">
                <span>{d.title}</span>
                <ArrowUpRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="xtp-sec xtp-sec--rule dcp-docs">
        <div className="container docs">
          <nav className="docs__toc" aria-label="On this page">
            <h5>Sections</h5>
            {toc.map((t) => (
              <a key={t.id} href={`#${t.id}`}>
                {t.label}
              </a>
            ))}
          </nav>
          <article className="docs__body prose legal-body" dangerouslySetInnerHTML={{ __html: out }} />
        </div>
      </section>
    </div>
  );
}
