import type { Metadata } from "next";
import { LinxControls } from "@/components/xamine/LinxControls";
import { LinxGraph } from "@/components/xamine/LinxGraph";
import { Provenance } from "@/components/xamine/Provenance";
import { Subnav } from "@/components/xamine/Subnav";
import { ArrowUpRight } from "@/components/Icons";
import { FX_APP_ORIGIN, getNetworkSummary } from "@/lib/api";
import { fmtDateLong, inclusiveEnd } from "@/lib/xamine/format";
import { getLinx, parseLinxQuery } from "@/lib/xamine/linx";

export const metadata: Metadata = {
  title: "Address LinX | Xamine",
  description: "Visualize address forensics across counterparties, flow patterns, and notable on-chain relationships.",
};

const ltc = (v: number) => (Math.abs(v) / 1e8).toLocaleString("en-US", { maximumFractionDigits: Math.abs(v) / 1e8 < 1 ? 4 : 2 }) + " LTC";
const short = (a: string) => `${a.slice(0, 10)}…${a.slice(-6)}`;
const num = (v: number | null) => (v == null ? "—" : v.toLocaleString("en-US"));

export default async function AddressLinxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseLinxQuery(await searchParams);
  const summary = await getNetworkSummary().catch(() => null);
  const tip = summary?.quality?.tip_height ?? summary?.asOf.height ?? null;
  const r = await getLinx(query, tip);
  const hasAddress = query.address.length > 0;
  const invalid = hasAddress && !r.valid;
  const appHref = `${FX_APP_ORIGIN}/xamine/diagrams/address-relationships`;
  const explorer = (a: string) => `${FX_APP_ORIGIN}/xplorer/litecoin/address/${a}`;

  return (
    <div className="page-xamine">
      <Subnav appHref={appHref} />
      <section className="xc xl">
        <div className="container">
          <header className="xc__head">
            <div>
              <span className="eyebrow">Address activity · Tool</span>
              <h1 className="xc__title">Address LinX</h1>
              <p className="xl__lead">Visualize address forensics across counterparties, flow patterns, and notable on-chain relationships.</p>
            </div>
            <div className="xc__head-actions">
              <a href={appHref} className="vgb vgb--glass">
                <i className="vgb__dot" aria-hidden="true" />
                <span className="vgb__label">Open in Xamine</span>
                <span className="vgb__ico" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </a>
            </div>
          </header>

          <LinxControls query={query} invalid={invalid} />

          <article className="xi xi--card xc__card">
            <i className="xi__corner xi__corner--tl" aria-hidden="true" />
            <i className="xi__corner xi__corner--tr" aria-hidden="true" />
            <i className="xi__corner xi__corner--bl" aria-hidden="true" />
            <i className="xi__corner xi__corner--br" aria-hidden="true" />
            <header className="xc__card-head">
              <div>
                <span className="xc__caption mono">Selected address</span>
                <h2 className="xc__card-title xl__addr-title">{r.valid && hasAddress ? <span className="mono">{query.address}</span> : invalid ? "Not a Litecoin address" : "Enter an address"}</h2>
              </div>
              {r.valid && hasAddress && (
                <a href={explorer(query.address)} className="link-arrow mono xl__explorer">
                  View in explorer <ArrowUpRight size={13} />
                </a>
              )}
            </header>

            {r.valid && hasAddress ? (
              <>
                <div className="xl__summary">
                  <Stat label="Balance" value={r.summary?.balanceAtomic != null ? ltc(r.summary.balanceAtomic) : "—"} />
                  <Stat label="Transactions in window" value={num(r.summary?.txCount ?? null)} />
                  <Stat label="Counterparties" value={String(r.counterparties.length)} />
                  <Stat label="Window" value={`${fmtDateLong(query.start)} to ${fmtDateLong(inclusiveEnd(query.end))}`} />
                </div>
                <div className="xl__graph-wrap">
                  <span className="xc__watermark" aria-hidden="true">
                    FORCEX
                  </span>
                  {r.counterparties.length ? (
                    <LinxGraph counterparties={r.counterparties} address={query.address} />
                  ) : (
                    <p className="xl__empty">No counterparties matched this window and amount range.</p>
                  )}
                  <div className="ch__legend mono" aria-hidden="true">
                    <span className="ch__legend-item">
                      <i className="ch__swatch xl__sw--in" /> Received from
                    </span>
                    <span className="ch__legend-item">
                      <i className="ch__swatch xl__sw--out" /> Sent to
                    </span>
                    <span className="ch__legend-item">
                      <i className="ch__swatch xl__sw--both" /> Both directions
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="xl__empty-box">
                <p>{invalid ? "Enter a legacy (L, M, 3) or bech32 (ltc1) Litecoin address." : "Enter an address to view its relationship graph. The default window is today."}</p>
              </div>
            )}
            <footer className="xc__card-foot">
              <Provenance p={r.provenance} />
              <span className="xc__foot-note mono">Reconciled ledger · address integrity controls</span>
            </footer>
          </article>

          <article className="xi xi--card xc__card">
            <header className="xc__card-head">
              <div>
                <span className="xc__caption mono">{hasAddress && r.valid ? `${r.counterparties.length} relationships` : "Awaiting an address"}</span>
                <h2 className="xc__card-title">Relationship Ledger</h2>
              </div>
            </header>
            <div className="xl__table-wrap">
              <table className="xl__table">
                <thead>
                  <tr className="mono">
                    <th>Counterparty</th>
                    <th>Direction</th>
                    <th className="is-num">Value</th>
                    <th className="is-num">Txs</th>
                    <th>Height range</th>
                  </tr>
                </thead>
                <tbody>
                  {r.counterparties.length ? (
                    r.counterparties.map((c) => (
                      <tr key={c.address}>
                        <td>
                          <a href={explorer(c.address)} className="mono xl__cp" title={c.address}>
                            {short(c.address)}
                          </a>
                        </td>
                        <td>
                          <span className={`xl__dir mono xl__dir--${c.direction}`}>{c.direction === "in" ? "Received" : c.direction === "out" ? "Sent" : "Both"}</span>
                        </td>
                        <td className={`is-num mono ${c.valueAtomic >= 0 ? "good" : "bad"}`}>
                          {c.valueAtomic >= 0 ? "+" : "−"}
                          {ltc(c.valueAtomic)}
                        </td>
                        <td className="is-num mono">{c.txs}</td>
                        <td className="mono xl__range">
                          {c.heightFrom.toLocaleString("en-US")} – {c.heightTo.toLocaleString("en-US")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="xl__table-empty">
                        {hasAddress && r.valid ? "No relationships in this window." : "Relationships appear here once an address is selected."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="xl__stat">
      <span className="xi__stat-label mono">{label}</span>
      <span className="xl__stat-value">{value}</span>
    </div>
  );
}
