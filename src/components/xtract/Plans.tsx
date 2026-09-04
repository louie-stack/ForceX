"use client";

import Link from "next/link";
import { Counter } from "@/components/Counter";

const PLANS = [
  { name: "Starter", credits: 300_000, hourly: "12K credits/hr", sustained: "200 credits/min", burst: "20 credits/sec" },
  { name: "Builder", credits: 3_000_000, hourly: "36K credits/hr", sustained: "600 credits/min", burst: "50 credits/sec", featured: true },
  { name: "Growth", credits: 30_000_000, hourly: "90K credits/hr", sustained: "1,500 credits/min", burst: "100 credits/sec" },
];

const compact = (n: number) => (n >= 1_000_000 ? `${Math.round(n / 1_000_000)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(Math.round(n)));

/** Plans as a hairline three-column table, not floating cards. */
export function Plans() {
  return (
    <section className="xtp-sec xtp-sec--rule" id="plans" aria-label="Plans">
      <div className="container">
        <div className="xtp-head">
          <div>
            <span className="eyebrow xtp-eyebrow" data-reveal="fade">
              Plans
            </span>
            <h2 className="xtp-h2" data-reveal>
              Simple, predictable pricing.
            </h2>
            <p className="xtp-lead" data-reveal style={{ ["--d" as string]: "80ms" }}>
              Choose the Xtract plan that fits your usage. All paid plans include API and MCP access to validated Litecoin data.
            </p>
          </div>
        </div>

        <div className="xtp-table">
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className={`xtp-plan ${p.featured ? "xtp-plan--featured" : ""}`}
              data-reveal
              style={{ ["--d" as string]: `${i * 80}ms` }}
            >
              <div className="xtp-plan__top">
                <h3 className="xtp-plan__name">{p.name}</h3>
                {p.featured && <span className="xtp-plan__pop">Most popular</span>}
              </div>
              <div className="xtp-plan__credits">
                <Counter value={p.credits} format={compact} duration={1400} />
                <small>credits per month</small>
              </div>
              <dl className="xtp-plan__rows">
                <div>
                  <dt>Hourly capacity</dt>
                  <dd>{p.hourly}</dd>
                </div>
                <div>
                  <dt>Sustained rate</dt>
                  <dd>{p.sustained}</dd>
                </div>
                <div>
                  <dt>Burst window</dt>
                  <dd>{p.burst}</dd>
                </div>
              </dl>
              <div className="xtp-plan__cta">
                <Link
                  href={`/signup?return_to=/xtract/plans/%3Fplan%3D${p.name.toLowerCase()}`}
                  className={`btn ${p.featured ? "btn--accent" : "btn--ghost"}`}
                >
                  Get {p.name} plan
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="xtp-note" data-reveal>
          Free accounts include a sandbox key: 30,000 period credits, 30 credits per minute, 5 credits per second.
        </p>
      </div>
    </section>
  );
}
