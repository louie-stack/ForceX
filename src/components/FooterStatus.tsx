"use client";

import { useEffect, useState } from "react";
import { fmtInt } from "@/lib/format";
import type { QualityStatus } from "@/lib/api";

export function FooterStatus() {
  const [q, setQ] = useState<QualityStatus | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/public/litecoin/quality/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j && setQ(j.data ?? j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const ok = q?.state === "validated";
  return (
    <div className="chip" style={{ marginTop: 22 }}>
      <span className={ok ? "pulse" : "chip__dot"} style={ok ? undefined : { background: "var(--muted)" }} />
      {q ? (ok ? `Validated through block ${fmtInt(q.tip_height)}` : `Validation ${q.state}`) : "Checking validation status"}
    </div>
  );
}
