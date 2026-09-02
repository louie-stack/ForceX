"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, reduceMotion } from "@/lib/gsap";
import { ArrowUpRight, Check } from "@/components/Icons";
import { Split } from "@/components/fx/Split";

const CHART = "M0,150 C40,140 60,110 90,118 S140,100 170,96 S220,60 250,70 S300,40 330,52 S380,30 420,26";

const ITEMS = [
  {
    href: "/xplorer/litecoin",
    eyebrow: "01 · Explorer",
    name: "Xplorer",
    tint: "var(--xplorer)",
    desc: "Inspect blocks, transactions, addresses, network activity, supply values, MWEB data, and chain details with clarity and confidence. Every page carries its own validation status.",
    meta: ["Blocks and mempool", "Address history", "MWEB visibility", "Validation panel"],
    cta: "Explore on-chain data",
  },
  {
    href: "/xamine",
    eyebrow: "02 · Analytics",
    name: "Xamine",
    tint: "var(--xamine)",
    desc: "Analyze trends, relationships, supply, network behavior, and address activity with governed, trusted data. Provisional windows are labelled, never silently mixed with completed history.",
    meta: ["Economic throughput", "Address LinX", "Supply methodology", "Watchlists"],
    cta: "Dive into analytics",
  },
  {
    href: "/xtract",
    eyebrow: "03 · Data services",
    name: "Xtract",
    tint: "var(--xtract)",
    desc: "Reliable, programmatic access to trusted on-chain data for builders, analysts, wallets, and institutions. REST and MCP share one credit model and carry validation metadata on every response.",
    meta: ["REST API", "MCP server", "Validation metadata", "Predictable pricing"],
    cta: "Build with ForceX",
  },
];

export function SurfacesStack() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || reduceMotion() || window.innerWidth < 960) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".stack__card"));
    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          filter: "blur(2px)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1].parentElement,
            start: "top bottom",
            end: "top top+=84",
            scrub: true,
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow" data-reveal="fade">
              Platform surfaces
            </span>
            <Split as="h2" type="lines" className="h2" style={{ margin: "18px 0 0" }}>
              Three products. One quality-first foundation.
            </Split>
          </div>
          <Link href="/signup" className="btn btn--ghost" data-reveal>
            Get access to all three
            <span className="btn__ico">
              <ArrowUpRight />
            </span>
          </Link>
        </div>

        <div className="stack" ref={root}>
          {ITEMS.map((it, i) => (
            <div key={it.name} className="stack__item">
              <article className="stack__card" data-spot="tint" style={{ ["--tint" as string]: it.tint }}>
                <div className="stack__copy">
                  <div>
                    <span className="eyebrow eyebrow--plain">{it.eyebrow}</span>
                    <h3 className="stack__name" style={{ marginTop: 16 }}>
                      <span className="x">X</span>
                      {it.name.slice(1)}
                    </h3>
                  </div>
                  <div style={{ display: "grid", gap: 22 }}>
                    <p className="stack__desc">{it.desc}</p>
                    <div className="stack__meta">
                      {it.meta.map((m) => (
                        <span key={m} className="chip">
                          {m}
                        </span>
                      ))}
                    </div>
                    <Link href={it.href} className="btn btn--ghost" style={{ justifySelf: "start", borderColor: `color-mix(in srgb, ${it.tint} 50%, var(--line))` }} data-cursor="Open">
                      {it.cta}
                      <span className="btn__ico">
                        <ArrowUpRight />
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="stack__art">
                  {i === 0 && (
                    <div className="art-rows">
                      {[
                        ["3,170,723", "854a9df1b80613e4ba1be4dfb2402d7bcb77b77", "289 tx"],
                        ["3,170,722", "9c1e27f0b2a4c4d1e9f31a7b5c0d8e6f2a4b1c3d", "312 tx"],
                        ["3,170,721", "7f2c8a1b4e5d6c3a9b0f1e2d3c4b5a6f7e8d9c0b", "276 tx"],
                        ["3,170,720", "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", "301 tx"],
                        ["3,170,719", "c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3", "294 tx"],
                        ["3,170,718", "e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5", "288 tx"],
                      ].map(([h, hash, tx]) => (
                        <div key={h} className="art-row">
                          <b>{h}</b>
                          <span className="hash">{hash}</span>
                          <span className="ok">
                            <Check size={12} /> {tx}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {i === 1 && (
                    <div className="art-chart">
                      <svg viewBox="0 0 420 180" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="xamine-fill-2" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--xamine)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="var(--xamine)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <g className="grid">
                          {[30, 70, 110, 150].map((y) => (
                            <line key={y} x1="0" x2="420" y1={y} y2={y} />
                          ))}
                        </g>
                        <path d={`${CHART} L420,180 L0,180 Z`} fill="url(#xamine-fill-2)" />
                        <path className="line" d={CHART} />
                      </svg>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="art-code">
                      {"$ curl https://forcex.com/xtract/v1/litecoin/chain/home \\\n    -H \"Authorization: Bearer fx_live_…\"\n\n{\n  \"data\": {\n    \"chain\": \"litecoin\",\n    \"tip_height\": 3170723\n  },\n  \"meta\": {\n    \"validation\": {\n      \"status\": \"validated\",\n      \"validated_height\": 3170723,\n      \"lag_blocks\": 0\n    },\n    \"credit_cost\": 1\n  }\n}"}
                      <span className="cursor" />
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
