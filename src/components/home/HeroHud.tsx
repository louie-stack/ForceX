"use client";

import Link from "next/link";
import type { NetworkSummary } from "@/lib/api";
import { fmtInt, fmtSignedPct, pctTone } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { Counter } from "@/components/Counter";
import { LtcMark } from "@/components/Icons";
import { useLiveSummary } from "./useLiveSummary";

export function HeroHud({ initial }: { initial: NetworkSummary }) {
  const d = useLiveSummary(initial);
  const q = d.quality;
  const ok = q?.state === "validated";
  return (
    <div className="hud" aria-live="polite">
      <div className="hud__head">
        <b>
          <LtcMark size={16} /> Litecoin · live
        </b>
        <span>
          <span className="pulse" style={{ marginRight: 8, verticalAlign: "middle" }} />
          {d.asOf.height ? <TimeAgo iso={d.asOf.time} /> : "connecting"}
        </span>
      </div>
      <div className="hud__grid">
        <div className="tile">
          <span className="tile__label">Latest block</span>
          <span className="tile__value">{d.asOf.height == null ? <span className="skel" /> : <Counter value={d.asOf.height} />}</span>
          <span className="tile__meta">validated at tip</span>
        </div>
        <div className="tile">
          <span className="tile__label">Transactions, 24h</span>
          <span className="tile__value">{d.tx.count == null ? <span className="skel" /> : <Counter value={d.tx.count} />}</span>
          <span className={`tile__meta ${pctTone(d.tx.changePct) === "good" ? "tone-good" : pctTone(d.tx.changePct) === "bad" ? "tone-bad" : ""}`}>{fmtSignedPct(d.tx.changePct)}</span>
        </div>
        <div className="tile">
          <span className="tile__label">Active addresses</span>
          <span className="tile__value">{d.addresses.active == null ? <span className="skel" /> : <Counter value={d.addresses.active} />}</span>
          <span className={`tile__meta ${pctTone(d.addresses.changePct) === "good" ? "tone-good" : pctTone(d.addresses.changePct) === "bad" ? "tone-bad" : ""}`}>{fmtSignedPct(d.addresses.changePct)}</span>
        </div>
      </div>
      <div className="hud__foot">
        <span>
          {q ? (
            ok ? (
              <>
                {q.controls.passing}/{q.controls.total} controls passing
                <span className="hide-sm"> · validated through {fmtInt(q.tip_height)}</span>
              </>
            ) : (
              `Validation ${q.state}`
            )
          ) : (
            "Checking validation status"
          )}
        </span>
        <Link href="/data-quality" className="link-arrow" style={{ fontSize: 13 }}>
          Details
        </Link>
      </div>
    </div>
  );
}
