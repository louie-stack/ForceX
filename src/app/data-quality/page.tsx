import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { fetchPublic, type QualityStatus } from "@/lib/api";
import { fmtInt, timeAgo } from "@/lib/format";
import catalog from "@/content/validation-content.json";
import { ArrowUpRight } from "@/components/Icons";
import { Counter } from "@/components/Counter";

export const metadata: Metadata = {
  title: "Litecoin Data Validation: How ForceX Verifies Chain Data",
  description: "Public methodology for how ForceX verifies the integrity of the data it publishes: four layers of integrity control, 242 enforcement points, per-block validation, periodic external node confirmation, and the full public control catalog.",
};

export const revalidate = 60;

type Control = {
  domain: string;
  title: string;
  verb: string;
  meaning: string;
  what_it_checks: string;
  why_it_matters: string;
  helps_prevent: string;
  technical_basis: string;
  cadence_type: string;
};

const LAYERS = [
  ["Structural constraints", "Invalid relational states are blocked by schema design. Primary keys, foreign keys, uniqueness rules, and check constraints prevent invalid rows from being committed in the first place."],
  ["Write-path controls", "Per-block and inline checks confirm that the writer committed what it intended to write. These controls are designed to detect parser defects, partial writes, and disagreements between in-memory state and stored block-level results."],
  ["Accounting reconciliation", "Balances, totals, counts, and supply-related values are reconciled across canonical and derived data surfaces so independently built paths remain aligned."],
  ["External source cross-check", "Periodic node-level comparison confirms that ForceX is not only internally consistent, but also aligned with the Litecoin node as an independent source of truth."],
];

const FAILURES = [
  ["Internal accounting drift", "Derived balances, totals, or summaries diverging from canonical chain state."],
  ["Write-path corruption or incomplete ingestion", "Data being partially written, duplicated, omitted, or miscounted while the explorer still appears functional."],
  ["Source divergence", "The index remaining internally self-consistent while drifting from the Litecoin node's view of chain state."],
];

const FRAMEWORK = [
  [14, "post-catchup data quality rules"],
  [14, "live validation rules"],
  [14, "pre-swap validation checks before rebuilt tables are promoted"],
  [6, "post-reorg validation checks after rollback and rebuild events"],
  [4, "pre-live validation gates before live mode is entered"],
  [190, "structural database constraint enforcement points at write time"],
] as const;

export default async function DataQualityPage() {
  const status = await fetchPublic<QualityStatus>("quality/status", 60);
  const domains = catalog.domains as Record<string, { title: string; description: string }>;
  const controls = catalog.controls as Record<string, Control>;
  const order = ["monetary", "address", "block_write"];
  const validated = status?.state === "validated";

  return (
    <>
      <PageHero
        eyebrow="Data quality methodology"
        title={
          <>
            How ForceX verifies the <em className="serif">integrity</em> of published data.
          </>
        }
        lead="Four layers of integrity control, 242 enforcement points, per-block validation, periodic external node confirmation, and the full public control catalog. This is the reference guide behind the live Data Quality panel."
        actions={
          <>
            <a href="#catalog" className="btn btn--accent">
              Public control catalog
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </a>
            <Link href="/xplorer/litecoin" className="btn btn--ghost">
              See the live panel
            </Link>
          </>
        }
      />

      {/* Live status band */}
      <section className="section--tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="stats" data-reveal>
            <div className="stat">
              <span className="stat__value" style={{ color: validated ? "var(--good)" : "var(--warn)" }}>
                {status ? (validated ? "Validated" : status.state) : "Pending"}
              </span>
              <span className="stat__label">{status ? `Through block ${fmtInt(status.tip_height)}` : "Live status unavailable"}</span>
              <span className="stat__meta">{status ? `Validated ${timeAgo(status.validated_at)}` : "Status endpoint unreachable"}</span>
            </div>
            <div className="stat">
              <span className="stat__value">
                <Counter value={status?.controls.passing ?? null} />
                <small>/ {status?.controls.total ?? 14}</small>
              </span>
              <span className="stat__label">Live controls passing</span>
              <span className="stat__meta">{status ? `${status.controls_by_cadence.per_block.total} per block · ${status.controls_by_cadence.periodic_external.total} periodic` : "14 live rules"}</span>
            </div>
            <div className="stat">
              <span className="stat__value" style={{ textTransform: "capitalize" }}>
                {status?.node_cross_check.status ?? "aligned"}
              </span>
              <span className="stat__label">External node cross-check</span>
              <span className="stat__meta">{status ? `Confirmed at block ${fmtInt(status.node_cross_check.last_confirmed_block)}` : "gettxoutsetinfo comparison"}</span>
            </div>
            <div className="stat">
              <span className="stat__value">
                <Counter value={status?.node_cross_check.next_due_in_blocks ?? null} />
              </span>
              <span className="stat__label">Blocks until next node check</span>
              <span className="stat__meta">Cadence {fmtInt(status?.node_cross_check.cadence_blocks ?? 1000)} blocks</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "clamp(40px, 6vw, 80px)" }}>
        <div className="container docs">
          <nav className="docs__toc" aria-label="On this page">
            <h5>On this page</h5>
            <a href="#overview">Overview</a>
            <a href="#layers">Four layers</a>
            <a href="#failures">Failure classes</a>
            <a href="#reporting">How status is reported</a>
            <a href="#domains">Integrity domains</a>
            <a href="#framework">Framework at a glance</a>
            <a href="#live">Live validation</a>
            <a href="#evidence">Evidence</a>
            <a href="#catalog">Control catalog</a>
          </nav>

          <div className="docs__body prose">
            <h2 id="overview" className="h3" style={{ marginTop: 0 }}>
              Overview
            </h2>
            <p>
              ForceX is a data-quality-first platform. Each block we publish is evaluated through a defined control framework
              designed to verify the integrity of the published dataset. This page explains what those controls are intended
              to detect, how validation status is communicated, and how to interpret what you see in the Data Quality panel.
            </p>
            <p>
              ForceX does not simply display blockchain data. It verifies the integrity of the data it publishes through a
              governed validation framework designed to detect structural defects, write-path issues, accounting drift, and
              divergence from source truth. Each control produces a recorded result, including its outcome and the point at
              which it ran.
            </p>
            <div className="callout">
              <b>The live panel is one part of a broader control framework.</b> It reflects one visible layer of a system that
              also includes structural enforcement at write time, write-path controls during ingestion, reconciliation gates,
              rebuild safeguards, reorg validation, and external confirmation against the Litecoin node.
            </div>

            <h2 id="layers" className="h3">
              The four layers of integrity control
            </h2>
            <p>ForceX applies integrity controls across four distinct layers. Each layer is designed to detect a different class of failure.</p>
            <div className="layers" style={{ marginTop: 24 }}>
              {LAYERS.map(([t, b], i) => (
                <div key={t} className="layer" style={{ gridTemplateColumns: "56px minmax(0, 1fr)" }}>
                  <span className="layer__idx">0{i + 1}</span>
                  <div>
                    <h3 style={{ fontSize: 22 }}>{t}</h3>
                    <p style={{ marginTop: 10 }}>{b}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3>Why all four layers are required</h3>
            <p>
              No single layer is sufficient on its own. Structural enforcement can block invalid relational states, but it
              does not prove that a correctly stored result is also the correct result. Write-path controls can confirm a block
              was committed as intended, but they do not by themselves catch every longer-range accounting drift. Accounting
              reconciliation can prove independently built data paths agree, but internal consistency alone does not guarantee
              agreement with the Litecoin node. External confirmation closes that gap by testing ForceX against source truth
              outside the platform itself.
            </p>

            <h2 id="failures" className="h3">
              Three failure classes ForceX is designed to detect
            </h2>
            <p>Blockchain indexes can fail in ways that are not always visible from the user interface alone.</p>
            <div className="list-rows">
              {FAILURES.map(([t, b]) => (
                <div key={t} className="list-row">
                  <h4>{t}</h4>
                  <p>{b}</p>
                </div>
              ))}
            </div>

            <h2 id="reporting" className="h3">
              How validation status is reported
            </h2>
            <p>The Data Quality panel distinguishes between two types of validation that run on different schedules:</p>
            <ul>
              <li>
                <strong>Per-block validation.</strong> Controls that run on every newly indexed block at tip. LVR-001 through
                LVR-013 make up the live per-block trust signal applied to published data at the latest indexed block.
              </li>
              <li>
                <strong>Periodic external confirmation.</strong> A cadence-based node cross-check. LVR-014 compares the ForceX
                indexed UTXO total against the Litecoin node&apos;s <code>gettxoutsetinfo</code> at controlled checkpoint
                heights, with a default cadence of every 1,000 blocks.
              </li>
            </ul>
            <p>
              As a result, the panel may show the dataset as validated through the latest block while the next external
              confirmation is still awaiting its cadence boundary. This is intentional. The panel reflects what has been
              validated and when, without implying that every control runs at the same cadence.
            </p>

            <h2 id="domains" className="h3">
              The three integrity domains
            </h2>
            <div className="domains" style={{ marginTop: 20, gridTemplateColumns: "1fr" }}>
              {order.map((d) => (
                <div key={d} className="domain">
                  <div className="domain__head">
                    <h4>{domains[d].title}</h4>
                    <span className={`chip ${validated ? "" : "chip--pending"}`}>
                      <span className="chip__dot" />
                      {validated ? "Passing" : "Pending"}
                    </span>
                  </div>
                  <p>{domains[d].description}</p>
                </div>
              ))}
            </div>

            <h2 id="framework" className="h3">
              Control framework at a glance
            </h2>
            <p>The live rules shown in the Data Quality interface are part of a broader control framework that currently includes:</p>
            <div className="list-rows">
              {FRAMEWORK.map(([n, label]) => (
                <div key={label} className="list-row" style={{ gridTemplateColumns: "80px 1fr", alignItems: "center" }}>
                  <span className="stat__value" style={{ fontSize: 30 }}>
                    {n}
                  </span>
                  <p>{label}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 20 }}>
              Taken together, that is <strong>242 enforcement points across 9 type codes</strong> in the current 3.3
              specification.
            </p>

            <h2 id="live" className="h3">
              What live validation means in practice
            </h2>
            <p>In the current model, live validation is not a periodic afterthought. It is an active part of how ForceX maintains trust at tip. The framework includes:</p>
            <ul>
              <li>incremental reconciliation controls across address and value surfaces,</li>
              <li>inline MWEB write-path conservation checks,</li>
              <li>per-block structural anchors at tip for counts and supply-related invariants,</li>
              <li>and a periodic external node cross-check for source confirmation.</li>
            </ul>
            <p>
              Most explorers display blockchain data. ForceX verifies the integrity of the data it publishes. Without ongoing
              reconciliation, write-path validation, and external confirmation, an index can drift from chain state while
              still appearing functional.
            </p>
            <h3>Direct node access is where integrity starts, not where it ends</h3>
            <p>
              Running a full node is necessary, but not sufficient. Any platform built on top of node data still has its own
              ingestion path, derived records, aggregates, caches, and opportunities for divergence. The ForceX validation
              layer exists because direct node access alone does not guarantee that the published index remains aligned with
              the node beneath it. That alignment has to be verified.
            </p>

            <h2 id="evidence" className="h3">
              Evidence and recorded outcomes
            </h2>
            <p>
              A core part of the ForceX model is that validation is recorded, not merely implied. The framework writes durable
              results to validation records so controls have attributable outcomes rather than silent assumptions. A
              validation system should not only run checks. It should preserve the evidence that those checks were executed
              and what they returned.
            </p>
            <p>
              The entries below describe what each publicly disclosed control verifies, why it matters, and what a passing
              result means. They are written for transparency and clarity, while detailed implementation logic remains part
              of the proprietary ForceX data quality framework.
            </p>

            <h2 id="catalog" className="h3">
              Public control catalog
            </h2>
            <p>
              Each rule has a fixed identifier, a declared cadence, and a governed public description. Below is the full
              catalog of live controls currently disclosed in the Data Quality interface, grouped by integrity domain.
            </p>
            {order.map((d) => (
              <div key={d} style={{ marginTop: 36 }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {domains[d].title}
                  <span className="small mono">
                    {Object.keys(controls).filter((k) => controls[k].domain === d).length} controls
                  </span>
                </h3>
                <div className="catalog">
                  {Object.entries(controls)
                    .filter(([, c]) => c.domain === d)
                    .map(([code, c]) => (
                      <details key={code} className="control">
                        <summary>
                          <span className="control__code">{code.replace("FX-", "")}</span>
                          <span className="control__title">{c.title}</span>
                          <span className="control__meta">
                            <span className={`chip ${validated ? "" : "chip--pending"}`}>
                              <span className="chip__dot" />
                              {c.cadence_type === "per_block" ? "Per block" : "Periodic"}
                            </span>
                          </span>
                        </summary>
                        <div className="control__body">
                          <dl>
                            <dt>Meaning</dt>
                            <dd>{c.meaning}</dd>
                            <dt>What it checks</dt>
                            <dd>{c.what_it_checks}</dd>
                            <dt>Why it matters</dt>
                            <dd>{c.why_it_matters}</dd>
                            <dt>Helps prevent</dt>
                            <dd>{c.helps_prevent}</dd>
                            <dt>Technical basis</dt>
                            <dd className="tech">{c.technical_basis}</dd>
                          </dl>
                        </div>
                      </details>
                    ))}
                </div>
              </div>
            ))}

            <h2 className="h3">Final statement</h2>
            <p>
              ForceX treats validation as part of the product itself. The Data Quality panel is where that validation becomes
              visible, but the underlying framework extends beyond the panel and operates across the full data lifecycle.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="See it live"
        title="Every explorer page carries its own validation status."
        body="Open the Litecoin explorer to see the Data Quality panel at the current tip."
        primary={{ href: "/xplorer/litecoin", label: "Open the explorer" }}
        secondary={{ href: "/xtract", label: "Build on validated data" }}
      />
    </>
  );
}
