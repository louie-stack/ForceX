import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Search, Shield } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Who We Are",
  description: "ForceX exists to bring trust back to on-chain data. A quality-first on-chain intelligence platform built to make blockchain data more trustworthy, explainable, and useful.",
};

/**
 * Who we are. Every line is the published forcex.com/about copy, in its
 * original order.
 *
 * Construction after base.org: a centered hero with small scattered tick
 * marks; a row of 12px-radius cards with 1px borders and a line icon
 * top-left; a tonal band with dotted flanks and a centered heading over a
 * row of items divided by hairlines; two-tone statements set left; wide
 * bordered illustration boxes with the caption beneath; rounded cards
 * with an image area on top; one solid blue band. Motion is the site's
 * reveal only.
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

/* Base's scattered tick marks: a few thin vertical bars in the brand hues,
   placed around the hero at low opacity. Decorative only. */
const TICKS: [number, number, number, string][] = [
  [8, 14, 26, "var(--accent)"],
  [10, 22, 14, "var(--xtract)"],
  [12.5, 18, 40, "var(--accent)"],
  [22, 40, 18, "var(--good)"],
  [24, 36, 30, "var(--accent)"],
  [26, 44, 12, "var(--xtract)"],
  [54, 8, 28, "var(--xtract)"],
  [56, 4, 44, "var(--accent)"],
  [58, 10, 22, "var(--good)"],
  [76, 30, 16, "var(--accent)"],
  [78, 26, 34, "var(--xtract)"],
  [88, 62, 20, "var(--good)"],
  [90, 58, 36, "var(--accent)"],
  [92, 66, 14, "var(--accent)"],
];

/** The two approaches, as a line illustration in a bordered box. */
function Approaches() {
  const w = 900;
  const x0 = 60;
  const gap = (w - 2 * x0) / (FORCEX.length - 1);
  return (
    <svg className="abt-fig__svg" viewBox={`0 0 ${w} 300`} role="img" aria-label="Traditional approach: Parse, Store, Display. ForceX approach: Parse, Store, Reconcile, Validate, Cross-check, Verify. Only then is data worthy of display.">
      <text x={x0} y={48} className="abt-fig__label">
        TRADITIONAL APPROACH
      </text>
      <line x1={x0} y1={86} x2={x0 + gap * (TRADITIONAL.length - 1)} y2={86} className="abt-fig__line abt-fig__line--dim" />
      {TRADITIONAL.map((s, i) => (
        <g key={s} transform={`translate(${x0 + gap * i} 86)`}>
          <rect x={-6} y={-6} width={12} height={12} rx={2} className="abt-fig__node abt-fig__node--dim" />
          <text x={0} y={34} textAnchor="middle" className="abt-fig__step abt-fig__step--dim">
            {s}
          </text>
        </g>
      ))}
      <g transform={`translate(${x0 + gap * (TRADITIONAL.length - 1) + 30} 86)`} className="abt-fig__end">
        <line x1={-6} y1={-6} x2={6} y2={6} />
        <line x1={6} y1={-6} x2={-6} y2={6} />
      </g>

      <text x={x0} y={176} className="abt-fig__label abt-fig__label--on">
        FORCEX APPROACH
      </text>
      <line x1={x0} y1={214} x2={w - x0} y2={214} className="abt-fig__line abt-fig__line--on" />
      {FORCEX.map((s, i) => {
        const last = i === FORCEX.length - 1;
        return (
          <g key={s} transform={`translate(${x0 + gap * i} 214)`}>
            {last ? <circle r={8} className="abt-fig__node abt-fig__node--good" /> : <rect x={-6} y={-6} width={12} height={12} rx={2} className="abt-fig__node abt-fig__node--on" />}
            <text x={0} y={34} textAnchor="middle" className={`abt-fig__step ${last ? "abt-fig__step--good" : ""}`}>
              {s}
            </text>
          </g>
        );
      })}
      <text x={w - x0} y={278} textAnchor="end" className="abt-fig__note">
        Only then is data worthy of display.
      </text>
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="abt">
      {/* Hero: centered. */}
      <section className="abt-hero" aria-label="Who we are">
        <div className="abt-ticks" aria-hidden="true">
          {TICKS.map(([x, y, h, c], i) => (
            <i key={i} style={{ left: `${x}%`, top: `${y}%`, height: h, background: c, color: c }} />
          ))}
        </div>
        <div className="container abt-hero__in">
          <span className="abt-over" data-reveal="fade">
            Who we are
          </span>
          <h1 className="abt-hero__title" data-reveal>
            ForceX exists to bring trust back to on-chain data.
          </h1>
          <p className="abt-hero__lead" data-reveal style={{ ["--d" as string]: "140ms" }}>
            ForceX is a <b>quality-first</b> on-chain intelligence platform built to make blockchain data more{" "}
            <b>trustworthy</b>, <b>explainable</b>, and <b>useful</b>.
          </p>
        </div>
      </section>

      {/* Principles: the card row. */}
      <section className="abt-sec abt-sec--tight" aria-label="Principles">
        <div className="container abt-cards3">
          {PRINCIPLES.map(({ Icon, title, body }, i) => (
            <div key={title} className="abt-card" data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
              <span className="abt-card__ico">
                <Icon size={22} />
              </span>
              <h3 className="abt-card__t">{title}</h3>
              <p className="abt-card__b">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Approach: tonal band, dotted flanks, centered statement. */}
      <section className="abt-band" aria-label="Our approach">
        <div className="abt-band__dots abt-band__dots--l" aria-hidden="true" />
        <div className="abt-band__dots abt-band__dots--r" aria-hidden="true" />
        <div className="container abt-band__in">
          <h2 className="abt-band__title" data-reveal>
            We go beyond traditional explorers by applying a structured data quality framework to the way on-chain data is
            parsed, reconciled, validated, cross-checked, and displayed.
          </h2>
          <p className="abt-band__lead" data-reveal style={{ ["--d" as string]: "120ms" }}>
            Starting with Litecoin, ForceX is building the foundation for a broader suite of blockchain intelligence
            products.
          </p>
        </div>
      </section>

      {/* Not just another explorer: two-tone statement, then the illustration box with caption. */}
      <section className="abt-sec" aria-label="Not just another explorer">
        <div className="container">
          <h2 className="abt-statement" data-reveal>
            Not just another explorer. <span className="dim">A blockchain explorer can show you what happened. ForceX is built to help prove that what is being shown is correct.</span>
          </h2>
          <figure className="abt-feature abt-feature--wide" data-reveal>
            <div className="abt-fig">
              <Approaches />
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
            </div>
            <figcaption className="abt-feature__cap abt-feature__cap--2">
              <p>
                On-chain data is often treated as self-evident, but the way data is parsed, indexed, transformed, stored,
                and displayed introduces risk.
              </p>
              <p>
                Bad joins, missed edge cases, incomplete reconciliation, improper supply logic, stale metadata, broken
                derived tables, and unvalidated calculations can all create misleading results.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Foundation: two feature blocks side by side. */}
      <section className="abt-sec" aria-label="Our foundation is data quality">
        <div className="container">
          <h2 className="abt-statement" data-reveal>
            Our foundation is data quality. <span className="dim">ForceX was built around a formal data quality framework designed and developed by Omied Sadeghi, ISO 8000 Certified Master Data Quality Manager.</span>
          </h2>
          <div className="abt-features2">
            <figure className="abt-feature" data-reveal>
              <div className="abt-fig abt-fig--dots">
                <div className="abt-isoplate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/iso-logo.svg" alt="ISO" width={84} height={68} />
                </div>
                <span className="abt-fig__stat">
                  <b>ISO 8000</b>
                  <span>Certified Master Data Quality Manager</span>
                </span>
              </div>
              <figcaption className="abt-feature__cap">
                <h3>A formal framework, not a feature</h3>
                <p>
                  This framework influences how data is sourced, structured, calculated, validated, and exposed, ensuring
                  users receive data with clear evidence that it has passed meaningful quality controls.
                </p>
              </figcaption>
            </figure>
            <figure className="abt-feature" data-reveal style={{ ["--d" as string]: "120ms" }}>
              <div className="abt-fig abt-fig--quote">
                <p>
                  The goal is not simply to publish blockchain data faster. The goal is to publish blockchain data with{" "}
                  <span className="hi">clear evidence</span> that it has passed meaningful quality controls.
                </p>
              </div>
              <figcaption className="abt-feature__cap">
                <h3>Why quality matters in blockchain data</h3>
                <p>
                  Every platform makes decisions about how it extracts, interprets, and presents chain data. Those
                  decisions affect what users see.
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Why: a card grid, numbered like the stat labels, ending in the blue card. */}
      <section className="abt-sec abt-sec--tight" aria-label="What can depend on the platform">
        <div className="container abt-cards3">
          {WHY.map((w, i) => (
            <div key={w} className="abt-card" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
              <span className="abt-card__n">0{i + 1}</span>
              <p className="abt-card__b abt-card__b--lg">{w}</p>
            </div>
          ))}
          <div className="abt-card abt-card--blue" data-reveal style={{ ["--d" as string]: "350ms" }}>
            <p className="abt-card__b abt-card__b--lg">
              ForceX is built to reduce those risks. We believe users deserve to know the quality behind the data.
            </p>
          </div>
        </div>
      </section>

      {/* Controls: statement, then the card grid. */}
      <section className="abt-sec" aria-label="Built for transparency and accountability">
        <div className="container">
          <h2 className="abt-statement" data-reveal>
            Built for transparency and accountability. <span className="dim">ForceX makes data quality visible. We do not just show outputs; we expose the controls and methodology behind them.</span>
          </h2>
          <div className="abt-cards3">
            {CONTROLS.map(([t, b], i) => (
              <div key={t} className="abt-card" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <span className="abt-card__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="abt-card__t">{t}</h3>
                <p className="abt-card__b">{b}</p>
              </div>
            ))}
          </div>
          <p className="abt-after" data-reveal>
            This is how ForceX turns blockchain data from something merely displayed into something supported by evidence.
          </p>
        </div>
      </section>

      {/* Litecoin: the blue band. */}
      <section className="abt-blue" aria-label="Starting with Litecoin">
        <div className="abt-blue__bars" aria-hidden="true" />
        <div className="container abt-blue__in">
          <span className="abt-over abt-over--onblue" data-reveal="fade">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/litecoin-icon.svg" alt="" width={14} height={14} />
            Starting with Litecoin
          </span>
          <h2 className="abt-blue__title" data-reveal>
            Litecoin is the starting point. The standard is the product.
          </h2>
          <div className="abt-blue__cols">
            {LITECOIN.map((p, i) => (
              <p key={i} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Surfaces: rounded cards with an image area on top. */}
      <section className="abt-sec" aria-label="Our platform surfaces">
        <div className="container">
          <div className="abt-rowhead">
            <h2 className="abt-h2" data-reveal>
              Our platform surfaces.
            </h2>
            <p className="abt-rowhead__lead" data-reveal>
              Three products. One quality-first foundation.
            </p>
          </div>
          <div className="abt-cards3">
            {SURFACES.map((s, i) => (
              <Link key={s.name} href={s.href} className="abt-release" data-reveal style={{ ["--tint" as string]: s.tint, ["--d" as string]: `${i * 90}ms` }}>
                <div className="abt-release__img" aria-hidden="true">
                  <span className="abt-release__mark">
                    {s.name.slice(0, 1)}
                    <em>{s.name.slice(1)}</em>
                  </span>
                </div>
                <div className="abt-release__body">
                  <h3>{s.name}</h3>
                  <p>{s.body}</p>
                  <span className="abt-release__cta">
                    {s.cta}
                    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Belief: the tonal band with the row of five. */}
      <section className="abt-band" aria-label="Our belief">
        <div className="abt-band__dots abt-band__dots--l" aria-hidden="true" />
        <div className="abt-band__dots abt-band__dots--r" aria-hidden="true" />
        <div className="container abt-band__in">
          <span className="abt-over" data-reveal="fade">
            Our belief
          </span>
          <h2 className="abt-band__title abt-band__title--sm" data-reveal>
            Trust is earned through process, not branding.
          </h2>
          <ol className="abt-stats">
            {BELIEF.map((b, i) => (
              <li key={b} data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <span className="abt-stats__v">0{i + 1}</span>
                <span className="abt-stats__l">{b}</span>
              </li>
            ))}
          </ol>
          <p className="abt-band__lead" data-reveal>
            ForceX is built for serious users who expect more from blockchain data.
          </p>
        </div>
      </section>

      {/* Close. */}
      <section className="abt-sec abt-close" aria-label="Closing statement">
        <div className="container">
          <p className="abt-statement abt-statement--center" data-reveal>
            Data should not become trusted simply because it is displayed. <span className="dim">It should become trusted because it has been verified, governed, and made worthy of confidence.</span>
          </p>
        </div>
      </section>
    </div>
  );
}
