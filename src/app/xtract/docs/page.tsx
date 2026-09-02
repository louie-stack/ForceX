import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ArrowUpRight } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Litecoin API Docs | Xtract",
  description: "Authentication, response conventions, validation metadata, credits, rate limits, pagination, chart ranges, errors, and the v0.2 Litecoin endpoint catalog for the ForceX Xtract API.",
};

const REFERENCE: [string, string, string][] = [
  ["GET", "/chain/home", "Chain summary: tip height, tip time, mempool count."],
  ["GET", "/chain/validation", "Current scalar validation surface for the chain."],
  ["GET", "/chain/blocks", "Paginated block listing anchored to a validated height."],
  ["GET", "/chain/block/{height_or_hash}", "Block detail by height or hash."],
  ["GET", "/chain/transaction/{txid}", "Transaction detail with inputs, outputs, and confirmations."],
  ["GET", "/chain/output/{txid}:{vout}", "A single transaction output and its spend status."],
  ["POST", "/chain/outputs/batch", "Batch output lookup."],
  ["GET", "/chain/address/{address}", "Address balance and summary."],
  ["GET", "/chain/address/{address}/transactions", "Paginated address transaction history."],
  ["GET", "/chain/mweb/blocks/{height}", "MWEB extension block detail."],
  ["GET", "/chain/search", "Search for a block, transaction, or address."],
  ["GET", "/mempool", "Mempool summary."],
  ["GET", "/mempool/feerates", "Mempool fee-rate distribution."],
  ["GET", "/mempool/tx/{txid}", "Unconfirmed transaction detail."],
  ["GET", "/charts/network", "Network metrics by day or week."],
  ["GET", "/charts/supply", "Supply series and issuance."],
  ["GET", "/charts/mweb", "MWEB pool and peg activity."],
  ["GET", "/charts/market", "Market and price series."],
  ["GET", "/charts/economic-flow", "Adjusted economic throughput."],
  ["GET", "/charts/distribution", "Address and value distribution."],
  ["GET", "/charts/supply-age-distribution", "Supply age bands."],
  ["GET", "/developer/me", "Key identity and plan."],
  ["GET", "/developer/limits", "Effective limits for the key."],
  ["GET", "/developer/usage", "Credit usage for the current period."],
];

const STATUSES = [
  ["validated", "Data is current within the configured validation lag window."],
  ["lagging", "Validated data is behind the current observed tip."],
  ["stale", "The most recent validation checkpoint is older than the freshness threshold."],
  ["unvalidated", "No current validation checkpoint is available."],
  ["not_applicable", "The endpoint does not read a validation-scoped data family."],
];

export default function XtractDocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Xtract API documentation"
        title={
          <>
            Build against <span className="hi">validated</span> Litecoin data.
          </>
        }
        lead="Xtract is the ForceX production API for validated on-chain data. Use these docs for authentication, response conventions, credits, rate limits, errors, and the current v0.2 Litecoin endpoint catalog."
        actions={
          <>
            <Link href="/signup" className="btn btn--accent">
              Get API access
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
            <a href="https://forcex.com/xtract/openapi.json" className="btn btn--ghost">
              OpenAPI JSON
            </a>
            <Link href="/xtract/docs/mcp" className="btn btn--ghost">
              MCP docs
            </Link>
          </>
        }
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container docs">
          <nav className="docs__toc" aria-label="On this page">
            <h5>Getting started</h5>
            <a href="#quickstart">Quickstart</a>
            <a href="#base-url">Base URL</a>
            <a href="#auth">Authentication</a>
            <h5>Conventions</h5>
            <a href="#response">Response format</a>
            <a href="#validation">Validation metadata</a>
            <a href="#credits">Credits and limits</a>
            <a href="#pagination">Pagination</a>
            <a href="#charts">Chart ranges</a>
            <a href="#current">Live current data</a>
            <a href="#errors">Errors</a>
            <h5>Reference</h5>
            <a href="#reference">Endpoint reference</a>
          </nav>

          <div className="docs__body prose">
            <h2 id="quickstart" className="h3" style={{ marginTop: 0 }}>
              Quickstart
            </h2>
            <p>
              Create an API key in your account, then pass it as a bearer token. New keys are <code>fx_live_</code> keys.
              Existing <code>fx_test_</code> keys still work but can no longer be created.
            </p>
            <pre>
              <code>{`curl -H "Authorization: Bearer fx_live_************" \\
  https://forcex.com/xtract/v1/litecoin/chain/home`}</code>
            </pre>
            <div className="callout">
              <b>No real keys in examples.</b> All examples use masked key prefixes. Generate your own key from your account
              page under API keys.
            </div>

            <h2 id="base-url" className="h3">
              Base URL
            </h2>
            <p>The current production API is path-based on forcex.com.</p>
            <pre>
              <code>https://forcex.com/xtract/v1/litecoin</code>
            </pre>
            <p>The endpoint table below uses short paths such as <code>/chain/home</code>. Prepend the base URL when making requests.</p>

            <h2 id="auth" className="h3">
              Authentication
            </h2>
            <p>Every Xtract operation requires a bearer API key with the <code>xtract</code> scope.</p>
            <div className="list-rows">
              <div className="list-row">
                <h4>
                  <code>fx_live_</code>
                </h4>
                <p>Current API keys. All plans; Free uses Free-tier limits, paid plans use paid limits.</p>
              </div>
              <div className="list-row">
                <h4>
                  <code>fx_test_</code>
                </h4>
                <p>Legacy test keys, existing keys only. Still valid; cannot be newly created.</p>
              </div>
            </div>

            <h2 id="response" className="h3">
              Response format
            </h2>
            <p>
              Successful responses use a strict <code>data</code> plus <code>meta</code> envelope. Optional expansion payloads
              appear in <code>included</code> when an endpoint supports <code>?include=</code>.
            </p>
            <pre>
              <code>{`{
  "data": {
    "chain": "litecoin",
    "tip_height": 3118767,
    "tip_time": "2026-06-03T17:22:51Z"
  },
  "meta": {
    "request_id": "req_...",
    "served_at": "2026-06-03T17:23:02Z",
    "served_from": "indexed_store",
    "validation": {
      "scope": "chain",
      "status": "validated",
      "validated_height": 3118767,
      "validated_at": "2026-06-03T17:22:58Z",
      "lag_blocks": 0
    },
    "dataset_version": "v2.6",
    "credit_cost": 1,
    "included_expansions": []
  }
}`}</code>
            </pre>

            <h2 id="validation" className="h3">
              Validation metadata
            </h2>
            <p>
              Validation is first-class in Xtract. Chain endpoints report the validated chain height used to serve the
              response. Control-plane endpoints report validation as not applicable instead of over-certifying data they do
              not read.
            </p>
            <div className="list-rows">
              {STATUSES.map(([s, d]) => (
                <div key={s} className="list-row">
                  <h4>
                    <code>{s}</code>
                  </h4>
                  <p>{d}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 16 }}>
              For the current scalar validation surface, use <code>GET /chain/validation</code>.
            </p>

            <h2 id="credits" className="h3">
              Credits and rate limits
            </h2>
            <p>
              Requests consume credits. Simple point lookups usually cost 1 credit; richer <code>?include=</code> expansions
              and batch requests cost more. Responses include <code>meta.credit_cost</code> and rate-limit headers where
              applicable.
            </p>
            <div className="plan__rows" style={{ marginBottom: 16 }}>
              <div>
                <span>Starter</span>
                <b>300,000 / period · 200 / min · 20 / sec</b>
              </div>
              <div>
                <span>Builder</span>
                <b>3,000,000 / period · 600 / min · 50 / sec</b>
              </div>
              <div>
                <span>Growth</span>
                <b>30,000,000 / period · 1,500 / min · 100 / sec</b>
              </div>
              <div>
                <span>Sandbox (Free)</span>
                <b>30,000 / period · 30 / min · 5 / sec</b>
              </div>
            </div>
            <pre>
              <code>{`RateLimit-Limit: 20;w=1, 200;w=60, 300000;w=2592000
RateLimit-Remaining: 183
RateLimit-Reset: 42
RateLimit-Cost: 1
Retry-After: 17
X-Request-Id: req_...`}</code>
            </pre>

            <h2 id="pagination" className="h3">
              Pagination
            </h2>
            <p>
              Paginated chain listings use opaque cursors. Page 1 anchors the walk to a validated chain height, and later
              pages keep that anchor so a long listing remains consistent while new blocks arrive.
            </p>
            <ul>
              <li>
                <code>limit</code>: requested page size. Responses may include <code>effective_limit</code> when the server clamps it.
              </li>
              <li>
                <code>cursor</code>: opaque token returned by the previous page.
              </li>
              <li>
                <code>direction</code>: listing direction where supported.
              </li>
            </ul>

            <h2 id="charts" className="h3">
              Chart ranges
            </h2>
            <p>
              Chart endpoints use <code>start</code> and <code>end</code> query parameters with half-open range semantics:{" "}
              <code>[start, end)</code>. Weekly buckets are anchored to Monday 00:00 UTC.
            </p>
            <pre>
              <code>GET /charts/network?metrics=tx_count,avg_fee_atomic_units&start=2026-05-01&end=2026-06-01&grain=day</code>
            </pre>
            <p>
              The older <code>from</code> and <code>to</code> aliases are accepted for compatibility during the transition, but
              new integrations should use <code>start</code> and <code>end</code>.
            </p>

            <h2 id="current" className="h3">
              Live current data
            </h2>
            <p>
              Chart endpoints accept <code>include_current=true</code> (REST default false, MCP tools default true) to attach an
              additive current member beside the untouched completed history. Two object kinds exist:
            </p>
            <ul>
              <li>
                <strong>time_window</strong>: an interval aggregate over the half-open UTC range. <code>is_complete=false</code>{" "}
                means the interval can still accumulate observations. A window is complete only when the chain&apos;s
                median-time-past has reached <code>window_end</code>.
              </li>
              <li>
                <strong>state_snapshot</strong>: a point-in-time state (lifetime totals, pool balance, spot price). Snapshots are
                never summed and carry no interval semantics.
              </li>
            </ul>
            <p>
              Every chain-derived current object binds one coherent read: <code>as_of_height</code>, <code>as_of_hash</code>,
              and <code>as_of_time</code>, plus <code>stability</code>, which is <code>provisional</code> until every
              represented block is beyond the deployed reorg-safe depth and <code>reorg_safe</code> after. Unsupported
              calculations return an explicit <code>status=unavailable</code> object with a governed <code>reason_code</code>,
              never a fabricated zero, a copied close, or a silently missing key.
            </p>

            <h2 id="errors" className="h3">
              Errors
            </h2>
            <p>
              Errors return a JSON body with a stable <code>error</code> code and a human-readable <code>message</code>, plus{" "}
              <code>X-Request-Id</code> for support. Rate-limit rejections include <code>Retry-After</code>.
            </p>

            <h2 id="reference" className="h3">
              Endpoint reference (v0.2)
            </h2>
            <div className="list-rows">
              {REFERENCE.map(([m, p, d]) => (
                <div key={p} className="list-row" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
                  <h4 style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <span className="code__method" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {m}
                    </span>
                    <code style={{ whiteSpace: "nowrap" }}>{p}</code>
                  </h4>
                  <p>{d}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 20 }}>
              The machine-readable specification is available as{" "}
              <a href="https://forcex.com/xtract/openapi.json">OpenAPI JSON</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
