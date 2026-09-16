import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic } from "@/components/fx/Magnetic";
import { ArrowUpRight, Chart, Check, Layers, Shield } from "@/components/Icons";
import { Subnav } from "@/components/xamine/Subnav";
import { ThroughputHero, type ThroughputDay } from "@/components/xamine/throughput/ThroughputHero";
import { TxAnatomy } from "@/components/xamine/throughput/TxAnatomy";
import { FX_APP_ORIGIN, getNetworkSummary } from "@/lib/api";
import { bySlug } from "@/lib/xamine/catalog";
import { defaultRange, getChart } from "@/lib/xamine/provider";

export const metadata: Metadata = {
  title: "Economic Throughput",
  description: "Real economic activity on Litecoin: adjusted volume that strips change outputs and self-transfers from raw transfer totals.",
};

export const revalidate = 900;

const FACTS = [
  { Icon: Layers, title: "Adjusted", body: "Change outputs and self-transfers removed, so the series measures value that moved between parties." },
  { Icon: Chart, title: "Daily and weekly", body: "Completed history kept separate from the live window, with no in-progress bucket folded into the totals." },
  { Icon: Shield, title: "Validated", body: "Every series anchored to the block it was built from, with provenance on every chart." },
];

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

export default async function EconomicThroughputPage() {
  const [volume, dist, summary] = await Promise.all([
    getChart("adjusted-economic-volume", { grain: "day", view: "incremental", ...defaultRange(30) }),
    getChart("adjusted-transaction-volume-distribution", { grain: "day", view: "incremental", ...defaultRange(30) }),
    getNetworkSummary().catch(() => null),
  ]);

  const series = volume.data.kind === "timeseries" ? volume.data.series : [];
  const gross = series.find((s) => s.key === "gross")?.points ?? [];
  const pay = new Map((series.find((s) => s.key === "payment")?.points ?? []).map((p) => [p.date, p.value]));
  const days: ThroughputDay[] = gross.filter((p) => p.value != null).map((p) => ({ date: p.date, gross: p.value as number, payment: Math.min(p.value as number, pay.get(p.date) ?? 0) }));
  const buckets = dist.data.kind === "distribution" ? dist.data.buckets : [];
  const bMax = Math.max(1, ...buckets.map((b) => b.count));
  const dMax = Math.max(1, ...days.map((x) => x.gross));

  const height = summary?.quality?.tip_height ?? summary?.asOf.height ?? volume.provenance.validatedHeight ?? null;
  const sample = volume.provenance.source === "sample";
  const vol = bySlug("adjusted-economic-volume")!;
  const distDef = bySlug("adjusted-transaction-volume-distribution")!;
  const appHref = `${FX_APP_ORIGIN}${vol.appPath}`;

  return (
    <div className="page-xamine etp">
      <ThroughputHero days={days} sample={sample} height={height} appHref={appHref} chartHref={`/xamine/charts/${vol.slug}`} />
      <Subnav appHref={appHref} />

      {/* Methodology: the steps and one transaction run on the same clock. */}
      <section className="xtp-sec xtp-sec--band" aria-labelledby="et-method">
        <div className="container">
          <div className="xtp-head">
            <div>
              <span className="eyebrow xtp-eyebrow" data-reveal="fade">
                Methodology
              </span>
              <h2 className="xtp-h2" id="et-method" data-reveal>
                Payment, <em>not plumbing.</em>
              </h2>
              <p className="xtp-lead" data-reveal style={d(80)}>
                Gross output volume counts every coin an output touches, including change returning to the sender. Adjusted volume removes it.
              </p>
            </div>
          </div>
          <div data-reveal style={d(120)}>
            <TxAnatomy height={height} />
          </div>
        </div>
      </section>

      {/* What you get, and where to read it. */}
      <section className="xtp-sec xtp-sec--rule" aria-labelledby="et-read">
        <div className="container">
          <div className="xtp-head">
            <div>
              <span className="eyebrow xtp-eyebrow" data-reveal="fade">
                In Xamine
              </span>
              <h2 className="xtp-h2" id="et-read" data-reveal>
                Read it in two surfaces.
              </h2>
            </div>
            <Link href="/xamine" className="link-arrow" data-reveal style={d(140)}>
              All Xamine charts <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="xtp-grid xtp-grid--3">
            {FACTS.map(({ Icon, title, body }, i) => (
              <div key={title} className="xtp-item" data-reveal style={d(i * 80)}>
                <div className="xtp-item__top">
                  <span className="xtp-item__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="xtp-item__ico">
                    <Icon size={20} />
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>

          <div className="et-cards">
            <Link href={`/xamine/charts/${vol.slug}`} className="et-card" data-reveal>
              <div className="et-card__fig et-card__fig--bars" aria-hidden="true">
                {days.map((x) => (
                  <span key={x.date} style={{ ["--g" as string]: x.gross / dMax, ["--p" as string]: x.gross ? x.payment / x.gross : 0 }}>
                    <i />
                  </span>
                ))}
              </div>
              <div className="et-card__copy">
                <span className="et-card__k mono">Market activity · Chart</span>
                <h3>{vol.title}</h3>
                <p>{vol.summary}</p>
                <span className="link-arrow mono">
                  Open chart <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
            <Link href={`/xamine/charts/${distDef.slug}`} className="et-card" data-reveal style={d(100)}>
              <div className="et-card__fig et-card__fig--dist" aria-hidden="true">
                {buckets.map((b) => (
                  <span key={b.label} style={{ ["--h" as string]: b.count / bMax }} />
                ))}
              </div>
              <div className="et-card__copy">
                <span className="et-card__k mono">Market activity · Distribution</span>
                <h3>{distDef.title}</h3>
                <p>{distDef.summary}</p>
                <span className="link-arrow mono">
                  Open chart <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="xtp-close" aria-label="Get started">
        <div className="container">
          <span className="eyebrow xtp-eyebrow" data-reveal="fade">
            Included with every account
          </span>
          <h2 className="xtp-close__title" data-reveal>
            Part of the <em>public beta.</em>
          </h2>
          <p className="xtp-lead" data-reveal style={d(160)}>
            Free accounts include Xplorer, Xamine, watchlists, and platform API keys.
          </p>
          <ul className="et-close__list" data-reveal style={d(200)}>
            {["Xplorer", "Xamine", "Watchlists", "Platform API keys"].map((x) => (
              <li key={x}>
                <Check size={14} /> {x}
              </li>
            ))}
          </ul>
          <div className="xtp-close__actions" data-reveal style={d(240)}>
            <Magnetic>
              <Link href="/signup" className="btn btn--accent btn--lg">
                Create free account
                <span className="btn__ico">
                  <ArrowUpRight />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/xamine" className="btn btn--ghost btn--lg">
                All Xamine features
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  );
}
