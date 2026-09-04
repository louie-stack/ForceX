import type { Provenance as P } from "@/lib/xamine/types";

/** The governed footer of every chart: where the numbers came from and the height they were validated to. */
export function Provenance({ p }: { p: P }) {
  if (p.source === "sample") {
    return (
      <span className="xprov xprov--sample mono">
        <i aria-hidden="true" />
        Sample data · live series connects when the API key is configured
      </span>
    );
  }
  return (
    <span className="xprov xprov--live mono">
      <i aria-hidden="true" />
      Validated{p.validatedHeight != null && <b>#{p.validatedHeight.toLocaleString("en-US")}</b>}
      {p.datasetVersion && <em>dataset {p.datasetVersion}</em>}
      {p.methodologyVersion && <em>methodology {p.methodologyVersion}</em>}
    </span>
  );
}
