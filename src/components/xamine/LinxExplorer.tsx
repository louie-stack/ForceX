"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/Icons";
import type { Counterparty } from "@/lib/xamine/linx";

/**
 * Address LinX, the working surface: the relationship graph and the ledger
 * share one selection, so hovering a node lights its row and the reverse.
 * The selected address sits at the hub; counterparties ring it, sized by
 * value, with flow animating along each edge in the direction coins moved.
 */
const W = 560;
const H = 520;
const CX = W / 2;
const CY = H / 2;

const ltc = (v: number) =>
  (Math.abs(v) / 1e8).toLocaleString("en-US", {
    maximumFractionDigits: Math.abs(v) / 1e8 < 1 ? 4 : 2,
  });
const short = (a: string, head = 7, tail = 5) =>
  `${a.slice(0, head)}…${a.slice(-tail)}`;
const DIR = { in: "Received", out: "Sent", both: "Both" } as const;

export function LinxExplorer({
  address,
  counterparties,
  explorerOrigin,
  head,
  aside,
  foot,
  ledgerCaption,
}: {
  address: string;
  counterparties: Counterparty[];
  explorerOrigin: string;
  head: ReactNode;
  aside: ReactNode;
  foot: ReactNode;
  ledgerCaption: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(
    counterparties[0]?.address ?? null,
  );
  const active = hover ?? pinned;
  const n = counterparties.length;
  const maxV = Math.max(
    1,
    ...counterparties.map((c) => Math.abs(c.valueAtomic)),
  );

  const nodes = useMemo(
    () =>
      counterparties.map((c, i) => {
        const a =
          -Math.PI / 2 +
          (i / Math.max(1, n)) * Math.PI * 2 +
          (n % 2 ? 0 : Math.PI / n / 2);
        const ring = i % 2 === 0 ? 176 : 214;
        const x = CX + Math.cos(a) * ring;
        const y = CY + Math.sin(a) * ring;
        const r = 7 + Math.sqrt(Math.abs(c.valueAtomic) / maxV) * 17;
        // Bow each edge a little to one side so the web reads as flow, not spokes.
        const mx = (CX + x) / 2 + Math.cos(a + Math.PI / 2) * 18;
        const my = (CY + y) / 2 + Math.sin(a + Math.PI / 2) * 18;
        const path =
          c.direction === "in"
            ? `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${CX},${CY}`
            : `M${CX},${CY} Q${mx.toFixed(1)},${my.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
        const labelBelow = y >= CY;
        return {
          c,
          x,
          y,
          r,
          path,
          labelBelow,
          anchor: (Math.abs(x - CX) < 40
            ? "middle"
            : x > CX
              ? "start"
              : "end") as "middle" | "start" | "end",
        };
      }),
    [counterparties, n, maxV],
  );

  const sel = counterparties.find((c) => c.address === active) ?? null;
  const explorer = (a: string) =>
    `${explorerOrigin}/xplorer/litecoin/address/${a}`;

  const corners = (
    <>
      <i className="xi__corner xi__corner--tl" aria-hidden="true" />
      <i className="xi__corner xi__corner--tr" aria-hidden="true" />
      <i className="xi__corner xi__corner--bl" aria-hidden="true" />
      <i className="xi__corner xi__corner--br" aria-hidden="true" />
    </>
  );

  return (
    <>
      <article className="xi xi--card xc__card lx">
        {corners}
        {head}
        <div className="lx__main">
          <div className="lx__graph-wrap">
            <span className="xc__watermark" aria-hidden="true">
              FORCEX
            </span>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className={`lx__graph ${active ? "has-active" : ""}`}
              role="img"
              aria-label={`Relationship graph for ${address} with ${n} counterparties`}
            >
              <defs>
                <radialGradient id="lx-hub" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor="var(--tint)"
                    stopOpacity="0.55"
                  />
                  <stop offset="100%" stopColor="var(--tint)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx={CX} cy={CY} r={176} className="lx__ring" />
              <circle
                cx={CX}
                cy={CY}
                r={214}
                className="lx__ring lx__ring--outer"
              />
              <circle
                cx={CX}
                cy={CY}
                r={120}
                className="lx__ring lx__ring--inner"
              />

              {nodes.map(({ c, path }) => (
                <g
                  key={"e" + c.address}
                  className={`lx__edge lx__edge--${c.direction} ${active === c.address ? "is-active" : ""}`}
                >
                  <path
                    d={path}
                    className="lx__edge-base"
                    style={{ strokeWidth: 1 + Math.min(3, c.txs / 4) }}
                  />
                  <path d={path} className="lx__edge-flow" />
                </g>
              ))}

              <circle
                cx={CX}
                cy={CY}
                r={70}
                fill="url(#lx-hub)"
                className="lx__hub-glow"
              />
              <circle cx={CX} cy={CY} r={26} className="lx__hub-ring" />
              <circle cx={CX} cy={CY} r={13} className="lx__hub" />
              <text
                x={CX}
                y={CY + 48}
                className="lx__label lx__label--hub"
                textAnchor="middle"
              >
                {short(address, 9, 6)}
              </text>

              {nodes.map(({ c, x, y, r, labelBelow, anchor }) => {
                const on = active === c.address;
                const lx =
                  anchor === "middle"
                    ? x
                    : anchor === "start"
                      ? x + r + 8
                      : x - r - 8;
                const ly =
                  anchor === "middle"
                    ? labelBelow
                      ? y + r + 16
                      : y - r - 18
                    : y - 2;
                return (
                  <g
                    key={c.address}
                    className={`lx__node lx__node--${c.direction} ${on ? "is-active" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${DIR[c.direction]} ${ltc(c.valueAtomic)} LTC, ${c.txs} transactions, ${c.address}`}
                    onPointerEnter={() => setHover(c.address)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(c.address)}
                    onBlur={() => setHover(null)}
                    onClick={() => setPinned(c.address)}
                  >
                    <circle cx={x} cy={y} r={r + 9} className="lx__node-halo" />
                    <circle cx={x} cy={y} r={r} className="lx__node-core" />
                    <text
                      x={lx}
                      y={ly}
                      className="lx__label"
                      textAnchor={anchor}
                    >
                      {short(c.address)}
                    </text>
                    <text
                      x={lx}
                      y={ly + 14}
                      className="lx__label lx__label--v"
                      textAnchor={anchor}
                    >
                      {c.valueAtomic >= 0 ? "+" : "−"}
                      {ltc(c.valueAtomic)}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="lx__legend mono" aria-hidden="true">
              <span>
                <i className="lx__sw lx__sw--in" /> Received from
              </span>
              <span>
                <i className="lx__sw lx__sw--out" /> Sent to
              </span>
              <span>
                <i className="lx__sw lx__sw--both" /> Both directions
              </span>
            </div>

            {sel && (
              <div
                className={`lx__focus lx__focus--${sel.direction}`}
                aria-live="polite"
              >
                <span className="lx__focus-k mono">
                  <i /> {DIR[sel.direction]} · {sel.txs}{" "}
                  {sel.txs === 1 ? "tx" : "txs"}
                </span>
                <b className={sel.valueAtomic >= 0 ? "good" : "bad"}>
                  {sel.valueAtomic >= 0 ? "+" : "−"}
                  {ltc(sel.valueAtomic)} <small>LTC</small>
                </b>
                <a
                  href={explorer(sel.address)}
                  className="lx__focus-addr mono"
                  title={sel.address}
                >
                  {short(sel.address, 12, 8)} <ArrowUpRight size={12} />
                </a>
              </div>
            )}
          </div>

          {aside}
        </div>
        {foot}
      </article>

      <article className="xi xi--card xc__card lx lx--ledger">
        <header className="xc__card-head">
          <div>
            <span className="xc__caption mono">{ledgerCaption}</span>
            <h2 className="xc__card-title">Relationship Ledger</h2>
          </div>
        </header>
        <div
          className="lx__ledger"
          role="table"
          aria-label="Relationship ledger"
        >
          <div className="lx__lrow lx__lrow--head mono" role="row">
            <span role="columnheader">Counterparty</span>
            <span role="columnheader">Direction</span>
            <span role="columnheader" className="is-num">
              Value · LTC
            </span>
            <span role="columnheader" className="is-num">
              Txs
            </span>
            <span role="columnheader">Height range</span>
          </div>
          {counterparties.length ? (
            counterparties.map((c) => (
              <div
                key={c.address}
                role="row"
                className={`lx__lrow ${active === c.address ? "is-active" : ""}`}
                onPointerEnter={() => setHover(c.address)}
                onPointerLeave={() => setHover(null)}
                onClick={() => setPinned(c.address)}
              >
                <span role="cell" className="lx__cp">
                  <i
                    className={`lx__dot lx__dot--${c.direction}`}
                    aria-hidden="true"
                  />
                  <a
                    href={explorer(c.address)}
                    className="mono"
                    title={c.address}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {short(c.address, 10, 6)}
                  </a>
                </span>
                <span role="cell">
                  <span className={`xl__dir mono xl__dir--${c.direction}`}>
                    {DIR[c.direction]}
                  </span>
                </span>
                <span
                  role="cell"
                  className={`is-num mono lx__val ${c.valueAtomic >= 0 ? "good" : "bad"}`}
                >
                  <span
                    className="lx__share"
                    style={{
                      ["--s" as string]: Math.abs(c.valueAtomic) / maxV,
                    }}
                    aria-hidden="true"
                  />
                  {c.valueAtomic >= 0 ? "+" : "−"}
                  {ltc(c.valueAtomic)}
                </span>
                <span role="cell" className="is-num mono lx__txs">
                  {c.txs}
                  <em> txs</em>
                </span>
                <span role="cell" className="mono lx__range">
                  {c.heightFrom.toLocaleString("en-US")} –{" "}
                  {c.heightTo.toLocaleString("en-US")}
                </span>
              </div>
            ))
          ) : (
            <p className="lx__empty">No relationships in this window.</p>
          )}
        </div>
      </article>
    </>
  );
}
