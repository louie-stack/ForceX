"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";
import { Check } from "@/components/Icons";
import { fmtInt } from "@/lib/format";
import { BlockSpecimen, type SpecimenHandle } from "./BlockSpecimen";

/**
 * Copy is held to the published methodology at forcex.com/data-quality:
 * four layers of integrity control, 190 structural constraints, 13 live
 * per-block rules (LVR-001 to LVR-013) and one periodic node cross-check
 * (LVR-014, default cadence every 1,000 blocks, against gettxoutsetinfo).
 *
 * The right-hand side is the specimen: one block as a physical object in
 * a measurement frame. Its state, the frame readouts and the copy on the
 * left all run off a single 0..6 progress value.
 */
const STAGES = [
  { name: "Parse", body: "Every block is decoded directly from the Litecoin node, MWEB extension data included. Nothing is taken from a third-party feed.", check: "Block decoded from the node", live: "Decoding from node", tint: "var(--muted)" },
  { name: "Store", body: "190 structural constraints are enforced by the schema itself, so an invalid relational state cannot be written in the first place.", check: "Write-path commit confirmed", live: "Writing under 190 constraints", tint: "var(--muted)" },
  { name: "Reconcile", body: "Balances, totals, counts and supply values are reconciled across the address ledger, the transaction links and the unspent output set.", check: "Accounting reconciled", live: "Reconciling three ledgers", tint: "var(--accent)" },
  { name: "Validate", body: "Thirteen live validation rules run against every block at the tip. Their result is recorded with the block height they were run at.", check: "13 per-block rules passing", live: "Running live rules", tint: "var(--accent)" },
  { name: "Cross-check", body: "Every 1,000 blocks the indexed unspent output total is compared with what the Litecoin node itself reports at a checkpoint height.", check: "Node cross-check aligned", live: "Comparing with node", tint: "var(--accent)" },
  { name: "Verify", body: "Only then is the block published as validated, so every page can say exactly what has been checked, and when.", check: "Validated and recorded", live: "Publishing", tint: "var(--good)" },
];
const N = STAGES.length;
const RULES = 13;

export function Pipeline({ height, hash }: { height: number | null; hash?: string | null }) {
  const root = useRef<HTMLElement>(null);
  const specimen = useRef<SpecimenHandle>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".pipe__step"));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>(".pipe__tick"));
    const spec = el.querySelector<HTMLElement>(".spec")!;
    const states = Array.from(el.querySelectorAll<HTMLElement>(".spec__state"));
    const rules = el.querySelector<HTMLElement>(".spec__rules")!;
    const gate = el.querySelector<HTMLElement>(".spec__gate")!;
    const stamp = el.querySelector<HTMLElement>(".spec__stamp")!;

    // Everything on the specimen side derives from one progress value.
    const apply = (p: number) => {
      specimen.current?.set(p);
      const i = Math.min(N - 1, Math.max(0, Math.floor(p)));
      const done = p >= i + 0.5;
      states.forEach((s, k) => {
        s.classList.toggle("is-on", k === i);
        s.classList.toggle("is-done", k === i && done);
      });
      const ruleCount = Math.round(Math.min(1, Math.max(0, (p - 3.25) / 0.7)) * RULES);
      rules.textContent = String(ruleCount).padStart(2, "0");
      gate.textContent = `Gate 0${i + 1} / 06`;
      spec.style.setProperty("--draw", String(Math.min(1, p / 0.9)));
      spec.style.setProperty("--handles", String(Math.min(1, Math.max(0, (p - 0.45) / 0.4))));
      spec.style.setProperty("--tint", STAGES[i].tint);
      spec.classList.toggle("is-verified", p >= 5.5);
    };
    apply(0);

    if (reduceMotion() || window.innerWidth < 900) {
      // No pinning: the specimen runs its six gates once it comes into view.
      steps.forEach((s, i) => gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 }));
      const proxy = { p: 0 };
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          gsap.to(proxy, {
            p: N,
            duration: 9,
            ease: "none",
            onUpdate: () => {
              apply(proxy.p);
              const cur = Math.min(N - 1, Math.floor(proxy.p));
              steps.forEach((s, i) => gsap.set(s, { autoAlpha: i === cur ? 1 : 0 }));
              ticks.forEach((t, i) => {
                t.style.setProperty("--p", String(Math.min(1, Math.max(0, proxy.p - i))));
                t.classList.toggle("is-on", proxy.p >= i);
              });
            },
            onComplete: () => gsap.to(stamp, { opacity: 1, scale: 1, rotate: -4, duration: 0.5, ease: "back.out(2)" }),
          });
        },
        { threshold: 0.35 },
      );
      io.observe(spec);
      return () => io.disconnect();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: `+=${N * 90}%`,
          pin: el.querySelector(".pipe__pin"),
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (st) => apply(st.progress * N),
        },
      });
      gsap.set(steps[0], { autoAlpha: 1 });
      STAGES.forEach((_, i) => {
        const at = i;
        if (i > 0) {
          tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: 0.35, ease: "power2.in" }, at);
          tl.fromTo(steps[i], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, at + 0.3);
        }
        tl.to(ticks[i], { "--p": 1, duration: 0.6, ease: "none", onStart: () => ticks[i].classList.add("is-on"), onReverseComplete: () => ticks[i].classList.remove("is-on") }, at + 0.2);
        if (i === N - 1) {
          tl.to(stamp, { opacity: 1, scale: 1, rotate: -4, duration: 0.4, ease: "back.out(2)" }, at + 0.6);
        }
        tl.to({}, { duration: 0.3 }, at + 0.7);
      });
      ScrollTrigger.refresh();
    }, el);
    return () => ctx.revert();
  }, []);

  const h = height ?? 3170723;

  return (
    <section className="pipe" id="pipeline" ref={root} aria-label="How ForceX verifies a block">
      <div className="pipe__pin">
        <div className="container">
          <div className="pipe__head">
            <div>
              <span className="eyebrow">Every block, every time</span>
              <h2 className="h3">Six gates between the chain and your screen.</h2>
            </div>
            <span className="small mono">{height ? `Currently validating block ${fmtInt(height)}` : "Live validation at tip"}</span>
          </div>
          <div className="pipe__rail">
            {STAGES.map((s) => (
              <div key={s.name} className="pipe__tick">
                <i />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
          <div className="pipe__grid">
            <div className="pipe__stage">
              {STAGES.map((s, i) => (
                <div key={s.name} className="pipe__step">
                  <span className="pipe__idx">Gate 0{i + 1} of 06</span>
                  <h2 className="pipe__name">{s.name}</h2>
                  <p className="pipe__body">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="spec" role="img" aria-label={`Litecoin block ${fmtInt(h)} passing through the six verification gates`}>
              <BlockSpecimen ref={specimen} className="spec__scene" />

              <svg className="spec__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <rect className="spec__box" x="6" y="6" width="88" height="88" vectorEffect="non-scaling-stroke" />
              </svg>
              <svg className="spec__marks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <g className="spec__corners">
                  <path d="M6 12V6h6" />
                  <path d="M88 6h6v6" />
                  <path d="M94 88v6h-6" />
                  <path d="M12 94H6v-6" />
                </g>
                <g className="spec__handles">
                  <line x1="30" y1="6" x2="70" y2="6" />
                  <line x1="30" y1="94" x2="70" y2="94" />
                  <line x1="6" y1="30" x2="6" y2="70" />
                  <line x1="94" y1="30" x2="94" y2="70" />
                  <circle cx="30" cy="6" r="0.9" /><circle cx="70" cy="6" r="0.9" /><circle cx="50" cy="6" r="1.4" />
                  <circle cx="30" cy="94" r="0.9" /><circle cx="70" cy="94" r="0.9" /><circle cx="50" cy="94" r="1.4" />
                  <circle cx="6" cy="30" r="0.9" /><circle cx="6" cy="70" r="0.9" /><circle cx="6" cy="50" r="1.4" />
                  <circle cx="94" cy="30" r="0.9" /><circle cx="94" cy="70" r="0.9" /><circle cx="94" cy="50" r="1.4" />
                </g>
              </svg>

              <div className="spec__hud mono">
                <div className="spec__tl">
                  <span className="spec__k">Litecoin block</span>
                  <b>{fmtInt(h)}</b>
                </div>
                <div className="spec__tr">
                  <span className="spec__k">State</span>
                  <span className="spec__states">
                    {STAGES.map((s) => (
                      <span key={s.name} className="spec__state">
                        <i />
                        <span className="spec__live">{s.live}</span>
                        <span className="spec__done">{s.check}</span>
                      </span>
                    ))}
                  </span>
                </div>
                <div className="spec__bl">
                  <span className="spec__k">Rules</span>
                  <b>
                    <span className="spec__rules">00</span> / {RULES}
                  </b>
                  <span className="spec__extra">
                    <span className="spec__k spec__k--gap">Constraints</span>
                    <b>190</b>
                  </span>
                </div>
                <div className="spec__br">
                  <span className="spec__stamp">
                    <Check size={12} /> Verified before display
                  </span>
                  <span className="spec__gate">Gate 01 / 06</span>
                </div>
                {hash ? <div className="spec__hash">{hash}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
