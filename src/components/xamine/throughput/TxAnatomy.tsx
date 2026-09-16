"use client";

import { useEffect, useRef, useState } from "react";
import { reduceMotion } from "@/lib/gsap";

/**
 * The methodology, run on one illustrative transaction. Four steps cycle:
 * outputs are classified, the self-transfer is excluded, the payment
 * outputs are summed, and the result is anchored to the validated height.
 * The step list on the left and the card on the right share one clock.
 */
const STEPS = [
  { title: "Classify every output", body: "Outputs are scored as payment or change from script type, ordering and value, against a confidence model." },
  { title: "Exclude self-transfers", body: "Where inputs and outputs resolve to the same address cluster, nothing changed hands, so nothing is counted." },
  { title: "Sum payment outputs", body: "The adjusted series is the sum of payment outputs per bucket. Gross stays the unfiltered output total." },
  { title: "Anchor to a validated height", body: "Each series carries the validated height it was computed from, so every number traces back to a checked block." },
];

const GROSS = 57.9998;
const PAY = 12.4;

export function TxAnatomy({ height }: { height: number | null }) {
  const host = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    // Reduced motion: no clock; the steps stay clickable.
    if (reduceMotion() || manual) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.25 });
    if (host.current) io.observe(host.current);
    const id = window.setInterval(() => {
      if (visible && !document.hidden) setStep((s) => (s + 1) % 4);
    }, 2800);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [manual]);

  const s = step;
  const adjusted = s >= 2;

  return (
    <div className="et-anat" ref={host}>
      <ol className="et-steps">
        {STEPS.map((it, i) => (
          <li key={it.title}>
            <button
              type="button"
              className={`et-step ${i === s ? "is-active" : ""} ${i < s ? "is-done" : ""}`}
              aria-pressed={i === s}
              onClick={() => {
                setManual(true);
                setStep(i);
              }}
            >
              <span className="et-step__n mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="et-step__copy">
                <b>{it.title}</b>
                <span>{it.body}</span>
              </span>
              <i className="et-step__bar" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>

      <div className={`xi xi--card et-tx is-s${s}`} aria-live="polite">
        <i className="xi__corner xi__corner--tl" aria-hidden="true" />
        <i className="xi__corner xi__corner--tr" aria-hidden="true" />
        <i className="xi__corner xi__corner--bl" aria-hidden="true" />
        <i className="xi__corner xi__corner--br" aria-hidden="true" />
        <header className="et-tx__head mono">
          <span>
            <i className="xi__dot" aria-hidden="true" /> Transaction · illustrative
          </span>
          <span className="et-tx__step">
            Step {String(s + 1).padStart(2, "0")} / 04
          </span>
        </header>

        <div className="et-tx__body">
          <div className="et-tx__col">
            <span className="et-tx__label mono">Inputs · sender cluster A</span>
            <div className="et-row et-row--in">
              <span className="mono">ltc1q8m…u4fa</span>
              <b className="mono">30.0000</b>
            </div>
            <div className="et-row et-row--in">
              <span className="mono">ltc1q8m…9d2c</span>
              <b className="mono">28.0000</b>
            </div>
          </div>

          <div className="et-tx__flow" aria-hidden="true">
            <svg viewBox="0 0 40 120" preserveAspectRatio="none">
              <path d="M0 30 C 20 30, 20 60, 40 60 M0 90 C 20 90, 20 60, 40 60" />
            </svg>
          </div>

          <div className="et-tx__col">
            <span className="et-tx__label mono">Outputs</span>
            <div className="et-row et-row--pay">
              <span className="mono">ltc1qxy…k29w</span>
              <b className="mono">12.4000</b>
              <em className="et-tag et-tag--pay mono">Payment</em>
            </div>
            <div className="et-row et-row--change">
              <span className="mono">ltc1q8m…u4fa</span>
              <b className="mono">37.5998</b>
              <em className="et-tag et-tag--cut mono">Change</em>
            </div>
            <div className="et-row et-row--self">
              <span className="mono">ltc1q8m…71ee</span>
              <b className="mono">8.0000</b>
              <em className="et-tag et-tag--cut mono">Self-transfer</em>
            </div>
          </div>
        </div>

        <footer className="et-tx__tally">
          <div className="et-bar">
            <span className="et-bar__label mono">Gross output</span>
            <span className="et-bar__track">
              <i style={{ width: "100%" }} />
            </span>
            <b className="mono">{GROSS.toFixed(4)} LTC</b>
          </div>
          <div className={`et-bar et-bar--pay ${adjusted ? "is-on" : ""}`}>
            <span className="et-bar__label mono">Adjusted payment</span>
            <span className="et-bar__track">
              <i style={{ width: adjusted ? `${(PAY / GROSS) * 100}%` : "100%" }} />
            </span>
            <b className="mono">{adjusted ? `${PAY.toFixed(4)} LTC` : "…"}</b>
          </div>
          <div className={`et-anchor mono ${s === 3 ? "is-on" : ""}`}>
            <i aria-hidden="true" />
            Anchored to validated height {height != null ? `#${height.toLocaleString("en-US")}` : ""}
          </div>
        </footer>
      </div>
    </div>
  );
}
