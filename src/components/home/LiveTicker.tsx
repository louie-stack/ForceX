"use client";

import type { NetworkSummary } from "@/lib/api";
import { fmtBytes, fmtInt, fmtLtc, fmtSignedPct } from "@/lib/format";
import { Marquee } from "@/components/Marquee";
import { useLiveSummary } from "./useLiveSummary";

export function LiveTicker({ initial }: { initial: NetworkSummary }) {
  const d = useLiveSummary(initial);
  const q = d.quality;
  const delta = (v: number | null) => (v == null ? null : <span className={v >= 0 ? "up" : "down"}>{fmtSignedPct(v)}</span>);
  const items = [
    <span key="b" className="tick">
      <i /> Block <b>{fmtInt(d.asOf.height)}</b>
    </span>,
    <span key="t" className="tick">
      <i /> Transactions 24h <b>{fmtInt(d.tx.count)}</b> {delta(d.tx.changePct)}
    </span>,
    <span key="a" className="tick">
      <i /> Active addresses <b>{fmtInt(d.addresses.active)}</b> {delta(d.addresses.changePct)}
    </span>,
    <span key="f" className="tick">
      <i /> Avg fee <b>{fmtInt(d.fees.avgLitoshi)} litoshi</b> {delta(d.fees.avgChangePct)}
    </span>,
    <span key="s" className="tick">
      <i /> Avg block <b>{fmtBytes(d.blockSize.bytes)}</b>
    </span>,
    <span key="m" className="tick">
      <i /> MWEB net flow <b>{fmtLtc(d.mweb.netLtc)}</b>
    </span>,
    <span key="q" className="tick">
      <i /> Controls <b>{q ? `${q.controls.passing}/${q.controls.total} passing` : "…"}</b>
    </span>,
    <span key="n" className="tick">
      <i /> Node cross-check <b>{q ? q.node_cross_check.status : "…"}</b>
    </span>,
  ];
  return <Marquee items={items} duration={48} />;
}
