import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { CodeWindow, highlightJsonLines } from "@/components/CodeWindow";
import { ArrowUpRight, Building, Check, Code, Database, Layers, Shield, Users, Wallet, Bolt } from "@/components/Icons";
import { fetchPublic, type QualityStatus } from "@/lib/api";

export const metadata: Metadata = {
  title: "Litecoin Data API: Validated Chain Data and MCP | Xtract",
  description: "Xtract is the API and data services layer from ForceX. Reliable, programmatic access to validated Litecoin on-chain data for builders, wallets, analysts, and institutions.",
};

export const revalidate = 60;

const COVERAGE = [
  { Icon: Database, title: "Network and blocks", body: "Block headers, summaries, difficulty, supply, fees, and network metrics." },
  { Icon: Bolt, title: "Transactions", body: "Transactions, status, fees, inputs, outputs, confirmations, and mempool activity." },
  { Icon: Users, title: "Addresses", body: "Balances, activity, received and sent history, and UTXO information." },
  { Icon: Layers, title: "MWEB data", body: "MWEB balances, peg activity, and privacy-layer supply metrics where available." },
  { Icon: Wallet, title: "Market and pricing", body: "Litecoin price, market, supply, and economic indicators alongside chain data." },
  { Icon: Shield, title: "Data quality and metadata", body: "Quality scores, validation metadata, timestamps, and confidence indicators." },
];

const PLANS = [
  { name: "Starter", credits: "300K", hourly: "12K credits/hr", sustained: "200 credits/min", burst: "20 credits/sec" },
  { name: "Builder", credits: "3M", hourly: "36K credits/hr", sustained: "600 credits/min", burst: "50 credits/sec", featured: true },
  { name: "Growth", credits: "30M", hourly: "90K credits/hr", sustained: "1,500 credits/min", burst: "100 credits/sec" },
];

const USERS = [
  { Icon: Code, title: "Builders", body: "Build applications with clean, validated blockchain data and simple integration." },
  { Icon: Wallet, title: "Wallets", body: "Power balances, history, notifications, and address activity with confidence." },
  { Icon: Layers, title: "Analysts", body: "Perform on-chain analysis using trusted, consistent, and complete data." },
  { Icon: Building, title: "Institutions", body: "Use governed blockchain data for reporting, compliance, research, and strategic intelligence." },
];

export default async function XtractPage() {
  const q = await fetchPublic<QualityStatus>("quality/status", 60);
  const sample = JSON.stringify(
    {
      data: { chain: "litecoin", tip_height: q?.tip_height ?? 3170723, tip_time: q?.validated_at ?? "2026-09-02T11:26:08Z", mempool_tx_count: 1797 },
      meta: {
        validation: { status: q?.state ?? "validated", validated_height: q?.tip_height ?? 3170723, lag_blocks: 0 },
        dataset_version: "v2.6",
        credit_cost: 1,
      },
    },
    null,
    2,
  );

  return (
    <>
      <PageHero
        tint="xtract"
        visual="streams"
        eyebrow="Xtract · API and data services"
        title={
          <>
            Build on data you can <span className="hi">trust</span>.
          </>
        }
        lead="Programmatic access to validated Litecoin data for builders, wallets, analysts, and institutions."
        actions={
          <>
            <Link href="/signup?return_to=/account/%23api-keys" className="btn btn--accent btn--lg">
              Get API access
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
            <Link href="/xtract/docs" className="btn btn--ghost btn--lg">
              API docs
            </Link>
            <Link href="/xtract/docs/mcp" className="btn btn--ghost btn--lg">
              MCP docs
            </Link>
          </>
        }
        meta={
          <>
            <span>
              Base <b>forcex.com/xtract/v1/litecoin</b>
            </span>
            <span>
              Validation <b>{q?.state ?? "validated"}</b>
            </span>
            <span>
              Tip <b>{(q?.tip_height ?? 3170723).toLocaleString("en-US")}</b>
            </span>
          </>
        }
      />

      <section className="section--tight" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <CodeWindow
            reveal
            path="/xtract/v1/litecoin/chain/home"
            footer={
              <div className="code__bar" style={{ borderTop: "1px solid var(--line)", borderBottom: 0 }}>
                <span style={{ color: "var(--muted)" }}>Authorization</span>
                <code style={{ color: "var(--text)" }}>Bearer fx_live_************</code>
              </div>
            }
          >
            {highlightJsonLines(sample)}
          </CodeWindow>
        </div>
      </section>

      <section className="section" id="endpoints">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal="fade">
                Coverage
              </span>
              <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
                Powerful endpoints. Reliable data.
              </h2>
              <p className="lead" data-reveal>
                Comprehensive coverage across the Litecoin blockchain and ecosystem.
              </p>
            </div>
            <Link href="/xtract/docs#reference" className="btn btn--ghost" data-reveal>
              Endpoint reference
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
          </div>
          <div className="values" style={{ ["--tint" as string]: "var(--xtract)" }}>
            {COVERAGE.map(({ Icon, title, body }, i) => (
              <div key={title} className="value" data-spot="" data-reveal style={{ ["--d" as string]: `${(i % 3) * 60}ms` }}>
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
        <div className="container dev__grid">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Data quality
            </span>
            <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
              ForceX data quality you can build on.
            </h2>
            <p className="lead" data-reveal style={{ marginTop: 22 }}>
              Xtract does not simply expose parsed blockchain data. It delivers data that has passed ForceX validation,
              reconciliation, and governance controls before it reaches your application.
            </p>
            <Link href="/data-quality" className="link-arrow" data-reveal style={{ marginTop: 20 }}>
              Learn how ForceX ensures data quality <ArrowUpRight size={16} />
            </Link>
          </div>
          <ul className="dev__list" data-reveal style={{ marginTop: 0 }}>
            {[
              ["Validated controls", "14 live rules run at tip, recorded with the block they ran at"],
              ["Litecoin-first coverage", "chain, mempool, MWEB, market, and quality endpoints"],
              ["Governance before display", "meta.validation on every chain response"],
              ["Trusted on-chain intelligence", "adjusted volume and supply methodology, not raw totals"],
              ["Quality metadata where available", "validated_height, lag_blocks, dataset_version"],
            ].map(([b, s]) => (
              <li key={b}>
                <Check size={18} />
                <span>
                  <b>{b}</b>
                  <br />
                  <span className="small">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="plans">
        <div className="container">
          <div className="section-head" style={{ textAlign: "center", gridTemplateColumns: "1fr" }}>
            <div>
              <span className="eyebrow" data-reveal="fade" style={{ justifyContent: "center" }}>
                Plans
              </span>
              <h2 className="h2" data-reveal style={{ margin: "18px auto 0" }}>
                Simple, predictable pricing.
              </h2>
              <p className="lead" data-reveal style={{ marginInline: "auto" }}>
                Choose the Xtract plan that fits your usage. All paid plans include API and MCP access to validated Litecoin
                data.
              </p>
            </div>
          </div>
          <div className="plans">
            {PLANS.map((p, i) => (
              <div key={p.name} className={`plan ${p.featured ? "plan--featured" : ""}`} data-spot="" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                <div className="plan__name">
                  <span>{p.name}</span>
                  {p.featured && <span style={{ color: "var(--accent)" }}>Most popular</span>}
                </div>
                <div className="plan__credits">
                  {p.credits} credits
                  <small>per month</small>
                </div>
                <div className="plan__rows">
                  <div>
                    <span>Hourly capacity</span>
                    <b>{p.hourly}</b>
                  </div>
                  <div>
                    <span>Sustained rate</span>
                    <b>{p.sustained}</b>
                  </div>
                  <div>
                    <span>Burst window</span>
                    <b>{p.burst}</b>
                  </div>
                </div>
                <Link href={`/signup?return_to=/xtract/plans/%3Fplan%3D${p.name.toLowerCase()}`} className={`btn btn--block ${p.featured ? "btn--accent" : "btn--ghost"}`}>
                  Get {p.name} plan
                </Link>
              </div>
            ))}
          </div>
          <p className="small" data-reveal style={{ textAlign: "center", marginTop: 20 }}>
            Free accounts include a sandbox key: 30,000 period credits, 30 credits per minute, 5 credits per second.
          </p>
        </div>
      </section>

      <section className="section quality" id="use-cases">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow" data-reveal="fade">
                Use cases
              </span>
              <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
                Who uses Xtract?
              </h2>
            </div>
          </div>
          <div className="extras" style={{ marginTop: 0 }}>
            {USERS.map(({ Icon, title, body }, i) => (
              <div key={title} className="extra" data-spot="" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
                <span className="extra__ico">
                  <Icon />
                </span>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Build with ForceX"
        title="Ready to build with trusted Litecoin data?"
        body="Get API access or explore the documentation to start building with Xtract."
        primary={{ href: "/signup", label: "Get API access" }}
        secondary={{ href: "/xtract/docs", label: "View API docs" }}
      />
    </>
  );
}
