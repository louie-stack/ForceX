import Link from "next/link";
import type { QualityStatus } from "@/lib/api";
import { Counter } from "@/components/Counter";
import { ArrowUpRight } from "@/components/Icons";
import catalog from "@/content/validation-content.json";

const LAYERS = [
  {
    title: "Structural constraints",
    body: "Invalid relational states are blocked by schema design. Primary keys, foreign keys, uniqueness rules, and check constraints prevent invalid rows from being committed in the first place.",
    tag: "190 enforcement points at write time",
  },
  {
    title: "Write-path controls",
    body: "Per-block and inline checks confirm that the writer committed what it intended to write. Designed to detect parser defects, partial writes, and disagreements between in-memory state and stored block results.",
    tag: "Runs on every block",
  },
  {
    title: "Accounting reconciliation",
    body: "Balances, totals, counts, and supply-related values are reconciled across canonical and derived data surfaces so independently built paths remain aligned.",
    tag: "Per-block trust signal",
  },
  {
    title: "External source cross-check",
    body: "Periodic node-level comparison confirms that ForceX is not only internally consistent, but aligned with the Litecoin node as an independent source of truth.",
    tag: "Every 1,000 blocks",
  },
];

export function QualityLayers({ quality }: { quality: QualityStatus | null }) {
  const domains = catalog.domains as Record<string, { title: string; description: string }>;
  const controls = catalog.controls as Record<string, { domain: string; title: string }>;
  const byDomain = (d: string) => Object.keys(controls).filter((k) => controls[k].domain === d);

  return (
    <section className="section quality">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Data quality framework
            </span>
            <h2 className="h2" data-reveal style={{ margin: "18px 0 0" }}>
              Four layers of integrity control. No single layer is sufficient on its own.
            </h2>
          </div>
          <Link href="/data-quality" className="btn btn--ghost" data-reveal>
            Read the methodology
            <span className="btn__ico">
              <ArrowUpRight />
            </span>
          </Link>
        </div>

        <div className="stats" data-reveal>
          <div className="stat">
            <span className="stat__value">
              <Counter value={242} />
            </span>
            <span className="stat__label">Enforcement points</span>
            <span className="stat__meta">9 type codes · spec 3.3</span>
          </div>
          <div className="stat">
            <span className="stat__value">
              <Counter value={quality?.controls.passing ?? 14} />
              <small>/ {quality?.controls.total ?? 14}</small>
            </span>
            <span className="stat__label">Live controls passing</span>
            <span className="stat__meta">{quality ? `Block ${quality.tip_height.toLocaleString("en-US")}` : "Live status"}</span>
          </div>
          <div className="stat">
            <span className="stat__value">
              <Counter value={1000} />
            </span>
            <span className="stat__label">Block cadence, node cross-check</span>
            <span className="stat__meta">
              {quality ? `Next due in ${quality.node_cross_check.next_due_in_blocks} blocks` : "gettxoutsetinfo"}
            </span>
          </div>
          <div className="stat">
            <span className="stat__value">
              <Counter value={190} />
            </span>
            <span className="stat__label">Structural database constraints</span>
            <span className="stat__meta">Enforced at write time</span>
          </div>
        </div>

        <div className="layers">
          {LAYERS.map((l, i) => (
            <div key={l.title} className="layer" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
              <span className="layer__idx">0{i + 1}</span>
              <div>
                <h3>{l.title}</h3>
                <span className="chip layer__tag">
                  <span className="chip__dot" />
                  {l.tag}
                </span>
              </div>
              <p>{l.body}</p>
            </div>
          ))}
        </div>

        <div className="domains">
          {(["monetary", "address", "block_write"] as const).map((d, i) => (
            <div key={d} className="domain" data-reveal style={{ ["--d" as string]: `${i * 60}ms` }}>
              <div className="domain__head">
                <h4>{domains[d].title}</h4>
                <span className={`chip ${quality?.state === "validated" ? "" : "chip--pending"}`}>
                  <span className="chip__dot" />
                  {quality?.state === "validated" ? "Passing" : "Pending"}
                </span>
              </div>
              <p>{domains[d].description}</p>
              <div className="domain__codes">
                {byDomain(d).map((code) => (
                  <span key={code}>{code.replace("FX-", "")}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
