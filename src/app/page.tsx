import { getNetworkSummary } from "@/lib/api";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Pipeline } from "@/components/home/Pipeline";
import { SurfacesStack } from "@/components/home/SurfacesStack";
import { LayersScroll } from "@/components/home/LayersScroll";
import { BigStats } from "@/components/home/BigStats";
import { DeveloperStrip } from "@/components/home/DeveloperStrip";
import { McpSection } from "@/components/home/McpSection";
import { FinalCta } from "@/components/home/FinalCta";

export const revalidate = 30;

export default async function Home() {
  const summary = await getNetworkSummary();
  return (
    <>
      <Hero />
      <Manifesto />
      <Pipeline height={summary.asOf.height} />
      <SurfacesStack />
      <LayersScroll />
      <BigStats quality={summary.quality} />
      <DeveloperStrip quality={summary.quality} />
      <McpSection height={summary.asOf.height} />
      <FinalCta />
    </>
  );
}
