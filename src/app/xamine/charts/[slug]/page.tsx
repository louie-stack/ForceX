import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chart } from "@/components/xamine/charts/Chart";
import { ChartControls } from "@/components/xamine/ChartControls";
import { DownloadButton } from "@/components/xamine/DownloadButton";
import { InfoTabs } from "@/components/xamine/InfoTabs";
import { Subnav } from "@/components/xamine/Subnav";
import { Provenance } from "@/components/xamine/Provenance";
import { ArrowUpRight } from "@/components/Icons";
import { FX_APP_ORIGIN } from "@/lib/api";
import { CHARTS, GROUPS, byGroup, bySlug } from "@/lib/xamine/catalog";
import { fmtDateLong, inclusiveEnd } from "@/lib/xamine/format";
import { getChart, parseQuery } from "@/lib/xamine/provider";

export const revalidate = 900;

export function generateStaticParams() {
  return CHARTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const def = bySlug((await params).slug);
  if (!def) return {};
  return { title: `${def.title} | Xamine`, description: def.summary };
}

export default async function ChartPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const def = bySlug(slug);
  if (!def) notFound();
  const query = parseQuery(slug, await searchParams);
  const payload = await getChart(slug, query);
  const related = byGroup(def.group).filter((c) => c.slug !== slug);
  const caption =
    def.kind === "distribution"
      ? `Snapshot ${fmtDateLong(payload.data.kind === "distribution" ? payload.data.snapshotDate : query.end)}`
      : `${query.grain} · ${fmtDateLong(query.start)} to ${fmtDateLong(inclusiveEnd(query.end))}`;

  return (
    <div className="page-xamine">
      <Subnav appHref={`${FX_APP_ORIGIN}${def.appPath}`} />
      <section className="xc">
        <div className="container">
          <header className="xc__head">
            <div>
              <span className="eyebrow">{GROUPS[def.group]}</span>
              <h1 className="xc__title">{def.title}</h1>
            </div>
            <div className="xc__head-actions">
              {def.note && (
                <Link href={def.note.href} className="xc__note mono">
                  <i aria-hidden="true">i</i>
                  {def.note.label}
                </Link>
              )}
              <a href={`${FX_APP_ORIGIN}${def.appPath}`} className="vgb vgb--glass">
                <i className="vgb__dot" aria-hidden="true" />
                <span className="vgb__label">Open in Xamine</span>
                <span className="vgb__ico" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </span>
              </a>
            </div>
          </header>

          <InfoTabs information={def.information} methodology={def.methodology} />

          <ChartControls slug={slug} controls={def.controls} grains={def.grains} query={query} />

          <article className="xi xi--card xc__card">
            <i className="xi__corner xi__corner--tl" aria-hidden="true" />
            <i className="xi__corner xi__corner--tr" aria-hidden="true" />
            <i className="xi__corner xi__corner--bl" aria-hidden="true" />
            <i className="xi__corner xi__corner--br" aria-hidden="true" />
            <header className="xc__card-head">
              <div>
                <span className="xc__caption mono">{caption}</span>
                <h2 className="xc__card-title">{def.title}</h2>
              </div>
              <DownloadButton data={payload.data} filename={`${slug}-${query.start}-${query.end}`} />
            </header>
            <div className="xc__card-body">
              <span className="xc__watermark" aria-hidden="true">
                FORCEX
              </span>
              <Chart data={payload.data} grain={query.grain} height={420} />
            </div>
            <footer className="xc__card-foot">
              <Provenance p={payload.provenance} />
              <span className="xc__foot-note mono">Half-open range · UTC · {def.kind === "distribution" ? "state snapshot" : "completed buckets"}</span>
            </footer>
          </article>

          {related.length > 0 && (
            <div className="xc__related">
              <span className="eyebrow eyebrow--plain">More in {GROUPS[def.group].toLowerCase()}</span>
              <div className="xc__related-grid">
                {related.map((c) => (
                  <Link key={c.slug} href={`/xamine/charts/${c.slug}`} className="xc__related-card">
                    <h3>{c.title}</h3>
                    <p>{c.summary}</p>
                    <span className="link-arrow mono">
                      Open <ArrowUpRight size={13} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
