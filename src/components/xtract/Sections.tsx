import Link from "next/link";
import { Magnetic } from "@/components/fx/Magnetic";
import { ArrowUpRight, Bolt, Building, Check, Code, Database, Layers, Shield, Users, Wallet } from "@/components/Icons";

const COVERAGE = [
  { Icon: Database, title: "Network and blocks", body: "Block headers, summaries, difficulty, supply, fees, and network metrics." },
  { Icon: Bolt, title: "Transactions", body: "Transactions, status, fees, inputs, outputs, confirmations, and mempool activity." },
  { Icon: Users, title: "Addresses", body: "Balances, activity, received and sent history, and UTXO information." },
  { Icon: Layers, title: "MWEB data", body: "MWEB balances, peg activity, and privacy-layer supply metrics where available." },
  { Icon: Wallet, title: "Market and pricing", body: "Litecoin price, market, supply, and economic indicators alongside chain data." },
  { Icon: Shield, title: "Data quality and metadata", body: "Quality scores, validation metadata, timestamps, and confidence indicators." },
];

const CHECKS: [string, string][] = [
  ["Validated controls", "14 live rules run at tip, recorded with the block they ran at"],
  ["Litecoin-first coverage", "chain, mempool, MWEB, market, and quality endpoints"],
  ["Governance before display", "meta.validation on every chain response"],
  ["Trusted on-chain intelligence", "adjusted volume and supply methodology, not raw totals"],
  ["Quality metadata where available", "validated_height, lag_blocks, dataset_version"],
];

const USERS = [
  { Icon: Code, title: "Builders", body: "Build applications with clean, validated blockchain data and simple integration." },
  { Icon: Wallet, title: "Wallets", body: "Power balances, history, notifications, and address activity with confidence." },
  { Icon: Layers, title: "Analysts", body: "Perform on-chain analysis using trusted, consistent, and complete data." },
  { Icon: Building, title: "Institutions", body: "Use governed blockchain data for reporting, compliance, research, and strategic intelligence." },
];

/** Coverage: heading and link on one baseline, then six hairline columns. */
export function Coverage() {
  return (
    <section className="xtp-sec xtp-sec--rule" id="endpoints" aria-label="Coverage">
      <div className="container">
        <div className="xtp-head">
          <div>
            <span className="eyebrow xtp-eyebrow" data-reveal="fade">
              Coverage
            </span>
            <h2 className="xtp-h2" data-reveal>
              Powerful endpoints. Reliable data.
            </h2>
            <p className="xtp-lead" data-reveal style={{ ["--d" as string]: "80ms" }}>
              Comprehensive coverage across the Litecoin blockchain and ecosystem.
            </p>
          </div>
          <Link href="/xtract/docs#reference" className="link-arrow" data-reveal style={{ ["--d" as string]: "140ms" }}>
            Endpoint reference <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="xtp-grid xtp-grid--3">
          {COVERAGE.map(({ Icon, title, body }, i) => (
            <div key={title} className="xtp-item" data-reveal style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}>
              <div className="xtp-item__top">
                <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="xtp-item__ico">
                  <Icon size={20} />
                </span>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Data quality: text left, the five controls as a hairline list right. */
export function Quality() {
  return (
    <section className="xtp-sec xtp-sec--rule" aria-label="Data quality">
      <div className="container xtp-two">
        <div>
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Data quality
          </span>
          <h2 className="xtp-h2" data-reveal>
            ForceX data quality you can build on.
          </h2>
          <p className="xtp-lead" data-reveal style={{ ["--d" as string]: "80ms" }}>
            Xtract does not simply expose parsed blockchain data. It delivers data that has passed ForceX validation,
            reconciliation, and governance controls before it reaches your application.
          </p>
          <Link href="/data-quality" className="link-arrow" data-reveal style={{ ["--d" as string]: "140ms", marginTop: 30 }}>
            Learn how ForceX ensures data quality <ArrowUpRight size={16} />
          </Link>
        </div>

        <ul className="xtp-checks">
          {CHECKS.map(([b, s], i) => (
            <li key={b} className="xtp-check" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
              <span className="xtp-check__ico">
                <Check size={18} />
              </span>
              <span>
                <b>{b}</b>
                <span>{s}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Use cases: four hairline columns, tighter than coverage. */
export function UseCases() {
  return (
    <section className="xtp-sec xtp-sec--rule" id="use-cases" aria-label="Use cases">
      <div className="container">
        <span className="eyebrow xtp-eyebrow" data-reveal="fade">
          Use cases
        </span>
        <h2 className="xtp-h2" data-reveal>
          Who uses Xtract?
        </h2>
        <div className="xtp-grid xtp-grid--4">
          {USERS.map(({ Icon, title, body }, i) => (
            <div key={title} className="xtp-item" data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
              <div className="xtp-item__top">
                <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="xtp-item__ico">
                  <Icon size={20} />
                </span>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Close: left-aligned, the largest type on the page, two buttons. */
export function Close() {
  return (
    <section className="xtp-close" aria-label="Build with ForceX">
      <div className="container">
        <span className="eyebrow xtp-eyebrow" data-reveal="fade">
          Build with ForceX
        </span>
        <h2 className="xtp-close__title" data-reveal-lines>
          <span className="line">
            <span>Ready to build with</span>
          </span>
          <span className="line">
            <span>
              <em>trusted</em> Litecoin data?
            </span>
          </span>
        </h2>
        <p className="xtp-lead" data-reveal style={{ ["--d" as string]: "160ms" }}>
          Get API access or explore the documentation to start building with Xtract.
        </p>
        <div className="xtp-close__actions" data-reveal style={{ ["--d" as string]: "240ms" }}>
          <Magnetic>
            <Link href="/signup" className="btn btn--accent btn--lg">
              Get API access
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </Link>
          </Magnetic>
          <Magnetic>
            <Link href="/xtract/docs" className="btn btn--ghost btn--lg">
              View API docs
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
