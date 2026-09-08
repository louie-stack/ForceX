import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic } from "@/components/fx/Magnetic";
import { ArrowUpRight, Layers, Search, Shield } from "@/components/Icons";
import { Pipeline } from "@/components/about/Pipeline";

export const metadata: Metadata = {
  title: "Who We Are",
  description: "ForceX exists to bring trust back to on-chain data. A quality-first on-chain intelligence platform built to make blockchain data more trustworthy, explainable, and useful.",
};

/**
 * Who we are. Every line is the published forcex.com/about copy, in its
 * original order.
 *
 * Construction follows the rest of the site: the home hero's kicker,
 * title and lead open the page; below that the same hairline sections,
 * numbered grids and alternating bands as Xtract, closing on the
 * Xtract-style statement with two actions. One accent, used sparingly.
 * Motion is the site's reveal only.
 */

const PRINCIPLES = [
  { Icon: Shield, title: "Trust by design", body: "Data is reconciled, validated, cross-checked, and governed before it is displayed." },
  { Icon: Search, title: "Transparency", body: "We expose methodology, controls, and lineage so users understand what they are seeing." },
  { Icon: Layers, title: "Accountability", body: "Our quality framework ensures accuracy, consistency, and confidence in the data users rely on." },
];

const TRADITIONAL = ["Parse", "Store", "Display"];
const FORCEX = ["Parse", "Store", "Reconcile", "Validate", "Cross-check", "Verify"];

const WHY = [
  "A supply figure may depend on whether the platform uses scheduled issuance or actual miner-claimed subsidy.",
  "A transaction chart may depend on how the platform handles reorgs, duplicates, or null outputs.",
  "An address balance may depend on whether the UTXO state has been properly reconciled.",
  "A daily network metric may depend on how missing data, synthetic values, or late corrections are handled.",
  "An analytics panel may look authoritative even when the underlying calculation has not been independently verified.",
];

const CONTROLS = [
  ["Reconciliation", "Ensure internal consistency across related data."],
  ["Validation", "Apply structured checks to confirm values match expected behavior and rules."],
  ["Cross-checking", "Compare critical data against independent sources or node-level references."],
  ["Governance", "Separate source-native data from derived calculations so users know where values come from."],
  ["Traceability", "Explain important metrics back to their underlying data and calculation basis."],
  ["Public control language", "Provide clear explanations of what is verified, why it matters, and what risks are prevented."],
];

const LITECOIN = [
  "Litecoin is one of the longest-running proof-of-work networks with deep liquidity, global usage, fast settlement, low fees, and a history of real payment activity.",
  "Yet much of the available public Litecoin data remains fragmented and under-governed.",
  "ForceX is building a more rigorous data layer for Litecoin first, including explorer functionality, analytics, data quality controls, supply methodology, MWEB-aware visibility, API services, and institutional-grade reporting foundations.",
];

const SURFACES = [
  { href: "/xplorer/litecoin", name: "Xplorer", tint: "var(--xplorer)", body: "The blockchain explorer surface. Inspect blocks, transactions, addresses, network activity, supply values, MWEB data, and chain details with clarity and confidence.", cta: "Explore on-chain data" },
  { href: "/xamine", name: "Xamine", tint: "var(--xamine)", body: "The analytics and intelligence surface. Analyze trends, relationships, supply, network behavior, and address activity with governed, trusted data.", cta: "Dive into analytics" },
  { href: "/xtract", name: "Xtract", tint: "var(--xtract)", body: "The API and data services layer. Reliable, programmatic access to trusted on-chain data for builders, analysts, wallets, and institutions.", cta: "Build with ForceX" },
];

const BELIEF = ["Design the data model correctly.", "Validate before display.", "Document methodology.", "Expose control logic clearly.", "Make the quality results visible."];

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

export default function AboutPage() {
  return (
    <div className="abt">
      {/* Opener: the home hero's copy block, centred, with the three
          principles beneath it as the page's first artifact. */}
      <section className="xtp-sec abt-hero" aria-labelledby="abt-title">
        <div className="container">
          <header className="abt-hero__copy" data-reveal="fade">
            <span className="vg__kicker mono">
              <span className="pulse" />
              Who we are
            </span>
            <h1 className="vg__title abt-title" id="abt-title">
              ForceX exists to bring <span className="vg__hi">trust</span> back to on-chain data.
            </h1>
            <p className="vg__lead abt-lead">
              ForceX is a <b>quality-first</b> on-chain intelligence platform built to make blockchain data more{" "}
              <b>trustworthy</b>, <b>explainable</b>, and <b>useful</b>.
            </p>
          </header>

          <div className="xtp-grid xtp-grid--3 abt-principles">
            {PRINCIPLES.map(({ Icon, title, body }, i) => (
              <div key={title} className="xtp-item" data-reveal style={d(i * 90)}>
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

      {/* Approach: a band with one two-tone statement. */}
      <section className="xtp-sec xtp-sec--rule xtp-sec--band" aria-label="Our approach">
        <div className="container">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Our approach
          </span>
          <p className="abt-statement" data-reveal>
            We go beyond traditional explorers by applying a structured data quality framework to the way on-chain data is
            parsed, reconciled, validated, cross-checked, and displayed.{" "}
            <span className="hi">
              Starting with Litecoin, ForceX is building the foundation for a broader suite of blockchain intelligence
              products.
            </span>
          </p>
        </div>
      </section>

      {/* Not just another explorer: heading, then the pipeline drawing in
          a console frame, then the two paragraphs beneath it. */}
      <section className="xtp-sec xtp-sec--rule" aria-label="Not just another explorer">
        <div className="container">
          <div className="xtp-head">
            <div>
              <span className="eyebrow xtp-eyebrow" data-reveal="fade">
                The difference
              </span>
              <h2 className="xtp-h2" data-reveal>
                Not just another explorer.
              </h2>
              <p className="xtp-lead" data-reveal style={d(80)}>
                A blockchain explorer can show you what happened. ForceX is built to help prove that what is being shown
                is correct.
              </p>
            </div>
            <Link href="/data-quality" className="link-arrow" data-reveal style={d(140)}>
              How we verify data <ArrowUpRight size={16} />
            </Link>
          </div>

          <figure className="abt-frame" data-reveal="scale" style={d(120)}>
            <div className="abt-frame__bar">
              <span className="abt-frame__k">Pipeline</span>
              <span className="abt-frame__v">traditional vs forcex</span>
              <span className="abt-frame__legend" aria-hidden="true">
                <i className="is-dot" /> clean
                <i className="is-ring" /> defect
              </span>
              <span className="abt-frame__status">
                <i aria-hidden="true" />
                Live
              </span>
            </div>
            <Pipeline />
            {/* Stacked version for narrow screens, where the drawing would shrink past legibility. */}
            <div className="abt-fig__list" aria-hidden="true">
              <div>
                <span className="abt-fig__list-label">Traditional approach</span>
                <ol className="abt-fig__steps abt-fig__steps--dim">
                  {TRADITIONAL.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
              <div>
                <span className="abt-fig__list-label abt-fig__list-label--on">ForceX approach</span>
                <ol className="abt-fig__steps">
                  {FORCEX.map((s, i) => (
                    <li key={s} className={i === FORCEX.length - 1 ? "is-good" : ""}>
                      {s}
                    </li>
                  ))}
                </ol>
                <p className="abt-fig__list-note">Only then is data worthy of display.</p>
              </div>
            </div>
            <figcaption className="abt-frame__cap">
              Same data, two pipelines. A hollow packet carries a defect. The traditional lane displays it; ForceX stops
              it at the control that catches it. Only then is data worthy of display.
            </figcaption>
          </figure>

          <div className="abt-cols abt-cols--2">
            <p data-reveal>
              On-chain data is often treated as self-evident, but the way data is parsed, indexed, transformed, stored,
              and displayed introduces risk.
            </p>
            <p data-reveal style={d(80)}>
              Bad joins, missed edge cases, incomplete reconciliation, improper supply logic, stale metadata, broken
              derived tables, and unvalidated calculations can all create misleading results.
            </p>
          </div>
        </div>
      </section>

      {/* Foundation: text left, the ISO plate right, the quote beneath. */}
      <section className="xtp-sec xtp-sec--rule xtp-sec--band" aria-label="Our foundation is data quality">
        <div className="container xtp-two">
          <div>
            <span className="eyebrow xtp-eyebrow" data-reveal="fade">
              Our foundation
            </span>
            <h2 className="xtp-h2" data-reveal>
              Our foundation is data quality.
            </h2>
            <p className="xtp-lead" data-reveal style={d(80)}>
              ForceX was built around a formal data quality framework designed and developed by Omied Sadeghi, ISO 8000
              Certified Master Data Quality Manager.
            </p>
            <div className="abt-sub" data-reveal style={d(140)}>
              <h3>A formal framework, not a feature</h3>
              <p>
                This framework influences how data is sourced, structured, calculated, validated, and exposed, ensuring
                users receive data with clear evidence that it has passed meaningful quality controls.
              </p>
            </div>
          </div>

          <div className="abt-fig abt-fig--dots abt-fig--iso" data-reveal="scale" style={d(120)}>
            <div className="abt-isoplate">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/iso-logo.svg" alt="ISO" width={84} height={68} />
            </div>
            <span className="abt-fig__stat">
              <b>ISO 8000</b>
              <span>Certified Master Data Quality Manager</span>
            </span>
          </div>
        </div>
        <div className="container">
          <blockquote className="abt-quote" data-reveal>
            <p>
              The goal is not simply to publish blockchain data faster. The goal is to publish blockchain data with{" "}
              <span className="hi">clear evidence</span> that it has passed meaningful quality controls.
            </p>
          </blockquote>
        </div>
      </section>

      {/* Why quality matters: text left, the five dependencies as a
          numbered hairline list right, closing on the accent line. */}
      <section className="xtp-sec xtp-sec--rule" aria-label="Why quality matters in blockchain data">
        <div className="container xtp-two">
          <div>
            <span className="eyebrow xtp-eyebrow" data-reveal="fade">
              Why it matters
            </span>
            <h2 className="xtp-h2" data-reveal>
              Why quality matters in blockchain data.
            </h2>
            <p className="xtp-lead" data-reveal style={d(80)}>
              Every platform makes decisions about how it extracts, interprets, and presents chain data. Those decisions
              affect what users see.
            </p>
          </div>

          <div>
            <ol className="abt-list">
              {WHY.map((w, i) => (
                <li key={w} data-reveal style={d(i * 70)}>
                  <span className="abt-list__n">{String(i + 1).padStart(2, "0")}</span>
                  <span>{w}</span>
                </li>
              ))}
            </ol>
            <p className="abt-callout" data-reveal style={d(380)}>
              ForceX is built to reduce those risks. We believe users deserve to know the quality behind the data.
            </p>
          </div>
        </div>
      </section>

      {/* Controls: heading and link on one baseline, then six hairline columns. */}
      <section className="xtp-sec xtp-sec--rule xtp-sec--band" aria-label="Built for transparency and accountability">
        <div className="container">
          <div className="xtp-head">
            <div>
              <span className="eyebrow xtp-eyebrow" data-reveal="fade">
                Transparency
              </span>
              <h2 className="xtp-h2" data-reveal>
                Built for transparency and accountability.
              </h2>
              <p className="xtp-lead" data-reveal style={d(80)}>
                ForceX makes data quality visible. We do not just show outputs; we expose the controls and methodology
                behind them.
              </p>
            </div>
            <Link href="/data-quality#catalog" className="link-arrow" data-reveal style={d(140)}>
              Public control catalog <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="xtp-grid xtp-grid--3">
            {CONTROLS.map(([t, b], i) => (
              <div key={t} className="xtp-item" data-reveal style={d((i % 3) * 70)}>
                <div className="xtp-item__top">
                  <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <p className="xtp-note abt-note" data-reveal>
            This is how ForceX turns blockchain data from something merely displayed into something supported by evidence.
          </p>
        </div>
      </section>

      {/* Litecoin: the accent word in the heading, three columns on hairlines. */}
      <section className="xtp-sec xtp-sec--rule" aria-label="Starting with Litecoin">
        <div className="container">
          <span className="eyebrow xtp-eyebrow abt-eyebrow--ltc" data-reveal="fade">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/litecoin-icon.svg" alt="" width={14} height={14} />
            Starting with Litecoin
          </span>
          <h2 className="xtp-h2 abt-h2--wide" data-reveal>
            Litecoin is the starting point. <em>The standard is the product.</em>
          </h2>
          <div className="abt-cols abt-cols--3 abt-cols--ruled">
            {LITECOIN.map((p, i) => (
              <p key={i} data-reveal style={d(i * 90)}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Surfaces: three hairline columns, each in its product's tint. */}
      <section className="xtp-sec xtp-sec--rule xtp-sec--band" aria-label="Our platform surfaces">
        <div className="container">
          <div className="xtp-head">
            <div>
              <span className="eyebrow xtp-eyebrow" data-reveal="fade">
                Platform
              </span>
              <h2 className="xtp-h2" data-reveal>
                Our platform surfaces.
              </h2>
              <p className="xtp-lead" data-reveal style={d(80)}>
                Three products. One quality-first foundation.
              </p>
            </div>
          </div>

          <div className="xtp-grid xtp-grid--3">
            {SURFACES.map((s, i) => (
              <Link key={s.name} href={s.href} className="xtp-item abt-surface" data-reveal style={{ ["--tint" as string]: s.tint, ...d(i * 90) }}>
                <div className="xtp-item__top">
                  <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="abt-surface__dot" aria-hidden="true" />
                </div>
                <h3>{s.name}</h3>
                <p>{s.body}</p>
                <span className="link-arrow abt-surface__cta">
                  {s.cta} <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Belief: the heading, then five on one hairline row. */}
      <section className="xtp-sec xtp-sec--rule" aria-label="Our belief">
        <div className="container">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Our belief
          </span>
          <h2 className="xtp-h2" data-reveal>
            Trust is earned through process, not branding.
          </h2>
          <ol className="xtp-grid abt-grid--5">
            {BELIEF.map((b, i) => (
              <li key={b} className="xtp-item abt-belief" data-reveal style={d(i * 70)}>
                <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="abt-belief__l">{b}</span>
              </li>
            ))}
          </ol>
          <p className="xtp-lead abt-belief__lead" data-reveal>
            ForceX is built for serious users who expect more from blockchain data.
          </p>
        </div>
      </section>

      {/* Close: the largest type on the page, two actions. */}
      <section className="xtp-close" aria-label="Closing statement">
        <div className="container">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Worthy of confidence
          </span>
          <h2 className="xtp-close__title" data-reveal-lines>
            <span className="line">
              <span>Data should not become</span>
            </span>
            <span className="line">
              <span>trusted simply because</span>
            </span>
            <span className="line">
              <span>
                it is <em>displayed.</em>
              </span>
            </span>
          </h2>
          <p className="xtp-lead" data-reveal style={d(160)}>
            It should become trusted because it has been verified, governed, and made worthy of confidence.
          </p>
          <div className="xtp-close__actions" data-reveal style={d(240)}>
            <Magnetic>
              <Link href="/xplorer/litecoin" className="btn btn--accent btn--lg">
                Explore on-chain data
                <span className="btn__ico">
                  <ArrowUpRight />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/contact" className="btn btn--ghost btn--lg">
                Talk to the team
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
