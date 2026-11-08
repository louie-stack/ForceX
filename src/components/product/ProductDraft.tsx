import Link from "next/link";
import type { ReactNode } from "react";
import { Magnetic } from "@/components/fx/Magnetic";
import { ArrowUpRight } from "@/components/Icons";

/**
 * DRAFT template for the Scout and Sentinel product pages.
 *
 * Built in the About/Xtract house system (vg__ opener, xtp- hairline
 * sections, numbered grid, band statement, close) so the final pages only
 * need their copy and logo swapped in. All wording is taken from Omied's
 * description on the 2026-10-28 call and is placeholder until the
 * one-sheets arrive. The pages are unlisted (not in the nav or sitemap)
 * and noindex; remove the draft bar and `robots` when they go live.
 */

export interface DraftItem {
  Icon: (p: { size?: number }) => ReactNode;
  title: string;
  body: string;
}

export interface ProductDraftProps {
  name: string;
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  items: DraftItem[];
  itemsEyebrow: string;
  itemsTitle: ReactNode;
  statementEyebrow: string;
  statement: ReactNode;
  closeTitle: ReactNode;
  closeLead: string;
}

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

export function ProductDraft(p: ProductDraftProps) {
  const slug = p.name.toLowerCase();
  return (
    <div className="abt prd">
      <div className="prd-draft mono" role="note">
        <span className="prd-draft__dot" aria-hidden="true" />
        Draft for review · wording from the 28 Oct call · final copy and logo come from the {p.name} one-sheet
      </div>

      <section className="xtp-sec abt-hero" aria-labelledby={`${slug}-title`}>
        <div className="container">
          <header className="abt-hero__copy" data-reveal="fade">
            <span className="prd-logo" aria-label={`${p.name} logo, to come`}>
              <span className="mono">Logo</span>
            </span>
            <span className="vg__kicker mono">
              <span className="pulse" />
              {p.kicker}
            </span>
            <h1 className="vg__title abt-title" id={`${slug}-title`}>
              {p.title}
            </h1>
            <p className="vg__lead abt-lead">{p.lead}</p>
          </header>
        </div>
      </section>

      <section className="xtp-sec xtp-sec--rule" aria-labelledby={`${slug}-how`}>
        <div className="container">
          <div className="xtp-head">
            <div>
              <span className="eyebrow xtp-eyebrow" data-reveal="fade">
                {p.itemsEyebrow}
              </span>
              <h2 className="xtp-h2" id={`${slug}-how`} data-reveal>
                {p.itemsTitle}
              </h2>
            </div>
          </div>
          <div className="xtp-grid xtp-grid--3">
            {p.items.map(({ Icon, title, body }, i) => (
              <div key={title} className="xtp-item" data-reveal style={d(i * 80)}>
                <div className="xtp-item__top">
                  <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="xtp-item__ico">
                    <Icon size={20} />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="xtp-sec xtp-sec--rule xtp-sec--band" aria-label={p.statementEyebrow}>
        <div className="container">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            {p.statementEyebrow}
          </span>
          <p className="abt-statement" data-reveal>
            {p.statement}
          </p>
        </div>
      </section>

      <section className="xtp-close" aria-label={`Talk to us about ${p.name}`}>
        <div className="container">
          <h2 className="xtp-close__title" data-reveal>
            {p.closeTitle}
          </h2>
          <p className="xtp-lead" data-reveal style={d(120)}>
            {p.closeLead}
          </p>
          <div className="xtp-close__actions" data-reveal style={d(200)}>
            <Magnetic>
              <Link href="/contact" className="btn btn--accent btn--lg">
                Contact us
                <span className="btn__ico">
                  <ArrowUpRight />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/xtract" className="btn btn--ghost btn--lg">
                Get API access
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
