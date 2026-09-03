import Link from "next/link";
import { Split } from "@/components/fx/Split";
import { ArrowDown } from "@/components/Icons";
import { LedgerRows, type LedgerRow } from "./LedgerRows";

/**
 * The drift ledger: the ways an index silently diverges from the chain,
 * each paired with the live control that catches it. The section pins on
 * desktop while the rows land in sequence; the copy on the left holds still.
 */
/**
 * Each row pairs a way an index quietly drifts from the chain with the
 * published live validation rule that catches it. Names and codes follow
 * the public control catalog (FX-LVR-001 to FX-LVR-014).
 */
const ROWS: LedgerRow[] = [
  { risk: "Two views that disagree", effect: "An address total and its transaction links are built separately. If they diverge, one of them is wrong.", control: "LVR-005", name: "Address received cross-reconciliation" },
  { risk: "Reorgs, duplicates and null outputs", effect: "A transaction chart depends on how those cases were handled. The count stored on each block has to match what was written.", control: "LVR-010", name: "Block transaction count match" },
  { risk: "Balances that were never reconciled", effect: "Every coin an address is shown to hold must be backed by a real, unspent output at the validated tip.", control: "LVR-001", name: "Address balance reconciliation" },
  { risk: "Schedule mistaken for supply", effect: "Spendable LTC can never exceed what the halving schedule allows to exist, so scheduled issuance is not passed off as claimed subsidy.", control: "LVR-011", name: "Issued supply cap verification" },
  { risk: "A snapshot that drifted", effect: "The summary numbers on every explorer page come from one rolling snapshot. It is re-anchored to the real tip at each new block.", control: "LVR-009", name: "Rolling snapshot reconciliation" },
  { risk: "A number nobody checked externally", effect: "The indexed unspent output total is compared with what the Litecoin node itself reports, every 1,000 blocks.", control: "LVR-014", name: "Independent node cross-check" },
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
            An explorer shows what happened. ForceX proves it is <span className="hi">correct</span>.
          </Split>
          <p className="body" data-reveal style={{ margin: "18px 0 0", maxWidth: "34ch" }}>
            Six ways an index drifts from the chain, and the live control that catches each one.
          </p>
          <Link href="#pipeline" className="link-arrow" data-reveal style={{ marginTop: 26, fontSize: 15 }}>
            See the six gates <ArrowDown size={16} />
          </Link>
        </div>

        <LedgerRows rows={ROWS} />
      </div>
    </section>
  );
}
