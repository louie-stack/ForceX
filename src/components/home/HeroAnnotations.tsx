"use client";

import Link from "next/link";
import type { NetworkSummary } from "@/lib/api";
import { fmtInt, fmtSignedPct } from "@/lib/format";
import { Counter } from "@/components/Counter";
import { useLiveSummary } from "./useLiveSummary";

/** Four live readouts pinned around the block, each with a leader toward it. */
export function HeroAnnotations({ initial }: { initial: NetworkSummary }) {
  const d = useLiveSummary(initial);
  const q = d.quality;
  const ok = q?.state === "validated";
  const items = [
    {
      key: "block",
      pos: "tl",
      label: "Latest block",
      value: <Counter value={d.asOf.height} />,
      meta: ok ? "validated at tip" : "awaiting validation",
      href: "/xplorer/litecoin",
      delay: 900,
    },
    {
      key: "controls",
      pos: "tr",
      label: "Live controls",
      value: q ? `${q.controls.passing} / ${q.controls.total}` : "—",
      meta: ok ? "all passing" : q?.state ?? "pending",
      href: "/data-quality",
      delay: 1050,
    },
    {
      key: "tx",
      pos: "bl",
      label: "Transactions, 24h",
      value: <Counter value={d.tx.count} />,
      meta: fmtSignedPct(d.tx.changePct),
      href: "/xplorer/litecoin",
      delay: 1200,
    },
    {
      key: "node",
      pos: "br",
      label: "Node cross-check",
      value: q ? q.node_cross_check.status : "—",
      meta: q ? `block ${fmtInt(q.node_cross_check.last_confirmed_block)}` : "",
      href: "/data-quality#reporting",
      delay: 1350,
    },
  ];
  return (
    <>
      {items.map((it) => (
        <Link key={it.key} href={it.href} className={`ann ann--${it.pos}`} data-reveal="fade" style={{ ["--d" as string]: `${it.delay}ms` }}>
          <span className="ann__label">{it.label}</span>
          <span className="ann__value">{it.value}</span>
          <span className={`ann__meta ${it.meta.startsWith("+") ? "tone-good" : it.meta.startsWith("-") ? "tone-bad" : ""}`}>{it.meta}</span>
          <i className="ann__lead" />
        </Link>
      ))}
    </>
  );
}
