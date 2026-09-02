import Link from "next/link";
import { ArrowUpRight, Bolt, Chart, Check, Code, Nodes, Search, Shield, Sparkle } from "@/components/Icons";
import { FX_APP_ORIGIN } from "@/lib/api";

const CHART = "M0,150 C40,140 60,110 90,118 S140,100 170,96 S220,60 250,70 S300,40 330,52 S380,30 420,26";

export function Surfaces() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Platform surfaces
            </span>
            <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
              Three products. One quality-first foundation.
            </h2>
            <p className="lead" data-reveal>
              Explore, analyze, and build on the same governed dataset. Every surface reads from data that has already
              passed validation.
            </p>
          </div>
          <Link href="/signup" className="btn btn--ghost" data-reveal>
            Get access to all three
            <span className="btn__ico">
              <ArrowUpRight />
            </span>
          </Link>
        </div>

        <div className="surfaces">
          {/* Xplorer */}
          <Link href="/xplorer/litecoin" className="surface" style={{ ["--tint" as string]: "var(--xplorer)" }} data-reveal>
            <div className="surface__top">
              <span className="surface__ico">
                <Search />
              </span>
              <span className="surface__eyebrow">Explorer</span>
            </div>
            <div className="surface__art">
              <div className="art-rows">
                {[
                  ["3,170,723", "854a9df1b80613e4ba1be4dfb2402d7bcb77b77", "289 tx"],
                  ["3,170,722", "9c1e27f0b2a4c4d1e9f31a7b5c0d8e6f2a4b1c3d", "312 tx"],
                  ["3,170,721", "7f2c8a1b4e5d6c3a9b0f1e2d3c4b5a6f7e8d9c0b", "276 tx"],
                  ["3,170,720", "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", "301 tx"],
                ].map(([h, hash, tx]) => (
                  <div key={h} className="art-row">
                    <b>{h}</b>
                    <span className="hash">{hash}</span>
                    <span className="ok">
                      <Check size={12} /> {tx}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface__body">
              <h3>Xplorer</h3>
              <p>
                Inspect blocks, transactions, addresses, network activity, supply values, MWEB data, and chain details with
                clarity and confidence.
              </p>
              <span className="link-arrow surface__cta">
                Explore on-chain data <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>

          {/* Xamine */}
          <Link href="/xamine" className="surface" style={{ ["--tint" as string]: "var(--xamine)" }} data-reveal>
            <div className="surface__top">
              <span className="surface__ico">
                <Chart />
              </span>
              <span className="surface__eyebrow">Analytics</span>
            </div>
            <div className="surface__art">
              <div className="art-chart">
                <svg viewBox="0 0 420 180" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="xamine-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--xamine)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--xamine)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g className="grid">
                    {[30, 70, 110, 150].map((y) => (
                      <line key={y} x1="0" x2="420" y1={y} y2={y} />
                    ))}
                  </g>
                  <path className="fill" d={`${CHART} L420,180 L0,180 Z`} />
                  <path className="line" d={CHART} />
                </svg>
              </div>
            </div>
            <div className="surface__body">
              <h3>Xamine</h3>
              <p>
                Analyze trends, relationships, supply, network behavior, and address activity with governed, trusted data.
              </p>
              <span className="link-arrow surface__cta">
                Dive into analytics <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>

          {/* Xtract */}
          <Link href="/xtract" className="surface" style={{ ["--tint" as string]: "var(--xtract)" }} data-reveal>
            <div className="surface__top">
              <span className="surface__ico">
                <Code />
              </span>
              <span className="surface__eyebrow">Data services</span>
            </div>
            <div className="surface__art">
              <div className="art-code">
                {"$ curl https://forcex.com/xtract/v1/litecoin/chain/home \\\n    -H \"Authorization: Bearer fx_live_…\"\n\n{\n  \"data\": { \"tip_height\": 3170723 },\n  \"meta\": { \"validation\": { \"status\": \"validated\" } }\n}"}
                <span className="cursor" />
              </div>
            </div>
            <div className="surface__body">
              <h3>Xtract</h3>
              <p>
                Reliable, programmatic access to trusted on-chain data for builders, analysts, wallets, and institutions.
              </p>
              <span className="link-arrow surface__cta">
                Build with ForceX <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
        </div>

        <div className="extras">
          <Link href="/xtract/docs/mcp" className="extra" style={{ ["--tint" as string]: "var(--mcp)" }} data-reveal>
            <span className="extra__ico">
              <Sparkle />
            </span>
            <h4>MCP Server</h4>
            <p>Give ChatGPT, Claude, and other AI assistants cited, validation-aware chain data.</p>
          </Link>
          <Link href="/data-quality" className="extra" data-reveal style={{ ["--d" as string]: "60ms" }}>
            <span className="extra__ico">
              <Shield />
            </span>
            <h4>Data Quality</h4>
            <p>See how every data point is validated, scored, and cross-checked against the node.</p>
          </Link>
          <a href={`${FX_APP_ORIGIN}/xamine/charts/adjusted-volume`} className="extra" style={{ ["--tint" as string]: "var(--xamine)", ["--d" as string]: "120ms" }} data-reveal>
            <span className="extra__ico">
              <Bolt />
            </span>
            <h4>Economic Throughput</h4>
            <p>Understand real economic activity on-chain with adjusted volume, not raw transfer totals.</p>
          </a>
          <a href={`${FX_APP_ORIGIN}/xamine/diagrams/address-relationships`} className="extra" style={{ ["--tint" as string]: "var(--xplorer)", ["--d" as string]: "180ms" }} data-reveal>
            <span className="extra__ico">
              <Nodes />
            </span>
            <h4>Address LinX</h4>
            <p>Investigate address interactions and map relationship patterns across on-chain activity.</p>
          </a>
        </div>
      </div>
    </section>
  );
}
