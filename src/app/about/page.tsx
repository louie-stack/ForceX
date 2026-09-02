import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ArrowUpRight, Check, Layers, Search, Shield } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Who We Are",
  description: "ForceX exists to bring trust back to on-chain data. A quality-first blockchain intelligence platform built on a formal data quality framework, starting with Litecoin.",
};

const PRINCIPLES = [
  { Icon: Shield, title: "Trust by design", body: "Data is reconciled, validated, cross-checked, and governed before it is displayed." },
  { Icon: Search, title: "Transparency", body: "We expose methodology, controls, and lineage so users understand what they are seeing." },
  { Icon: Layers, title: "Accountability", body: "Our quality framework ensures accuracy, consistency, and confidence in the data users rely on." },
];

const CONTROLS = [
  ["Reconciliation", "Ensure internal consistency across related data."],
  ["Validation", "Apply structured checks to confirm values match expected behavior and rules."],
  ["Cross-checking", "Compare critical data against independent sources or node-level references."],
  ["Governance", "Separate source-native data from derived calculations so users know where values come from."],
  ["Traceability", "Explain important metrics back to their underlying data and calculation basis."],
  ["Public control language", "Provide clear explanations of what is verified, why it matters, and what risks are prevented."],
];

const WHY = [
  "A supply figure may depend on whether the platform uses scheduled issuance or actual miner-claimed subsidy.",
  "A transaction chart may depend on how the platform handles reorgs, duplicates, or null outputs.",
  "An address balance may depend on whether the UTXO state has been properly reconciled.",
  "A daily network metric may depend on how missing data, synthetic values, or late corrections are handled.",
  "An analytics panel may look authoritative even when the underlying calculation has not been independently verified.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title={
          <>
            ForceX exists to bring <em className="serif">trust</em> back to on-chain data.
          </>
        }
        lead="ForceX is a quality-first on-chain intelligence platform built to make blockchain data more trustworthy, explainable, and useful. We go beyond traditional explorers by applying a structured data quality framework to the way on-chain data is parsed, reconciled, validated, cross-checked, and displayed."
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="values">
            {PRINCIPLES.map(({ Icon, title, body }, i) => (
              <div key={title} className="value" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <span className="value__ico">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section quality">
        <div className="container split">
          <div className="split__sticky">
            <span className="eyebrow" data-reveal="fade">
              Our foundation
            </span>
            <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
              Our foundation is data quality.
            </h2>
            <p className="lead" data-reveal style={{ marginTop: 22 }}>
              ForceX was built around a formal data quality framework designed and developed by Omied Sadeghi, ISO 8000
              Certified Master Data Quality Manager. It influences how data is sourced, structured, calculated, validated,
              and exposed.
            </p>
            <div className="badge-iso" data-reveal>
              <b>ISO 8000</b>
              <span>Certified Master Data Quality Manager</span>
            </div>
          </div>
          <div>
            <div className="quote-card" data-reveal="scale">
              <blockquote>
                The goal is not simply to publish blockchain data faster. The goal is to publish blockchain data with{" "}
                <em className="serif">clear evidence</em> that it has passed meaningful quality controls.
              </blockquote>
              <cite>ForceX founding principle</cite>
            </div>
            <h3 className="h3" data-reveal style={{ margin: "56px 0 20px" }}>
              Why quality matters in blockchain data
            </h3>
            <p className="body" data-reveal>
              Every platform makes decisions about how it extracts, interprets, and presents chain data. Those decisions
              affect what users see.
            </p>
            <ul className="dev__list" data-reveal>
              {WHY.map((w) => (
                <li key={w}>
                  <Check size={18} />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            <p className="body" data-reveal style={{ marginTop: 20 }}>
              ForceX is built to reduce those risks. We believe users deserve to know the quality behind the data.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal="fade">
                Built for transparency and accountability
              </span>
              <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
                We do not just show outputs. We expose the controls and methodology behind them.
              </h2>
            </div>
          </div>
          <div className="list-rows" data-reveal>
            {CONTROLS.map(([t, b]) => (
              <div key={t} className="list-row">
                <h4>{t}</h4>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <p className="lead" data-reveal style={{ marginTop: 32, maxWidth: 680 }}>
            This is how ForceX turns blockchain data from something merely displayed into something supported by evidence.
          </p>
        </div>
      </section>

      <section className="section quality">
        <div className="container statement__grid">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Starting with Litecoin
            </span>
            <h2 className="statement__quote" data-reveal style={{ marginTop: 22 }}>
              Litecoin is the starting point. The <em className="serif">standard</em> is the product.
            </h2>
          </div>
          <div data-reveal style={{ ["--d" as string]: "100ms" }}>
            <p className="lead">
              Litecoin is one of the longest-running proof-of-work networks with deep liquidity, global usage, fast
              settlement, low fees, and a history of real payment activity. Yet much of the available public Litecoin data
              remains fragmented and under-governed.
            </p>
            <p className="body" style={{ marginTop: 20 }}>
              ForceX is building a more rigorous data layer for Litecoin first, including explorer functionality, analytics,
              data quality controls, supply methodology, MWEB-aware visibility, API services, and institutional-grade
              reporting foundations.
            </p>
            <div className="hero__actions" style={{ marginTop: 28 }}>
              <Link href="/xplorer/litecoin" className="btn btn--ghost">
                Open the Litecoin explorer
                <span className="btn__ico">
                  <ArrowUpRight />
                </span>
              </Link>
              <Link href="/data-quality" className="btn btn--ghost">
                Read the methodology
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Built for serious users"
        title="Data should become trusted because it has been verified, governed, and made worthy of confidence."
        body="ForceX is built for people who expect more from blockchain data. Create a free account and see the difference."
        secondary={{ href: "/contact", label: "Talk to the team" }}
      />
    </>
  );
}
