"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { LinxQuery } from "@/lib/xamine/linx";

/** The Address LinX search bar: address, window, and amount bounds. Apply navigates with search params. */
export function LinxControls({ query, invalid }: { query: LinxQuery; invalid: boolean }) {
  const router = useRouter();
  const [address, setAddress] = useState(query.address);
  const [start, setStart] = useState(query.start);
  const [end, setEnd] = useState(new Date(Date.parse(query.end) - 86_400_000).toISOString().slice(0, 10));
  const [min, setMin] = useState(query.min == null ? "" : String(query.min));
  const [max, setMax] = useState(query.max == null ? "" : String(query.max));
  const [pending, setPending] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (address.trim()) p.set("address", address.trim());
    p.set("start", start);
    p.set("end", end);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    setPending(true);
    router.push(`/xamine/tools/address-linx?${p.toString()}`);
    window.setTimeout(() => setPending(false), 1200);
  };

  return (
    <form className="xctl xl__ctl" onSubmit={submit} aria-label="Address LinX controls">
      <label className="xctl__field xl__addr">
        <span className="xctl__label mono">Address</span>
        <input
          type="text"
          className={`xctl__input mono ${invalid ? "is-invalid" : ""}`}
          placeholder="Litecoin address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid || undefined}
        />
      </label>
      <label className="xctl__field">
        <span className="xctl__label mono">From</span>
        <input type="date" className="xctl__input mono" value={start} max={end} onChange={(e) => setStart(e.target.value)} required />
      </label>
      <label className="xctl__field">
        <span className="xctl__label mono">To</span>
        <input type="date" className="xctl__input mono" value={end} min={start} onChange={(e) => setEnd(e.target.value)} required />
      </label>
      <label className="xctl__field">
        <span className="xctl__label mono">Min amount (LTC)</span>
        <input type="number" inputMode="decimal" min="0" step="any" className="xctl__input mono xl__num" placeholder="No minimum" value={min} onChange={(e) => setMin(e.target.value)} />
      </label>
      <label className="xctl__field">
        <span className="xctl__label mono">Max amount (LTC)</span>
        <input type="number" inputMode="decimal" min="0" step="any" className="xctl__input mono xl__num" placeholder="No maximum" value={max} onChange={(e) => setMax(e.target.value)} />
      </label>
      <button type="submit" className={`vgb vgb--primary xctl__apply ${pending ? "is-pending" : ""}`}>
        <i className="vgb__dot" aria-hidden="true" />
        <span className="vgb__label">{pending ? "Applying" : "Apply"}</span>
      </button>
    </form>
  );
}
