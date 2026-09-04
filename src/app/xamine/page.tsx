import type { Metadata } from "next";
import { XamineHero, type HeroSeries } from "@/components/xamine/XamineHero";
import { Dashboard } from "@/components/xamine/Dashboard";
import { Subnav } from "@/components/xamine/Subnav";
import { getDashboard } from "@/lib/xamine/provider";
import { FX_APP_ORIGIN, getChainHome, getNetworkSummary } from "@/lib/api";

export const revalidate = 60;

/** Placeholder 30-day series for when the live one cannot be read; labelled as a sample in the UI. */
function sampleSeries(base: number, amp: number, seed: number): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  const day = 86_400_000;
  const start = Date.now() - 29 * day;
  let r = seed;
  for (let i = 0; i < 30; i++) {
    r = (r * 9301 + 49297) % 233280;
    const noise = (r / 233280 - 0.5) * amp * 0.5;
    const wave = Math.sin(i * 0.42 + seed) * amp * 0.45 + Math.sin(i * 0.11) * amp * 0.3;
    out.push({ date: new Date(start + i * day).toISOString().slice(0, 10), value: Math.round(base + wave + noise) });
  }
  return out;
}

export const metadata: Metadata = {
  title: "Xamine: Litecoin Analytics on Governed Data",
  description: "The ForceX analytics and intelligence surface. Analyze trends, relationships, supply, network behavior, and address activity with governed, trusted Litecoin data.",
};


export default async function XaminePage() {
  const [summary, chain, dashboard] = await Promise.all([getNetworkSummary(), getChainHome(), getDashboard()]);
  const tx = chain?.txDaily ?? [];
  const mweb = chain?.mwebDaily ?? [];
  const series: HeroSeries[] = [
    {
      key: "tx",
      label: "Transactions",
      divisor: 1,
      zero: false,
      unit: "",
      data: tx.length > 1 ? tx : sampleSeries(118_000, 46_000, 7),
      sample: tx.length <= 1,
    },
    {
      key: "mweb",
      label: "MWEB pool",
      divisor: 1e8,
      zero: false,
      unit: " LTC",
      data: mweb.length > 1 ? mweb : sampleSeries(182_000 * 1e8, 6_000 * 1e8, 3),
      sample: mweb.length <= 1,
    },
  ];

  return (
    <div className="page-xamine">
      <XamineHero summary={summary} series={series} appHref={`${FX_APP_ORIGIN}/xamine`} />

      <Subnav appHref={`${FX_APP_ORIGIN}/xamine`} />
      <Dashboard d={dashboard} appOrigin={FX_APP_ORIGIN} />
    </div>
  );
}
