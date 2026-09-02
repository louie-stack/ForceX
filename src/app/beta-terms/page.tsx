import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BETA_TERMS } from "@/content/legal";

export const metadata: Metadata = { title: "Beta Access Terms" };

export default function BetaTermsPage() {
  return <LegalPage doc={BETA_TERMS} />;
}
