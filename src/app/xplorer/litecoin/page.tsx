import type { Metadata } from "next";
import Link from "next/link";
import { FX_APP_ORIGIN, getChainHome, getNetworkSummary } from "@/lib/api";
import { fmtBytes, fmtInt, fmtLtc, fmtSignedPct, pctTone, timeAgo } from "@/lib/format";
import { SeriesChart } from "@/components/SeriesChart";
import { ExplorerSearch } from "@/components/ExplorerSearch";
import { Counter } from "@/components/Counter";
import { ArrowUpRight, LtcMark } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Litecoin Explorer | Xplorer",
  description: "Verified Litecoin block explorer. Supply, network health, MWEB privacy pool, and live data quality status at the current tip.",
};

export const revalidate = 60;

export default async function XplorerLitecoin() {
  const [summary, chain] = await Promise.all([getNetworkSummary(), getChainHome()]);
  const q = summary.quality;
  const validated = q?.state === "validated";
  const base = `${FX_APP_ORIGIN}/xplorer/litecoin`;
  const pct = (a: number | null, b: number | null) => (a && b ? Math.min(100, (a / b) * 100) : 0);

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 32 }}>
        <div className="grid-bg" />
        <div className="container">
          <div className="xp-head">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span className="panel__id">
                <span className="ltc" style={{ width: 48, height: 48, borderRadius: 14 }}>
                  <LtcMark size={28} />
                </span>
              </span>
              <div>
                <span className="eyebrow eyebrow--plain">Xplorer</span>
                <h1 className="h2" style={{ margin: "4px 0 0" }}>
                  Litecoin
                </h1>
              </div>
            </div>
            <ExplorerSearch />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <a href={`${base}/blocks`} className="chip">
              Blocks
            </a>
            <a href={`${base}/mempool`} className="chip">
              Mempool
            </a>
            <a href={`${FX_APP_ORIGIN}/xamine`} className="chip">
              Xamine
            </a>
            <Link href="/data-quality" className="chip">
              Data quality
            </Link>
          </div>
        </div>
      </section>

      <section className="section--tight" style={{ paddingTop: 8 }}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          {/* Headline metrics */}
          <div className="xp-grid" data-reveal>
            <a href={`${base}/blocks`} className="xp-card card--hover">
              <div className="xp-card__head">
                Block height <ArrowUpRight size={14} />
              </div>
              <span className="xp-metric">
                <Counter value={chain?.height ?? summary.asOf.height} />
              </span>
              <span className="small">{timeAgo(summary.asOf.time)}</span>
            </a>
            <div className="xp-card">
              <div className="xp-card__head">Total addresses</div>
              <span className="xp-metric">{chain?.totalAddresses ? <Counter value={chain.totalAddresses} /> : "—"}</span>
              <span className="small">Lifetime distinct addresses</span>
            </div>
            <div className="xp-card">
              <div className="xp-card__head">Total transactions</div>
              <span className="xp-metric">{chain?.totalTransactions ? <Counter value={chain.totalTransactions} /> : "—"}</span>
              <span className="small">Confirmed on chain</span>
            </div>
          </div>

          {/* Data quality band */}
          <div className="panel" data-reveal style={{ borderLeft: `3px solid ${validated ? "var(--good)" : "var(--warn)"}` }}>
            <div className="panel__quality-row">
              <span className="eyebrow eyebrow--plain">Data quality</span>
              <span className="chip" style={{ color: validated ? "var(--good)" : "var(--warn)" }}>
                <span className={`chip__dot ${validated ? "" : "chip--warn"}`} />
                {q ? (validated ? "Verified" : q.state) : "Pending"}
              </span>
            </div>
            <div className="panel__chips" style={{ marginTop: 12 }}>
              {["Monetary integrity", "Address integrity", "Block & write integrity"].map((d) => (
                <span key={d} className={`chip ${validated ? "" : "chip--pending"}`}>
                  <span className="chip__dot" />
                  {d}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="panel__validated">{q ? `Validated through block ${fmtInt(q.tip_height)}.` : "Validation status unavailable."}</div>
              <div className="panel__detail">
                {q
                  ? `${q.controls.passing} controls passing: ${q.controls_by_cadence.per_block.total} run every block, ${q.controls_by_cadence.periodic_external.total} periodic external node cross-check. External node cross-check confirmed at block ${fmtInt(q.node_cross_check.last_confirmed_block)} · next check in ${q.node_cross_check.next_due_in_blocks} blocks.`
                  : "The status endpoint could not be reached."}
              </div>
            </div>
            <div className="hero__actions" style={{ marginTop: 16 }}>
              <Link href="/data-quality#catalog" className="btn btn--sm btn--ghost">
                View control catalog
              </Link>
              <Link href="/data-quality" className="btn btn--sm btn--ghost">
                How ForceX ensures data quality
              </Link>
            </div>
          </div>

          {/* Supply */}
          <div className="xp-card" data-reveal>
            <div className="xp-card__head">Supply</div>
            <div className="xp-grid xp-grid--2" style={{ gap: 28 }}>
              <div style={{ display: "grid", gap: 10 }}>
                <span className="small mono" style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11 }}>
                  Scheduled
                </span>
                <div className="bar">
                  <i style={{ width: `${pct(chain?.supply.scheduledEmitted ?? null, chain?.supply.scheduledMax ?? null)}%` }} />
                </div>
                <b className="mono" style={{ fontWeight: 500 }}>
                  {chain?.supply.scheduledEmitted ? `${fmtInt(chain.supply.scheduledEmitted)} / ${fmtInt(chain.supply.scheduledMax)} LTC` : "—"}
                </b>
                <span className="small">{chain?.supply.scheduledEmitted ? `${pct(chain.supply.scheduledEmitted, chain.supply.scheduledMax).toFixed(1)}% of schedule emitted` : "Supply unavailable"}</span>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <span className="small mono" style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 11 }}>
                  Circulating
                </span>
                <div className="bar">
                  <i style={{ width: `${pct(chain?.supply.circulating ?? null, chain?.supply.circulatingMax ?? null)}%` }} />
                </div>
                <b className="mono" style={{ fontWeight: 500 }}>
                  {chain?.supply.circulating ? `${fmtInt(chain.supply.circulating)} / ${fmtInt(chain.supply.circulatingMax)} LTC` : "—"}
                </b>
                <span className="small">{chain?.supply.circulating ? `${pct(chain.supply.circulating, chain.supply.circulatingMax).toFixed(1)}% of effective circulating maximum` : "Supply unavailable"}</span>
              </div>
            </div>
            <div className="xp-grid xp-grid--2" style={{ gap: 28, marginTop: 8 }}>
              <div className="kv">
                <span>Next halving</span>
                <b>{chain?.supply.nextHalvingBlocks ? `~${fmtInt(chain.supply.nextHalvingBlocks)} blocks` : "—"}</b>
                <span>Reward: 6.25 to 3.125 LTC</span>
              </div>
              <div className="kv">
                <span>Daily issuance</span>
                <b>{chain?.supply.dailyIssuance ? `~${fmtInt(chain.supply.dailyIssuance)} LTC / day` : "—"}</b>
                <span>6.25 LTC × ~576 blocks</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="xp-grid xp-grid--2" data-reveal>
            <div className="xp-card">
              <div className="xp-card__head">Daily transactions (30d, UTC)</div>
              <SeriesChart data={chain?.txDaily ?? []} color="var(--xplorer)" />
            </div>
            <div className="xp-card">
              <div className="xp-card__head">MWEB pool balance (30d, UTC)</div>
              <SeriesChart data={chain?.mwebDaily ?? []} color="var(--xtract)" divisor={1e8} unit=" LTC" />
            </div>
          </div>

          {/* MWEB + Network health */}
          <div className="xp-grid xp-grid--2" data-reveal>
            <div className="xp-card">
              <div className="xp-card__head">
                <span>MWEB privacy</span>
                <span>{summary.asOf.height ? `Block ${fmtInt(summary.asOf.height)}` : ""}</span>
              </div>
              <div className="bar bar--mweb">
                <i style={{ width: `${Math.max(1, chain?.mwebPool.pct ?? 0)}%` }} />
              </div>
              <span className="small">
                {chain?.mwebPool.pct != null ? `${chain.mwebPool.pct}% of supply in the MWEB pool · ${fmtInt(chain.mwebPool.ltc)} LTC` : "Pool share unavailable"}
              </span>
              <div className="xp-grid" style={{ gap: 16 }}>
                <div className="kv">
                  <span>Peg-ins, 24h</span>
                  <b className="tone-good">{fmtLtc(summary.mweb.peginLtc, { signed: false })}</b>
                </div>
                <div className="kv">
                  <span>Peg-outs, 24h</span>
                  <b className="tone-bad">{fmtLtc(summary.mweb.pegoutLtc, { signed: false })}</b>
                </div>
                <div className="kv">
                  <span>Net flow, 24h</span>
                  <b className={summary.mweb.netLtc && summary.mweb.netLtc < 0 ? "tone-bad" : "tone-good"}>{fmtLtc(summary.mweb.netLtc)}</b>
                </div>
              </div>
            </div>
            <div className="xp-card">
              <div className="xp-card__head">
                <span>Network health</span>
                <span>last 24h</span>
              </div>
              <div className="xp-grid xp-grid--2" style={{ gap: 18 }}>
                <div className="kv">
                  <span>Transactions</span>
                  <b>{fmtInt(summary.tx.count)}</b>
                  <span className={pctTone(summary.tx.changePct) === "good" ? "tone-good" : pctTone(summary.tx.changePct) === "bad" ? "tone-bad" : ""}>{fmtSignedPct(summary.tx.changePct)}</span>
                </div>
                <div className="kv">
                  <span>Active addresses</span>
                  <b>{fmtInt(summary.addresses.active)}</b>
                  <span className={pctTone(summary.addresses.changePct) === "good" ? "tone-good" : pctTone(summary.addresses.changePct) === "bad" ? "tone-bad" : ""}>{fmtSignedPct(summary.addresses.changePct)}</span>
                </div>
                <div className="kv">
                  <span>Avg block size</span>
                  <b>{fmtBytes(summary.blockSize.bytes)}</b>
                  <span className={pctTone(summary.blockSize.changePct) === "good" ? "tone-good" : pctTone(summary.blockSize.changePct) === "bad" ? "tone-bad" : ""}>{fmtSignedPct(summary.blockSize.changePct)}</span>
                </div>
                <div className="kv">
                  <span>Avg fee / tx</span>
                  <b>{summary.fees.avgLitoshi != null ? `${(summary.fees.avgLitoshi / 1e8).toFixed(8)} LTC` : "—"}</b>
                  <span className={pctTone(summary.fees.avgChangePct) === "good" ? "tone-good" : pctTone(summary.fees.avgChangePct) === "bad" ? "tone-bad" : ""}>{fmtSignedPct(summary.fees.avgChangePct)}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="small" style={{ margin: "8px 0 0" }}>
            Block, transaction, and address detail pages open in the live ForceX explorer. Data on this page refreshes every minute from the ForceX public API.
          </p>
        </div>
      </section>
    </>
  );
}
