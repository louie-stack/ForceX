export function fmtInt(v: unknown): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US");
}

export function fmtSignedPct(v: unknown): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return (n > 0 ? "+" : "") + n.toFixed(Math.abs(n) >= 10 ? 1 : 2) + "%";
}

export function fmtBytes(v: unknown): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + " MB";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + " KB";
  return fmtInt(n) + " B";
}

export function fmtLtc(v: unknown, opts: { signed?: boolean } = {}): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const sign = opts.signed === false ? "" : n > 0 ? "+" : n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(2) + "M LTC";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(2) + "K LTC";
  return sign + abs.toFixed(abs >= 10 ? 2 : 4) + " LTC";
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "—";
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return sec + "s ago";
  const min = Math.floor(sec / 60);
  if (min < 60) return min + " min ago";
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + " hr ago";
  const day = Math.floor(hr / 24);
  return day + (day === 1 ? " day ago" : " days ago");
}

export function pctTone(v: unknown): "good" | "bad" | "" {
  const n = Number(v);
  if (!Number.isFinite(n) || n === 0) return "";
  return n > 0 ? "good" : "bad";
}
