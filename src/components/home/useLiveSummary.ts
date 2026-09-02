"use client";

import { useEffect, useState } from "react";
import type { NetworkSummary } from "@/lib/api";

const REFRESH_MS = 60_000;

/** Shared polling hook so the HUD, ticker, and panel stay in lockstep. */
export function useLiveSummary(initial: NetworkSummary) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/public/litecoin/summary", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => alive && j?.data && setData(j.data))
        .catch(() => {});
    const iv = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(iv);
    };
  }, []);
  return data;
}
