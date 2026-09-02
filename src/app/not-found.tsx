import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";

export default function NotFound() {
  return (
    <PageHero
      tint="accent"
      shape="cube"
      eyebrow="404 · not found"
      title={
        <>
          This page failed <span className="hi">validation</span>.
        </>
      }
      lead="The address you requested does not exist on this chain."
      actions={
        <>
          <Link href="/" className="btn btn--accent">
            Back to home
            <span className="btn__ico">
              <ArrowUpRight />
            </span>
          </Link>
          <Link href="/xplorer/litecoin" className="btn btn--ghost">
            Open the explorer
          </Link>
        </>
      }
    />
  );
}
