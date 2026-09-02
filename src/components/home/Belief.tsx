export function Belief() {
  const items = [
    "Design the data model correctly.",
    "Validate before display.",
    "Document methodology.",
    "Expose control logic clearly.",
    "Make the quality results visible.",
  ];
  return (
    <section className="section belief" style={{ paddingBottom: 0 }}>
      <div className="container">
        <span className="eyebrow" data-reveal="fade">
          Our belief
        </span>
        <h2 className="h1 belief__title" data-reveal>
          Trust is earned through <em className="serif">process</em>, not branding.
        </h2>
        <p className="lead" data-reveal style={{ maxWidth: 620, margin: "24px auto 0" }}>
          Data should not become trusted simply because it is displayed. It should become trusted because it has been
          verified, governed, and made worthy of confidence.
        </p>
        <ol className="belief__list" data-reveal>
          {items.map((t, i) => (
            <li key={t}>
              <small>0{i + 1}</small>
              {t}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
