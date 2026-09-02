import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";

export default function NotFound() {
  return (
    <section className="page-hero" style={{ minHeight: "70dvh", display: "grid", alignItems: "center" }}>
      <div className="grid-bg" />
      <div className="container" style={{ textAlign: "center" }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>
          404 · not found
        </span>
        <h1 className="h1 page-hero__title" style={{ marginInline: "auto" }}>
          This page failed <span className="hi">validation</span>.
        </h1>
        <p className="lead" style={{ margin: "24px auto 0", maxWidth: 480 }}>
          The address you requested does not exist on this chain. Try the explorer or head back home.
        </p>
        <div className="page-hero__actions" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn--accent">
            Back to home
            <span className="btn__ico">
              <ArrowUpRight />
            </span>
          </Link>
          <Link href="/xplorer/litecoin" className="btn btn--ghost">
            Open the explorer
          </Link>
        </div>
      </div>
    </section>
  );
}
