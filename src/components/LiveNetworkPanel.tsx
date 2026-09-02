"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NetworkSummary } from "@/lib/api";
import { fmtBytes, fmtInt, fmtLtc, fmtSignedPct, pctTone } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { Counter } from "./Counter";
import { LtcMark, ArrowUpRight } from "./Icons";

const REFRESH_MS = 60_000;

export function LiveNetworkPanel({ initial }: { initial: NetworkSummary }) {
  const [data, setData] = useState<NetworkSummary>(initial);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/public/litecoin/summary", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => alive && j?.data && setData(j.data))
        .catch(() => {});
    const iv = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(iv);
    };
  }, []);

  const q = data.quality;
  const validated = q?.state === "validated";

  return (
    <div className="panel" aria-live="polite">
      <div className="panel__head">
        <div className="panel__id">
          <span className="ltc">
            <LtcMark size={22} />
          </span>
          <span>Litecoin network</span>
        </div>
        <div className="panel__live">
          <span className="pulse" />
          <span>Live</span>
          <span className="hide-sm" style={{ color: "var(--muted)" }}>
            {data.asOf.height ? <>Block {fmtInt(data.asOf.height)} · <TimeAgo iso={data.asOf.time} /></> : "Connecting"}
          </span>
        </div>
      </div>

      <div className="panel__grid">
        <Tile label="Latest block" value={data.asOf.height} meta={<TimeAgo iso={data.asOf.time} />} />
        <Tile label="Transactions, 24h" value={data.tx.count} meta={fmtSignedPct(data.tx.changePct)} tone={pctTone(data.tx.changePct)} />
        <Tile label="Active addresses, 24h" value={data.addresses.active} meta={fmtSignedPct(data.addresses.changePct)} tone={pctTone(data.addresses.changePct)} />
        <Tile label="Avg block size, 24h" value={data.blockSize.bytes} format={fmtBytes} meta={fmtSignedPct(data.blockSize.changePct)} tone={pctTone(data.blockSize.changePct)} />
        <Tile label="Avg fee, 24h" value={data.fees.avgLitoshi} format={(n) => fmtInt(n) + " litoshi"} meta={fmtSignedPct(data.fees.avgChangePct)} tone={pctTone(data.fees.avgChangePct)} />
        <Tile label="MWEB net flow, 24h" value={data.mweb.netLtc} format={(n) => fmtLtc(n)} meta={data.mweb.priorNetLtc == null ? "vs prior n/a" : `vs prior ${fmtLtc(data.mweb.priorNetLtc)}`} />
      </div>

      <div className="panel__quality">
        <div className="panel__quality-row">
          <span className="eyebrow eyebrow--plain">Data quality</span>
          <div className="panel__chips">
            {["Monetary", "Address", "Block & write"].map((d) => (
              <span key={d} className={`chip ${q ? (validated ? "" : q.state === "warning" ? "chip--warn" : "chip--pending") : "chip--pending"}`}>
                <span className="chip__dot" />
                {d}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="panel__validated">
            {q ? (validated ? `Validated through block ${fmtInt(q.tip_height)}.` : q.state === "warning" ? "Data quality warning detected." : "Validation status pending.") : "Checking validation status."}
          </div>
          <div className="panel__detail">
            {q
              ? `${fmtInt(q.controls.passing)} / ${fmtInt(q.controls.total)} controls passing: ${fmtInt(q.controls_by_cadence.per_block.total)} run every block, ${fmtInt(q.controls_by_cadence.periodic_external.total)} periodic external node cross-check. Node ${q.node_cross_check.status} at block ${fmtInt(q.node_cross_check.last_confirmed_block)}.`
              : "ForceX validation controls will appear here when the status endpoint is reachable."}
          </div>
        </div>
        <Link href="/data-quality" className="link-arrow" style={{ fontSize: 14, justifySelf: "start" }}>
          How every block is verified <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  meta,
  tone,
  format,
}: {
  label: string;
  value: number | null;
  meta: React.ReactNode;
  tone?: "good" | "bad" | "";
  format?: (n: number) => string;
}) {
  return (
    <div className="tile">
      <span className="tile__label">{label}</span>
      <span className="tile__value">{value == null ? <span className="skel" /> : <Counter value={value} format={format} />}</span>
      <span className={`tile__meta ${tone === "good" ? "tone-good" : tone === "bad" ? "tone-bad" : ""}`}>{value == null ? "Loading" : meta}</span>
    </div>
  );
}
