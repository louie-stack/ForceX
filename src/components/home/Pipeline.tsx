"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";
import { Check } from "@/components/Icons";
import { fmtInt } from "@/lib/format";

/**
 * Copy is held to the published methodology at forcex.com/data-quality:
 * four layers of integrity control, 190 structural constraints, 13 live
 * per-block rules (LVR-001 to LVR-013) and one periodic node cross-check
 * (LVR-014, default cadence every 1,000 blocks, against gettxoutsetinfo).
 */
const STAGES = [
  { name: "Parse", body: "Every block is decoded directly from the Litecoin node, MWEB extension data included. Nothing is taken from a third-party feed.", check: "Block decoded from the node", tint: "var(--muted-2)" },
  { name: "Store", body: "190 structural constraints are enforced by the schema itself, so an invalid relational state cannot be written in the first place.", check: "Write-path commit confirmed", tint: "var(--muted-2)" },
  { name: "Reconcile", body: "Balances, totals, counts and supply values are reconciled across the address ledger, the transaction links and the unspent output set.", check: "Accounting reconciled", tint: "var(--accent)" },
  { name: "Validate", body: "Thirteen live validation rules run against every block at the tip. Their result is recorded with the block height they were run at.", check: "13 per-block rules passing", tint: "var(--accent)" },
  { name: "Cross-check", body: "Every 1,000 blocks the indexed unspent output total is compared with what the Litecoin node itself reports at a checkpoint height.", check: "Node cross-check aligned", tint: "var(--accent)" },
  { name: "Verify", body: "Only then is the block published as validated, so every page can say exactly what has been checked, and when.", check: "Validated and recorded", tint: "var(--good)" },
];

export function Pipeline({ height, hash }: { height: number | null; hash?: string | null }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".pipe__step"));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>(".pipe__tick"));
    const checks = Array.from(el.querySelectorAll<HTMLElement>(".pipe__check"));
    const card = el.querySelector<HTMLElement>(".pipe__card")!;
    const stamp = el.querySelector<HTMLElement>(".pipe__stamp")!;

    if (reduceMotion() || window.innerWidth < 900) {
      // No pinning: the card lights up check by check as it enters view.
      steps.forEach((s, i) => gsap.set(s, { autoAlpha: i === 0 ? 1 : 0 }));
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          checks.forEach((c, i) => window.setTimeout(() => c.classList.add("is-on"), 200 + i * 260));
          ticks.forEach((t, i) =>
            window.setTimeout(() => {
              t.classList.add("is-on");
              t.style.setProperty("--p", "1");
            }, 200 + i * 260),
          );
          window.setTimeout(() => {
            card.style.setProperty("--tint", "var(--good)");
            gsap.to(stamp, { opacity: 1, scale: 1, rotate: -4, duration: 0.5, ease: "back.out(2)" });
          }, 200 + checks.length * 260);
        },
        { threshold: 0.35 },
      );
      io.observe(card);
      return () => io.disconnect();
    }

    const ctx = gsap.context(() => {
      const n = STAGES.length;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: `+=${n * 90}%`,
          pin: el.querySelector(".pipe__pin"),
          scrub: 0.5,
          anticipatePin: 1,
        },
      });
      gsap.set(steps[0], { autoAlpha: 1 });
      STAGES.forEach((s, i) => {
        const at = i;
        if (i > 0) {
          tl.to(steps[i - 1], { autoAlpha: 0, y: -24, duration: 0.35, ease: "power2.in" }, at);
          tl.fromTo(steps[i], { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, at + 0.3);
        }
        tl.to(ticks[i], { "--p": 1, duration: 0.6, ease: "none", onStart: () => ticks[i].classList.add("is-on"), onReverseComplete: () => ticks[i].classList.remove("is-on") }, at + 0.2);
        tl.add(() => {
          checks[i].classList.toggle("is-on", tl.scrollTrigger!.direction >= 0 || tl.progress() > (at + 0.5) / n);
        }, at + 0.5);
        tl.to(card, { "--tint": s.tint, duration: 0.4 }, at + 0.4);
        if (i === n - 1) {
          tl.to(stamp, { opacity: 1, scale: 1, rotate: -4, duration: 0.4, ease: "back.out(2)" }, at + 0.7);
        }
        tl.to({}, { duration: 0.3 }, at + 0.7);
      });
      // Keep checks in sync while scrubbing backwards.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${n * 90}%`,
        onUpdate: (st) => {
          const p = st.progress * n;
          checks.forEach((c, i) => c.classList.toggle("is-on", p >= i + 0.5));
        },
      });
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
                  <span className="pipe__idx">
                    Gate 0{i + 1} of 06
                  </span>
                  <h2 className="pipe__name">{s.name}</h2>
                  <p className="pipe__body">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="pipe__card">
              <span className="pipe__stamp">
                <Check size={12} /> Verified before display
              </span>
              <div className="pipe__card-head">
                <span>
                  Litecoin block: <b>{fmtInt(h)}</b>
                </span>
              </div>
              {hash ? (
                <div className="pipe__hash">
                  <b>hash</b> {hash}
                </div>
              ) : null}
              <ul className="pipe__checks">
                {STAGES.map((s, i) => (
                  <li key={s.name} className={`pipe__check ${i === STAGES.length - 1 ? "is-final" : ""}`}>
                    <i>
                      <Check size={12} />
                    </i>
                    <span>{s.check}</span>
                    <small>{i < 2 ? "write" : i < 5 ? "control" : "record"}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
