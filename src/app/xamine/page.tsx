import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ArrowUpRight, Bolt, Chart, Layers, Nodes, Shield, Wallet } from "@/components/Icons";
import { FX_APP_ORIGIN } from "@/lib/api";

export const metadata: Metadata = {
  title: "Xamine: Litecoin Analytics on Governed Data",
  description: "The ForceX analytics and intelligence surface. Analyze trends, relationships, supply, network behavior, and address activity with governed, trusted Litecoin data.",
};

const FEATURES = [
  { Icon: Bolt, title: "Economic throughput", body: "Adjusted volume that strips change outputs and self-transfers so you see real economic activity, not raw transfer totals.", href: `${FX_APP_ORIGIN}/xamine/charts/adjusted-volume` },
  { Icon: Nodes, title: "Address LinX", body: "Investigate address interactions and map relationship patterns across on-chain activity.", href: `${FX_APP_ORIGIN}/xamine/diagrams/address-relationships` },
  { Icon: Layers, title: "Supply methodology", body: "Scheduled issuance versus miner-claimed subsidy, circulating maximums, and MWEB-aware supply visibility.", href: `${FX_APP_ORIGIN}/xamine` },
  { Icon: Chart, title: "Network behavior", body: "Transactions, fees, block sizes, and active addresses over time, with completed history kept separate from live windows.", href: `${FX_APP_ORIGIN}/xamine` },
  { Icon: Wallet, title: "Watchlist alerts", body: "Follow addresses and get notified on activity, backed by the same validated address ledger.", href: `${FX_APP_ORIGIN}/xamine` },
  { Icon: Shield, title: "Validation aware", body: "Every chart carries the validated height it was built from. Provisional windows are labelled, never silently mixed.", href: "/data-quality" },
];

export default function XaminePage() {
  return (
    <>
      <PageHero
        eyebrow="Xamine · analytics and intelligence"
        title={
          <>
            Analytics designed to reveal insights with <em className="serif">confidence</em>.
          </>
        }
        lead="Xamine is the analytics and intelligence surface of ForceX. Analyze trends, relationships, supply, network behavior, and address activity with governed, trusted data."
        actions={
          <>
            <a href={`${FX_APP_ORIGIN}/xamine`} className="btn btn--accent btn--lg">
              Open Xamine
              <span className="btn__ico">
                <ArrowUpRight />
              </span>
            </a>
            <Link href="/signup" className="btn btn--ghost btn--lg">
              Create free account
            </Link>
          </>
        }
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="values">
            {FEATURES.map(({ Icon, title, body, href }, i) => {
              const external = href.startsWith("http");
              const inner = (
                <>
                  <span className="value__ico" style={{ color: "var(--xamine)" }}>
                    <Icon />
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className="link-arrow" style={{ color: "var(--xamine)", fontSize: 14 }}>
                    Open <ArrowUpRight size={14} />
                  </span>
                </>
              );
              return external ? (
                <a key={title} href={href} className="value card--hover" data-spot="" data-reveal style={{ ["--d" as string]: `${(i % 3) * 60}ms` }}>
                  {inner}
                </a>
              ) : (
                <Link key={title} href={href} className="value card--hover" data-spot="" data-reveal style={{ ["--d" as string]: `${(i % 3) * 60}ms` }}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section quality">
        <div className="container statement__grid">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Governed, not just graphed
            </span>
            <h2 className="statement__quote" data-reveal style={{ marginTop: 22 }}>
              A chart can look authoritative even when the calculation behind it was never <em className="serif">verified</em>.
            </h2>
          </div>
          <div data-reveal style={{ ["--d" as string]: "100ms" }}>
            <p className="lead">
              Xamine separates source-native data from derived calculations, labels provisional windows, and anchors every
              series to the validated height it was built from. When the underlying data has not passed validation, the
              panel says so instead of showing a number.
            </p>
            <Link href="/data-quality" className="link-arrow" style={{ marginTop: 22 }}>
              Read the data quality methodology <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Included with every account"
        title="Xamine is part of the public beta."
        body="Create a free account to open analytics, watchlists, and Address LinX on verified Litecoin data."
        primary={{ href: "/signup", label: "Create free account" }}
        secondary={{ href: "/xplorer/litecoin", label: "Open the explorer" }}
      />
    </>
  );
}
