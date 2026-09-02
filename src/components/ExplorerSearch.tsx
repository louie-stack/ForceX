"use client";

import { useState } from "react";
import { FX_APP_ORIGIN } from "@/lib/api";
import { Search } from "./Icons";

/**
 * Routes a query to the right live explorer page. Block heights and hashes,
 * transaction ids, and Litecoin addresses are recognized locally so the
 * user lands on the detail page directly; anything else goes to search.
 */
export function ExplorerSearch() {
  const [q, setQ] = useState("");
  const base = `${FX_APP_ORIGIN}/xplorer/litecoin`;

  const target = (raw: string) => {
    const s = raw.trim();
    if (!s) return null;
    if (/^\d{1,9}$/.test(s)) return `${base}/block/${s}`;
    if (/^[0-9a-f]{64}$/i.test(s)) return `${base}/search?q=${encodeURIComponent(s)}`;
    if (/^(ltc1|L|M|3)[0-9a-zA-Z]{25,90}$/.test(s)) return `${base}/address/${s}`;
    return `${base}/search?q=${encodeURIComponent(s)}`;
  };

  return (
    <form
      className="xp-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const t = target(q);
        if (t) window.location.assign(t);
      }}
    >
      <Search size={18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search block, tx, address…" aria-label="Search the Litecoin explorer" autoComplete="off" spellCheck={false} />
      <button type="submit" className="btn btn--sm btn--accent">
        Search
      </button>
    </form>
  );
}
