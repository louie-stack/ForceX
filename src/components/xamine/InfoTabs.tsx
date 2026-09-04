"use client";

import { useState } from "react";

/** Information / Methodology tabs above the controls, as in the live application. */
export function InfoTabs({ information, methodology }: { information: string; methodology: string }) {
  const [tab, setTab] = useState<"info" | "method">("info");
  return (
    <div className="xtabs">
      <div className="xtabs__bar" role="tablist" aria-label="About this chart">
        <button type="button" role="tab" aria-selected={tab === "info"} className="xtabs__tab mono" onClick={() => setTab("info")}>
          Information
        </button>
        <button type="button" role="tab" aria-selected={tab === "method"} className="xtabs__tab mono" onClick={() => setTab("method")}>
          Methodology
        </button>
      </div>
      <div className="xtabs__panel" role="tabpanel">
        <p>{tab === "info" ? information : methodology}</p>
      </div>
    </div>
  );
}
