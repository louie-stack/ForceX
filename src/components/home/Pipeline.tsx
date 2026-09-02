"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/gsap";
import { Check } from "@/components/Icons";
import { fmtInt } from "@/lib/format";

const STAGES = [
  { name: "Parse", body: "Raw blocks are decoded straight from the node: headers, transactions, inputs, outputs, and MWEB extension data.", check: "Block decoded from node", tint: "var(--muted-2)" },
  { name: "Store", body: "Structural constraints block invalid rows before they exist. Primary keys, foreign keys, uniqueness, and check constraints: 190 enforcement points at write time.", check: "Write-path commit confirmed", tint: "var(--muted-2)" },
  { name: "Reconcile", body: "Balances, totals, counts, and supply-related values are reconciled across canonical and derived surfaces so independently built paths stay aligned.", check: "Accounting reconciled", tint: "var(--accent)" },
  { name: "Validate", body: "Thirteen live controls run on every block at tip across three integrity domains: monetary, address, and block-and-write.", check: "13 per-block controls passing", tint: "var(--accent)" },
  { name: "Cross-check", body: "Every 1,000 blocks the indexed UTXO set is compared against the Litecoin node itself, an independent source of truth outside the platform.", check: "Node cross-check aligned", tint: "var(--accent)" },
  { name: "Verify", body: "Only then is a block worthy of display. Its result is recorded with the height it ran at, so evidence is preserved rather than implied.", check: "Verified and recorded", tint: "var(--good)" },
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
  const hx = hash ?? "854a9df1b80613e4ba1be4dfb2402d7bcb77b7709de9ac33268e46781cff67c2";

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
                <Check size={12} /> Worthy of display
              </span>
              <div className="pipe__card-head">
                <span>Litecoin block</span>
                <b>{fmtInt(h)}</b>
              </div>
              <div className="pipe__hash">
                <b>hash</b> {hx}
              </div>
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
