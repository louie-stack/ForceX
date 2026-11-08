import type { Metadata } from "next";
import { Bolt, Search, Shield } from "@/components/Icons";
import { ProductDraft } from "@/components/product/ProductDraft";

// DRAFT: wording from the 2026-10-28 call, pending the Scout one-sheet.
export const metadata: Metadata = {
  title: "Scout",
  description: "Pre-validation for mempool transactions, so partners can settle before confirmations.",
  robots: { index: false, follow: false },
};

export default function ScoutPage() {
  return (
    <ProductDraft
      name="Scout"
      kicker="Scout · In testing with partners"
      title={
        <>
          Settle <span className="vg__hi">before</span> confirmations.
        </>
      }
      lead={
        <>
          Partners point Scout at a specific mempool transaction. ForceX runs its full validation on it first, so they
          get an answer in <b>seconds or less</b>.
        </>
      }
      itemsEyebrow="How it works"
      itemsTitle={
        <>
          The same checks, <em>run on the mempool.</em>
        </>
      }
      items={[
        {
          Icon: Search,
          title: "Mempool pre-validation",
          body: "Every transaction entering the mempool is pre-verified and pre-validated as it is indexed.",
        },
        {
          Icon: Bolt,
          title: "Partner focus",
          body: "A partner names the transaction they are settling, and Scout puts it first.",
        },
        {
          Icon: Shield,
          title: "Checked before settlement",
          body: "No double spend, no missing attribution, and the funds are really there.",
        },
      ]}
      statementEyebrow="The pipeline"
      statement={
        <>
          Parsed, stored, reconciled, validated, cross-checked and verified.{" "}
          <span className="hi">Scout runs it on a transaction before the chain confirms it.</span>
        </>
      }
      closeTitle="Bring Scout into your settlement flow."
      closeLead="Scout is being tested with partner requests. Talk to the team about access."
    />
  );
}
