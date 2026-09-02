import Link from "next/link";
import { Split } from "@/components/fx/Split";
import { ArrowDown, Check } from "@/components/Icons";

/**
 * The drift ledger: the ways an index silently diverges from the chain,
 * each paired with the live control that catches it. Rows reveal in
 * sequence and their status flips from risk to caught as they land.
 */
const ROWS = [
  { risk: "Bad joins", effect: "Balances attributed to the wrong address.", control: "LVR-005", name: "Address received cross-reconciliation" },
  { risk: "Missed edge cases", effect: "Reorgs, duplicates, and null outputs miscounted.", control: "LVR-010", name: "Block transaction count match" },
  { risk: "Incomplete reconciliation", effect: "Derived totals drift from canonical chain state.", control: "LVR-001", name: "Address balance reconciliation" },
  { risk: "Improper supply logic", effect: "Scheduled issuance mistaken for coins actually claimed.", control: "LVR-011", name: "Issued supply cap verification" },
  { risk: "Stale metadata", effect: "Yesterday's snapshot leaking into today's summaries.", control: "LVR-009", name: "Rolling snapshot reconciliation" },
  { risk: "Unvalidated calculations", effect: "An authoritative-looking panel nobody cross-checked.", control: "LVR-014", name: "Independent node cross-check" },
];

export function Manifesto() {
  return (
    <section className="ledger" aria-labelledby="ledger-title">
      <div className="container ledger__grid">
        <div className="ledger__copy">
          <span className="eyebrow" data-reveal="fade">
            Not just another explorer
          </span>
          <Split as="h2" type="lines" className="h2 ledger__title" style={{ margin: "18px 0 0" }}>
            An explorer shows you what happened. ForceX proves that what is shown is <em className="serif">correct</em>.
          </Split>
          <p className="body" data-reveal style={{ margin: "22px 0 0", maxWidth: "40ch" }}>
            Every parse, index, transform, and join is a chance to drift from the chain while still looking perfectly
            healthy. These are the failure modes ForceX is built to catch, and the live control that catches each one.
          </p>
          <Link href="#pipeline" className="link-arrow" data-reveal style={{ marginTop: 26, fontSize: 15 }}>
            See the six gates <ArrowDown size={16} />
          </Link>
        </div>

        <ol className="ledger__rows" id="ledger-title">
          {ROWS.map((r, i) => (
            <li key={r.risk} className="ledger__row" data-reveal style={{ ["--d" as string]: `${i * 90}ms`, ["--i" as string]: i }}>
              <span className="ledger__idx mono">0{i + 1}</span>
              <span className="ledger__main">
                <b>{r.risk}</b>
                <span>{r.effect}</span>
              </span>
              <span className="ledger__status" aria-label={`Caught by ${r.control}, ${r.name}`}>
                <span className="ledger__flip">
                  <span className="ledger__risk">
                    <i />
                    Risk
                  </span>
                  <span className="ledger__caught">
                    <Check size={11} />
                    Caught · {r.control}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
