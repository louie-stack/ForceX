import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
