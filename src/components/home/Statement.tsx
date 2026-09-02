export function Statement() {
  const generic = ["Parse", "Store", "Display"];
  const fx = ["Parse", "Store", "Reconcile", "Validate", "Cross-check", "Verify"];
  const risks = [
    "Bad joins",
    "Missed edge cases",
    "Incomplete reconciliation",
    "Improper supply logic",
    "Stale metadata",
    "Broken derived tables",
    "Unvalidated calculations",
    "Silent drift from the node",
  ];
  return (
    <section className="section">
      <div className="container statement__grid">
        <div>
          <span className="eyebrow" data-reveal="fade">
            Not just another explorer
          </span>
          <h2 className="statement__quote" data-reveal style={{ marginTop: 22 }}>
            An explorer shows you what happened. ForceX is built to <em className="serif">prove</em> that what is shown is
            correct.
          </h2>
          <p className="lead" data-reveal style={{ marginTop: 28, maxWidth: 560 }}>
            On-chain data is often treated as self-evident. But the way data is parsed, indexed, transformed, stored, and
            displayed introduces risk at every step, and an index can drift from the chain while still looking perfectly
            healthy.
          </p>
          <ul className="risks" data-reveal>
            {risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="compare" data-reveal style={{ ["--d" as string]: "120ms" }}>
          <div className="compare__row">
            <div className="compare__label">
              <span>Typical explorer</span>
              <span>3 steps</span>
            </div>
            <div className="compare__steps">
              {generic.map((s, i) => (
                <span key={s} style={{ display: "contents" }}>
                  <span className="step">{s}</span>
                  {i < generic.length - 1 && <span className="sep">›</span>}
                </span>
              ))}
            </div>
          </div>
          <div className="compare__row compare__row--fx">
            <div className="compare__label">
              <span style={{ color: "var(--accent)" }}>ForceX</span>
              <span>6 steps, then display</span>
            </div>
            <div className="compare__steps">
              {fx.map((s, i) => (
                <span key={s} style={{ display: "contents" }}>
                  <span className={`step ${i >= 2 ? "step--fx" : ""} ${i === fx.length - 1 ? "step--end" : ""}`}>{s}</span>
                  {i < fx.length - 1 && <span className="sep">›</span>}
                </span>
              ))}
            </div>
            <p className="small" style={{ margin: "18px 0 0" }}>
              Only then is data worthy of display. Each control produces a recorded result with the block it ran at, so
              evidence is preserved rather than implied.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
