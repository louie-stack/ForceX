import type { Metadata } from "next";
import { Hero } from "@/components/xtract/Hero";
import { Coverage, Quality, UseCases, Close } from "@/components/xtract/Sections";
import { Plans } from "@/components/xtract/Plans";
import { fetchPublic, type QualityStatus } from "@/lib/api";

export const metadata: Metadata = {
  title: "Litecoin Data API: Validated Chain Data and MCP | Xtract",
  description: "Xtract is the API and data services layer from ForceX. Reliable, programmatic access to validated Litecoin on-chain data for builders, wallets, analysts, and institutions.",
};

export const revalidate = 60;

export default async function XtractPage() {
  const q = await fetchPublic<QualityStatus>("quality/status", 60);
  const height = q?.tip_height ?? 3170723;
  const validatedAt = (q?.validated_at ?? "2026-09-02T11:26:08Z").replace(/\.\d+(\+00:00|Z)$/, "Z");

  return (
    <div className="xtp">
      <Hero height={height} validatedAt={validatedAt} state={q?.state ?? "validated"} />
      <Coverage />
      <Quality />
      <Plans />
      <UseCases />
      <Close />
    </div>
  );
}
