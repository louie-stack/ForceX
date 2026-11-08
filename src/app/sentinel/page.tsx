import type { Metadata } from "next";
import { Bolt, Nodes, Shield } from "@/components/Icons";
import { ProductDraft } from "@/components/product/ProductDraft";

// DRAFT: wording from the 2026-10-28 call, pending the Sentinel one-sheet.
export const metadata: Metadata = {
  title: "Sentinel",
  description: "An early warning system partners subscribe to, with webhooks when the chain changes under them.",
  robots: { index: false, follow: false },
};

export default function SentinelPage() {
  return (
    <ProductDraft
      name="Sentinel"
      kicker="Sentinel · Early warning"
      title={
        <>
          On <span className="vg__hi">guard</span> while your service runs.
        </>
      }
      lead={
        <>
          Partners subscribe to Sentinel. If something changes on the chain that affects them, it sends a{" "}
          <b>webhook</b> so they can pause until it is resolved.
        </>
      }
      itemsEyebrow="What it watches"
      itemsTitle={
        <>
          Alerts, <em>not surprises.</em>
        </>
      }
      items={[
        {
          Icon: Nodes,
          title: "Chain tip deviations",
          body: "Variations or deviations at the chain tip, flagged as they happen.",
        },
        {
          Icon: Shield,
          title: "Scout follow-through",
          body: "If a transaction sent through Scout changes in the next few blocks, Sentinel tells you.",
        },
        {
          Icon: Bolt,
          title: "Webhooks to pause",
          body: "Each alert is a webhook, so partners can stop transactions on the chain until it is resolved.",
        },
      ]}
      statementEyebrow="Scout and Sentinel"
      statement={
        <>
          Scout checks a transaction before you settle.{" "}
          <span className="hi">Sentinel keeps watching after you do.</span>
        </>
      }
      closeTitle="Subscribe your service to Sentinel."
      closeLead="Talk to the team about connecting Sentinel webhooks."
    />
  );
}
