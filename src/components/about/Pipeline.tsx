"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Traditional vs ForceX, as a live pipeline.
 *
 * The same stream of data enters both lanes at the same moment. In the
 * traditional lane it runs Parse, Store, Display and every packet is
 * shown, defects included. In the ForceX lane it runs the full chain of
 * controls; a defective packet is stopped at the control that catches
 * it and drops out, and only packets that clear Verify reach Display.
 * The ledger on the right keeps count. Nodes and labels are HTML so they
 * follow the theme; the lines, packets and pulses are drawn on a canvas.
 */

export const STAGES = [
  { id: "parse", label: "Parse", sub: "raw blocks" },
  { id: "store", label: "Store", sub: "indexed" },
  { id: "reconcile", label: "Reconcile", sub: "consistency" },
  { id: "validate", label: "Validate", sub: "rule checks" },
  { id: "crosscheck", label: "Cross-check", sub: "node reference" },
  { id: "verify", label: "Verify", sub: "worthy of display" },
  { id: "display", label: "Display", sub: "what users see" },
] as const;

const TRADITIONAL_STAGES = new Set(["parse", "store", "display"]);
const CATCHERS = [2, 3, 4] as const;
const DEFECTS: Record<number, string[]> = {
  2: ["unreconciled UTXO", "stale derived table", "orphaned output"],
  3: ["null output", "supply rule failed", "duplicate tx"],
  4: ["node mismatch", "reorg drift", "late correction"],
};

const X0 = 0.075;
const X1 = 0.925;
const LANE_Y = [0.3, 0.72];
const SPEED = 0.105; // lane fractions per second
const SPAWN_MS = 1500;
const SPAWN_JITTER = 360;
const DEFECT_RATE = 0.3;
const HOLD_MS = 520;

type Packet = {
  id: number;
  x: number;
  born: number;
  defect: boolean;
  catchAt: number; // stage index in the ForceX lane, -1 if clean
  held: number; // when the hold began, 0 if not holding
  dead: number; // when the drop began, 0 if alive
  verified: boolean;
  counted: boolean;
};

type Ledger = {
  tDisplayed: number;
  tDefects: number;
  fDisplayed: number;
  fCaught: number;
  log: { id: number; stage: string; what: string }[];
};

const stageX = (i: number) => X0 + ((X1 - X0) * i) / (STAGES.length - 1);

export function Pipeline() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nodeEls = useRef<(HTMLDivElement | null)[]>([]);
  const [ledger, setLedger] = useState<Ledger>({ tDisplayed: 0, tDefects: 0, fDisplayed: 0, fCaught: 0, log: [] });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = host.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);

    let w = 1;
    let h = 1;
    let dpr = 1;
    let colors = { line: "#333", line2: "#444", tint: "#3b82f6", good: "#4ade80", bad: "#f87171", muted: "#888", card: "#fff" };

    const readColors = () => {
      const cs = getComputedStyle(el);
      const v = (n: string) => cs.getPropertyValue(n).trim();
      colors = { line: v("--line-2"), line2: v("--line-strong"), tint: v("--tint") || v("--accent"), good: v("--good"), bad: v("--bad"), muted: v("--muted"), card: v("--abt-card") };
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth || 1;
      h = el.clientHeight || 1;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    // State. Both lanes receive the same packet stream.
    const lanes: Packet[][] = [[], []];
    const hits: number[][] = [Array(STAGES.length).fill(0), Array(STAGES.length).fill(0)];
    const hitTone: string[][] = [Array(STAGES.length).fill(""), Array(STAGES.length).fill("")];
    const tally: Ledger = { tDisplayed: 0, tDefects: 0, fDisplayed: 0, fCaught: 0, log: [] };
    let seq = 1000;
    let lastSpawn = 0;
    let nextGap = SPAWN_MS;
    let lastPublish = 0;
    let dirty = false;
    let raf = 0;
    let prev = performance.now();

    const spawn = (now: number) => {
      const defect = Math.random() < DEFECT_RATE;
      const catchAt = defect ? CATCHERS[Math.floor(Math.random() * CATCHERS.length)] : -1;
      seq += 1;
      const base = { id: seq, x: 0, born: now, defect, catchAt, held: 0, dead: 0, verified: false, counted: false };
      lanes[0].push({ ...base });
      lanes[1].push({ ...base });
    };

    const pulse = (lane: number, stage: number, now: number, tone: string) => {
      hits[lane][stage] = now;
      hitTone[lane][stage] = tone;
      const n = nodeEls.current[lane * STAGES.length + stage];
      if (n) {
        n.dataset.hit = tone;
        window.setTimeout(() => {
          if (n.dataset.hit === tone) delete n.dataset.hit;
        }, 700);
      }
    };

    const step = (now: number, dt: number) => {
      if (now - lastSpawn > nextGap) {
        spawn(now);
        lastSpawn = now;
        nextGap = SPAWN_MS + (Math.random() - 0.5) * 2 * SPAWN_JITTER;
      }
      for (let lane = 0; lane < 2; lane++) {
        const list = lanes[lane];
        for (const p of list) {
          if (p.dead) continue;
          if (p.held) {
            if (now - p.held > HOLD_MS) {
              p.dead = now;
            }
            continue;
          }
          const before = p.x;
          p.x += SPEED * dt;
          // Stage crossings.
          for (let s = 0; s < STAGES.length; s++) {
            const sx = stageX(s);
            if (before < sx && p.x >= sx) {
              const isTrad = lane === 0;
              if (isTrad && !TRADITIONAL_STAGES.has(STAGES[s].id)) continue;
              if (!isTrad && p.defect && s === p.catchAt) {
                p.x = sx;
                p.held = now;
                pulse(lane, s, now, "bad");
                tally.fCaught += 1;
                const what = DEFECTS[s][Math.floor(Math.random() * DEFECTS[s].length)];
                tally.log = [{ id: p.id, stage: STAGES[s].label, what }, ...tally.log].slice(0, 4);
                dirty = true;
                break;
              }
              if (!isTrad && s === 5) {
                p.verified = true;
                pulse(lane, s, now, "good");
                break;
              }
              if (s === 6) {
                if (isTrad) {
                  tally.tDisplayed += 1;
                  if (p.defect) tally.tDefects += 1;
                  pulse(lane, s, now, "");
                } else {
                  tally.fDisplayed += 1;
                  pulse(lane, s, now, "good");
                }
                p.counted = true;
                dirty = true;
                break;
              }
              pulse(lane, s, now, isTrad ? "" : "tint");
            }
          }
        }
        // Retire packets that have left the lane or finished dropping.
        lanes[lane] = list.filter((p) => (p.dead ? now - p.dead < 700 : p.x < X1 + 0.05));
      }
      if (dirty && now - lastPublish > 240) {
        setLedger({ ...tally, log: [...tally.log] });
        lastPublish = now;
        dirty = false;
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      // Column guides, one per stage, so the two lanes read on one grid.
      ctx.strokeStyle = colors.line;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let s = 0; s < STAGES.length; s++) {
        const x = Math.round(stageX(s) * w) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 18);
        ctx.lineTo(x, h - 18);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (let lane = 0; lane < 2; lane++) {
        const y = LANE_Y[lane] * h;
        const isTrad = lane === 0;
        // Lane lines: one hairline each, the traditional lane dotted where
        // the controls are skipped.
        ctx.lineWidth = 1;
        if (isTrad) {
          ctx.strokeStyle = colors.line2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(stageX(0) * w, y);
          ctx.lineTo(stageX(1) * w, y);
          ctx.stroke();
          ctx.setLineDash([2, 6]);
          ctx.beginPath();
          ctx.moveTo(stageX(1) * w, y);
          ctx.lineTo(stageX(6) * w, y);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = colors.tint;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.moveTo(stageX(0) * w, y);
          ctx.lineTo(stageX(6) * w, y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        // Packets. Clean packets are small filled dots; defects are hollow
        // rings. A caught packet holds at the control, then fades in place.
        for (const p of lanes[lane]) {
          const px = p.x * w;
          const py = y;
          let alpha = Math.min(1, (now - p.born) / 400);
          let rr = 4;
          if (p.dead) {
            const t = Math.min(1, (now - p.dead) / 900);
            alpha = 1 - t;
            rr = 4 + t * 4;
          }
          const caught = p.dead || p.held;
          const color = caught ? colors.bad : p.verified ? colors.good : isTrad ? colors.muted : colors.tint;
          ctx.globalAlpha = alpha * (isTrad ? 0.85 : 1);
          ctx.beginPath();
          ctx.arc(px, py, rr, 0, Math.PI * 2);
          if (p.defect && !caught) {
            ctx.fillStyle = colors.card;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            ctx.fillStyle = color;
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }
    };

    if (reduce) {
      // One still frame: a few packets mid-lane, no loop.
      const now = performance.now();
      for (let i = 0; i < 4; i++) {
        const defect = i === 1;
        lanes[0].push({ id: i, x: 0.2 + i * 0.2, born: now - 1000, defect, catchAt: -1, held: 0, dead: 0, verified: false, counted: false });
        lanes[1].push({ id: i, x: 0.2 + i * 0.2, born: now - 1000, defect: false, catchAt: -1, held: 0, dead: 0, verified: i >= 3, counted: false });
      }
      draw(now);
      return () => {
        ro.disconnect();
        mo.disconnect();
        io.disconnect();
      };
    }

    // Warm start so the lanes are not empty on first sight.
    const t0 = performance.now();
    for (let i = 6; i > 0; i--) {
      spawn(t0 - i * SPAWN_MS);
      for (const lane of lanes) {
        const p = lane[lane.length - 1];
        p.x = (i * SPAWN_MS * SPEED) / 1000;
      }
    }
    lastSpawn = t0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (!visible) return;
      step(now, dt);
      draw(now);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  const unverified = ledger.tDisplayed;
  const verifiedPct = ledger.fDisplayed + ledger.fCaught > 0 ? 100 : 0;

  return (
    <div className="abt-pipe">
      <div className="abt-pipe__stage" ref={host}>
        <canvas ref={canvas} className="abt-pipe__canvas" aria-hidden="true" />

        {/* Lane titles. */}
        <span className="abt-pipe__lane abt-pipe__lane--t" style={{ top: `${LANE_Y[0] * 100}%` }}>
          Traditional approach
        </span>
        <span className="abt-pipe__lane abt-pipe__lane--f" style={{ top: `${LANE_Y[1] * 100}%` }}>
          ForceX approach
        </span>

        {/* Nodes. */}
        {[0, 1].map((lane) =>
          STAGES.map((s, i) => {
            const isTrad = lane === 0;
            const ghost = isTrad && !TRADITIONAL_STAGES.has(s.id);
            const cls = ["abt-node", isTrad ? "abt-node--t" : "abt-node--f", ghost ? "abt-node--ghost" : "", s.id === "verify" && !isTrad ? "abt-node--good" : ""].filter(Boolean).join(" ");
            return (
              <div
                key={`${lane}-${s.id}`}
                ref={(n) => {
                  nodeEls.current[lane * STAGES.length + i] = n;
                }}
                className={cls}
                style={{ left: `${stageX(i) * 100}%`, top: `${LANE_Y[lane] * 100}%` }}
              >
                <i aria-hidden="true" />
                {!ghost && (
                  <span className="abt-node__label">
                    <b>{s.label}</b>
                    {!isTrad && <small>{s.sub}</small>}
                    {isTrad && s.id === "display" && <small>unverified</small>}
                  </span>
                )}
              </div>
            );
          }),
        )}

        {/* The skipped controls, named once across the ghost slots. */}
        <span className="abt-pipe__skip" style={{ left: `${stageX(2) * 100}%`, right: `${(1 - stageX(5)) * 100}%`, top: `${LANE_Y[0] * 100}%` }}>
          <em>four controls skipped</em>
        </span>

        {reduced && <span className="abt-pipe__still">Animation paused by your motion settings.</span>}
      </div>

      {/* Ledger. */}
      <aside className="abt-pipe__side" aria-live="off">
        <div className="abt-pipe__block">
          <span className="abt-pipe__k">Traditional</span>
          <dl className="abt-pipe__dl">
            <div>
              <dt>Displayed</dt>
              <dd>{ledger.tDisplayed.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Unverified</dt>
              <dd>{unverified.toLocaleString()}</dd>
            </div>
            <div className="is-warn">
              <dt>Defects shown</dt>
              <dd>{ledger.tDefects.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
        <div className="abt-pipe__block">
          <span className="abt-pipe__k abt-pipe__k--on">ForceX</span>
          <dl className="abt-pipe__dl">
            <div>
              <dt>Displayed</dt>
              <dd>{ledger.fDisplayed.toLocaleString()}</dd>
            </div>
            <div className="is-bad">
              <dt>Caught</dt>
              <dd>{ledger.fCaught.toLocaleString()}</dd>
            </div>
            <div className="is-good">
              <dt>Verified</dt>
              <dd>{verifiedPct}%</dd>
            </div>
          </dl>
        </div>
        <div className="abt-pipe__block abt-pipe__block--log">
          <span className="abt-pipe__k">Recent catches</span>
          <ul className="abt-pipe__log">
            {ledger.log.length === 0 && <li className="is-empty">Listening for defects</li>}
            {ledger.log.map((e) => (
              <li key={e.id}>
                <span>{e.stage}</span>
                <b>{e.what}</b>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
