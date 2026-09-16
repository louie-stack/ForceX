import type { Metadata } from "next";
import { LinxControls } from "@/components/xamine/LinxControls";
import { LinxExplorer } from "@/components/xamine/LinxExplorer";
import { Provenance } from "@/components/xamine/Provenance";
import { Subnav } from "@/components/xamine/Subnav";
import { ArrowUpRight } from "@/components/Icons";
import { FX_APP_ORIGIN, getNetworkSummary } from "@/lib/api";
import { fmtDateLong, inclusiveEnd } from "@/lib/xamine/format";
import {
  exampleQuery,
  getLinx,
  parseLinxQuery,
  type LinxQuery,
} from "@/lib/xamine/linx";

export const metadata: Metadata = {
  title: "Address LinX | Xamine",
  description:
    "Visualize address forensics across counterparties, flow patterns, and notable on-chain relationships.",
};

const ltc = (v: number) =>
  (Math.abs(v) / 1e8).toLocaleString("en-US", {
    maximumFractionDigits: Math.abs(v) / 1e8 < 1 ? 4 : 2,
  });
const num = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("en-US");

export default async function AddressLinxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseLinxQuery(await searchParams);
  const hasAddress = query.address.length > 0;
  // With nothing entered the tool opens on a worked example rather than an empty frame.
  const shown = hasAddress ? query : exampleQuery();
  const summary = await getNetworkSummary().catch(() => null);
  const tip = summary?.quality?.tip_height ?? summary?.asOf.height ?? null;
  const r = await getLinx(shown, tip);
  const invalid = hasAddress && !r.valid;
  const isExample = !hasAddress;
  const appHref = `${FX_APP_ORIGIN}/xamine/diagrams/address-relationships`;

  const cps = r.counterparties;

  return (
    <div className="page-xamine">
      <Subnav appHref={appHref} />
      <section className="xc xl">
        <div className="container">
          <header className="xc__head">
            <div>
              <span className="eyebrow">Address activity · Tool</span>
              <h1 className="xc__title">Address LinX</h1>
              <p className="xl__lead">
                Visualize address forensics across counterparties, flow
                patterns, and notable on-chain relationships.
              </p>
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

          {invalid ? (
            <article className="xi xi--card xc__card">
              <header className="xc__card-head">
                <div>
                  <span className="xc__caption mono">Selected address</span>
                  <h2 className="xc__card-title">Not a Litecoin address</h2>
                </div>
              </header>
              <div className="xl__empty-box">
                <p>
                  Enter a legacy (L, M, 3) or bech32 (ltc1) Litecoin address.
                </p>
              </div>
            </article>
          ) : (
            <LinxExplorer
              address={shown.address}
              counterparties={cps}
              explorerOrigin={FX_APP_ORIGIN}
              ledgerCaption={`${cps.length} relationships`}
              head={
                <header className="xc__card-head lx__head">
                  <div className="lx__head-copy">
                    <span className="xc__caption mono">
                      {isExample
                        ? "Example address · enter any Litecoin address above"
                        : "Selected address"}
                    </span>
                    <h2 className="xc__card-title xl__addr-title">
                      <span className="mono">{shown.address}</span>
                    </h2>
                  </div>
                  {!isExample && (
                    <a
                      href={`${FX_APP_ORIGIN}/xplorer/litecoin/address/${shown.address}`}
                      className="link-arrow mono xl__explorer"
                    >
                      View in explorer <ArrowUpRight size={13} />
                    </a>
                  )}
                </header>
              }
              aside={<LinxAside r={r} shown={shown} />}
              foot={
                <footer className="xc__card-foot">
                  <Provenance p={r.provenance} />
                  <span className="xc__foot-note mono">
                    Reconciled ledger · address integrity controls
                  </span>
                </footer>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

function LinxAside({
  r,
  shown,
}: {
  r: Awaited<ReturnType<typeof getLinx>>;
  shown: LinxQuery;
}) {
  const cps = r.counterparties;
  const received = cps
    .filter((c) => c.valueAtomic > 0)
    .reduce((a, c) => a + c.valueAtomic, 0);
  const sent = cps
    .filter((c) => c.valueAtomic < 0)
    .reduce((a, c) => a - c.valueAtomic, 0);
  const net = received - sent;
  const count = {
    in: cps.filter((c) => c.direction === "in").length,
    out: cps.filter((c) => c.direction === "out").length,
    both: cps.filter((c) => c.direction === "both").length,
  };
  const total = Math.max(1, cps.length);
  return (
    <aside className="lx__aside">
      <div className="lx__bal">
        <span className="xi__stat-label mono">Balance</span>
        <b>
          {r.summary?.balanceAtomic != null
            ? ltc(r.summary.balanceAtomic)
            : "—"}
          <small> LTC</small>
        </b>
      </div>

      <dl className="lx__flow">
        <div>
          <dt className="mono">Received</dt>
          <dd className="mono good">+{ltc(received)}</dd>
        </div>
        <div>
          <dt className="mono">Sent</dt>
          <dd className="mono bad">−{ltc(sent)}</dd>
        </div>
        <div className="is-net">
          <dt className="mono">Net flow</dt>
          <dd className={`mono ${net >= 0 ? "good" : "bad"}`}>
            {net >= 0 ? "+" : "−"}
            {ltc(net)}
          </dd>
        </div>
      </dl>

      <div className="lx__split">
        <div className="lx__split-head mono">
          <span>Counterparties</span>
          <b>{cps.length}</b>
        </div>
        <div className="lx__split-bar" aria-hidden="true">
          <i className="lx__sw--in" style={{ flexGrow: count.in / total }} />
          <i className="lx__sw--out" style={{ flexGrow: count.out / total }} />
          <i
            className="lx__sw--both"
            style={{ flexGrow: count.both / total }}
          />
        </div>
        <div className="lx__split-keys mono">
          <span>
            <i className="lx__sw lx__sw--in" /> {count.in} in
          </span>
          <span>
            <i className="lx__sw lx__sw--out" /> {count.out} out
          </span>
          <span>
            <i className="lx__sw lx__sw--both" /> {count.both} both
          </span>
        </div>
      </div>

      <dl className="lx__facts">
        <div>
          <dt className="mono">Transactions</dt>
          <dd>{num(r.summary?.txCount)}</dd>
        </div>
        <div>
          <dt className="mono">Window</dt>
          <dd>
            {fmtDateLong(shown.start)} to {fmtDateLong(inclusiveEnd(shown.end))}
          </dd>
        </div>
        <div>
          <dt className="mono">Height range</dt>
          <dd className="mono">
            {num(r.summary?.firstSeenHeight)} – {num(r.summary?.lastSeenHeight)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
