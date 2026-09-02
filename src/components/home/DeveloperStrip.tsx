import Link from "next/link";
import type { QualityStatus } from "@/lib/api";
import { CodeWindow, highlightJson } from "@/components/CodeWindow";
import { Marquee } from "@/components/Marquee";
import { ArrowUpRight, Check } from "@/components/Icons";

/* Paths from the live Xtract v0.2 endpoint reference, base /xtract/v1/litecoin */
const ENDPOINTS = [
  "/chain/home",
  "/chain/validation",
  "/chain/blocks",
  "/chain/block/{height_or_hash}",
  "/chain/transaction/{txid}",
  "/chain/address/{address}",
  "/chain/address/{address}/transactions",
  "/chain/output/{txid}:{vout}",
  "/chain/mweb/blocks/{height}",
  "/chain/search",
  "/mempool",
  "/mempool/feerates",
  "/charts/network",
  "/charts/supply",
  "/charts/mweb",
  "/charts/market",
  "/charts/economic-flow",
  "/charts/distribution",
  "/developer/usage",
];

export function DeveloperStrip({ quality }: { quality: QualityStatus | null }) {
  const sample = quality
    ? JSON.stringify(
        {
          data: {
            state: quality.state,
            tip_height: quality.tip_height,
            controls: quality.controls,
            node_cross_check: {
              status: quality.node_cross_check.status,
              last_confirmed_block: quality.node_cross_check.last_confirmed_block,
              cadence_blocks: quality.node_cross_check.cadence_blocks,
            },
            validated_at: quality.validated_at,
          },
          meta: { chain: "ltc", version: "v1", workspace: "public" },
        },
        null,
        2,
      )
    : JSON.stringify(
        {
          data: {
            state: "validated",
            tip_height: 3170723,
            controls: { total: 14, passing: 14, warning: 0, pending: 0 },
            node_cross_check: { status: "aligned", cadence_blocks: 1000 },
          },
          meta: { chain: "ltc", version: "v1", workspace: "public" },
        },
        null,
        2,
      );

  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="container">
        <div className="dev__grid">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Xtract · API and data services
            </span>
            <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
              Build with on-chain data you can trust.
            </h2>
            <p className="lead" data-reveal style={{ marginTop: 22, maxWidth: 520 }}>
              Xtract does not simply expose parsed blockchain data. Every response carries validation metadata, so your
              application knows exactly what has been verified and through which block.
            </p>
            <ul className="dev__list" data-reveal>
              {[
                ["Validation metadata on every response", "status, validated height, and lag in blocks"],
                ["Litecoin-first coverage", "blocks, transactions, addresses, MWEB, market, quality"],
                ["Governance before display", "source-native data separated from derived calculations"],
                ["One credit model", "REST and MCP share the same credits, limits, and keys"],
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
            <div className="hero__actions" data-reveal style={{ marginTop: 28 }}>
              <Link href="/xtract" className="btn btn--accent">
                Get API access
                <span className="btn__ico">
                  <ArrowUpRight />
                </span>
              </Link>
              <a href="https://forcex.com/xtract/docs/" className="btn btn--ghost">
                View API docs
              </a>
            </div>
          </div>
          <div data-reveal="scale" style={{ ["--d" as string]: "120ms" }}>
            <CodeWindow
              path="/api/public/litecoin/quality/status"
              footer={
                <div className="code__bar" style={{ borderTop: "1px solid var(--line)", borderBottom: 0 }}>
                  <span style={{ color: "var(--muted)" }}>{quality ? "Live response from the ForceX public API, refreshed each minute." : "Sample response shape."}</span>
                </div>
              }
            >
              {highlightJson(sample)}
            </CodeWindow>
          </div>
        </div>
      </div>
      <div className="endpoints">
        <Marquee
          duration={70}
          items={ENDPOINTS.map((e) => (
            <span key={e} className="endpoint">
              <b>GET</b>
              {e}
              <i />
            </span>
          ))}
        />
      </div>
    </section>
  );
}
