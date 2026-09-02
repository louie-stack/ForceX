"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Check, Database, Layers, Nodes, Search, Shield } from "./Icons";

const GATES = [
  { label: "Parse", x: 6, Icon: Search },
  { label: "Store", x: 23, Icon: Database },
  { label: "Reconcile", x: 41, Icon: Layers },
  { label: "Validate", x: 59, Icon: Shield },
  { label: "Cross-check", x: 77, Icon: Nodes },
  { label: "Verify", x: 94, Icon: Check, final: true },
];

/**
 * The signature animation: blocks enter on the left as raw data and pass
 * through each control gate, lighting it as they go, before leaving as
 * verified. Pure GSAP on DOM nodes so it stays cheap.
 */
export function VerificationStream({ height }: { height?: number | null }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = stage.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.querySelectorAll(".gate").forEach((g) => g.classList.add("is-hot"));
      return;
    }
    const gates = Array.from(root.querySelectorAll<HTMLElement>(".gate"));
    let alive = true;
    const blocks: HTMLElement[] = [];

    const spawn = () => {
      if (!alive) return;
      const el = document.createElement("span");
      el.className = "block";
      root.appendChild(el);
      blocks.push(el);
      const w = root.clientWidth;
      const tl = gsap.timeline({
        onComplete: () => {
          el.remove();
          blocks.splice(blocks.indexOf(el), 1);
        },
      });
      tl.set(el, { x: -30, opacity: 0, backgroundColor: "var(--muted-2)", scale: 0.9 });
      tl.to(el, { opacity: 1, duration: 0.3 });
      let prevX = -30;
      GATES.forEach((g, i) => {
        const gx = (g.x / 100) * w - 9;
        const dist = Math.abs(gx - prevX);
        tl.to(el, { x: gx, duration: dist / 260, ease: "none" });
        tl.add(() => {
          gates[i]?.classList.add("is-hot");
          window.setTimeout(() => gates[i]?.classList.remove("is-hot"), 380);
        });
        const color = g.final ? "var(--good)" : i >= 2 ? "var(--accent)" : "var(--text-2)";
        tl.to(el, { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, "<");
        tl.to(el, { backgroundColor: color, duration: 0.2 }, "<");
        prevX = gx;
      });
      tl.to(el, { x: w + 30, opacity: 0, duration: 0.7, ease: "power1.in" });
    };

    spawn();
    const iv = window.setInterval(spawn, 1700);
    return () => {
      alive = false;
      window.clearInterval(iv);
      blocks.forEach((b) => {
        gsap.killTweensOf(b);
        b.remove();
      });
    };
  }, []);

  return (
    <section className="stream" aria-label="How ForceX verifies each block">
      <div className="container">
        <div className="stream__head">
          <div>
            <span className="eyebrow">Every block, every time</span>
            <h2 className="h3" style={{ margin: "14px 0 0" }}>
              Six gates between the chain and your screen.
            </h2>
          </div>
          <p className="small mono" style={{ margin: 0 }}>
            {height ? `Currently validating block ${height.toLocaleString("en-US")}` : "Live validation at tip"}
          </p>
        </div>

        <div className="stream__stage" ref={stage}>
          <div className="stream__track" />
          {GATES.map((g, i) => (
            <div key={g.label} className={`gate ${g.final ? "gate--final" : ""}`} style={{ left: `${g.x}%` }}>
              <span className="gate__idx">0{i + 1}</span>
              <span className="gate__node">
                <g.Icon size={18} />
              </span>
              <span className="gate__label">{g.label}</span>
            </div>
          ))}
        </div>

        <div className="stream__legend">
          <span>
            <i style={{ background: "var(--muted-2)" }} />
            Raw block
          </span>
          <span>
            <i style={{ background: "var(--accent)" }} />
            Under control
          </span>
          <span>
            <i style={{ background: "var(--good)" }} />
            Verified, worthy of display
          </span>
        </div>
      </div>
    </section>
  );
}
