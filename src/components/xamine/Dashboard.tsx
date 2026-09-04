import Link from "next/link";
import { Chart } from "@/components/xamine/charts/Chart";
import { Provenance } from "@/components/xamine/Provenance";
import { Counter } from "@/components/Counter";
import { ArrowUpRight, Nodes } from "@/components/Icons";
import { CHARTS, GROUPS, GROUP_ORDER, TOOLS } from "@/lib/xamine/catalog";
import type { DashboardPayload } from "@/lib/xamine/types";

/**
 * The Xamine dashboard, as in the live application: all-time totals, the
 * featured chart beside the data-quality panel, and the analytics surfaces.
 */
export function Dashboard({ d, appOrigin }: { d: DashboardPayload; appOrigin: string }) {
  const q = d.quality;
  const ok = q.state === "validated";
  return (
    <section className="xd section" id="dashboard" aria-labelledby="xd-title">
      <div className="container">
        <header className="xd__head">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h2 className="xd__title" id="xd-title">
              Visual intelligence on validated on-chain data.
            </h2>
          </div>
          <div className="xd__stats">
            <Stat label="All time blocks" value={d.stats.allTimeBlocks} />
            <Stat label="All time addresses" value={d.stats.allTimeAddresses} />
            <Stat label="All time transactions" value={d.stats.allTimeTransactions} />
          </div>
        </header>

        <div className="xd__grid">
          <article className="xi xi--card xd__featured">
            <i className="xi__corner xi__corner--tl" aria-hidden="true" />
            <i className="xi__corner xi__corner--tr" aria-hidden="true" />
            <i className="xi__corner xi__corner--bl" aria-hidden="true" />
            <i className="xi__corner xi__corner--br" aria-hidden="true" />
            <header className="xd__card-head">
              <div>
                <span className="xc__caption mono">Featured</span>
                <h3 className="xd__card-title">Adjusted Economic Volume</h3>
              </div>
              <Link href="/xamine/charts/adjusted-economic-volume" className="xd__open" aria-label="Open Adjusted Economic Volume">
                <ArrowUpRight size={16} />
              </Link>
            </header>
            <div className="xd__card-body">
              <span className="xc__watermark" aria-hidden="true">
                FORCEX
              </span>
              <Chart data={d.featured.data} height={320} />
            </div>
            <footer className="xc__card-foot">
              <Provenance p={d.featured.provenance} />
            </footer>
          </article>

          <aside className={`xi xi--card xd__quality ${ok ? "is-ok" : ""}`}>
            <header className="xd__card-head">
              <span className="xc__caption mono">Data quality</span>
              <span className={`xd__badge mono ${ok ? "is-ok" : "is-warn"}`}>{ok ? "Verified" : q.state}</span>
            </header>
            <ul className="xd__groups">
              {q.groups.map((g) => (
                <li key={g.label} className={`xd__group mono ${g.ok ? "is-ok" : ""}`}>
                  <i aria-hidden="true" />
                  {g.label}
                </li>
              ))}
            </ul>
            <div className="xd__quality-body">
              <p className="xd__quality-lead">
                Validated through block <b>{q.validatedThrough != null ? `#${q.validatedThrough.toLocaleString("en-US")}` : "—"}</b>.
              </p>
              <p>
                {q.controlsPassing ?? "—"} of {q.controlsTotal ?? "—"} controls passing: {q.perBlock ?? "—"} run every block, {q.periodic ?? "—"} periodic external node cross-check.
              </p>
              <p>
                External node cross-check confirmed at block {q.crossCheckHeight != null ? q.crossCheckHeight.toLocaleString("en-US") : "—"} · next check in {q.crossCheckNextIn ?? "—"} blocks.
              </p>
            </div>
            <div className="xd__quality-actions">
              <Link href="/data-quality" className="vgb vgb--glass">
                <i className="vgb__dot" aria-hidden="true" />
                <span className="vgb__label">Data quality details</span>
              </Link>
              <Link href="/data-quality#method" className="link-arrow mono xd__quality-link">
                How ForceX ensures data quality <ArrowUpRight size={13} />
              </Link>
            </div>
          </aside>
        </div>

        <div className="xd__surfaces">
          <div className="xd__surfaces-head">
            <h3 className="xd__surfaces-title">Analytics surfaces</h3>
            <span className="small">Twelve governed charts and one investigation tool.</span>
          </div>
          <div className="xd__surface-grid">
            {GROUP_ORDER.map((g) => (
              <div key={g} className="xd__surface">
                <span className="xd__surface-label mono">{GROUPS[g]}</span>
                {CHARTS.filter((c) => c.group === g).map((c) => (
                  <Link key={c.slug} href={`/xamine/charts/${c.slug}`} className="xd__surface-row">
                    <span>
                      <b>{c.title}</b>
                      <small>{c.summary}</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
            ))}
            <div className="xd__surface xd__surface--tools">
              <span className="xd__surface-label mono">Tools</span>
              {TOOLS.map((t) => (
                <Link key={t.slug} href={t.href} className="xd__surface-row">
                  <span>
                    <b>
                      {t.title} <Nodes size={14} />
                    </b>
                    <small>{t.summary}</small>
                  </span>
                  <ArrowUpRight size={14} />
                </Link>
              ))}
              <a href={`${appOrigin}/xamine`} className="xd__surface-row xd__surface-row--app">
                <span>
                  <b>Open the live application</b>
                  <small>Watchlists, alerts and account features need a signed-in session.</small>
                </span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="xd__stat">
      <span className="xd__stat-label mono">{label}</span>
      <span className="xd__stat-value mono">
        <Counter value={value} />
      </span>
    </div>
  );
}
