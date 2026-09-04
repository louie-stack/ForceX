import { FX_ORIGIN } from "@/lib/api";
import type { Provenance } from "./types";

/**
 * Address LinX: counterparties, direction and flow for one address over a
 * window. Sample relationships are derived deterministically from the
 * address until the live adapter has a key.
 */
export interface LinxQuery {
  address: string;
  start: string;
  end: string;
  min: number | null;
  max: number | null;
}

export interface Counterparty {
  address: string;
  direction: "in" | "out" | "both";
  /** Net value moved, in litoshi (positive = received by the selected address). */
  valueAtomic: number;
  txs: number;
  heightFrom: number;
  heightTo: number;
}

export interface LinxSummary {
  balanceAtomic: number | null;
  txCount: number | null;
  firstSeenHeight: number | null;
  lastSeenHeight: number | null;
}

export interface LinxPayload {
  query: LinxQuery;
  valid: boolean;
  summary: LinxSummary | null;
  counterparties: Counterparty[];
  provenance: Provenance;
}

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const isDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/** Legacy P2PKH/P2SH (L, M, 3) or bech32 (ltc1) Litecoin addresses. */
export const isLitecoinAddress = (a: string) => /^(?:[LM3][1-9A-HJ-NP-Za-km-z]{26,34}|ltc1[02-9ac-hj-np-z]{8,90})$/.test(a);

export function parseLinxQuery(sp: Record<string, string | string[] | undefined>): LinxQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const today = Math.floor(Date.now() / DAY) * DAY;
  let start = iso(today);
  let end = iso(today + DAY);
  if (isDate(one("start")) && isDate(one("end")) && one("start")! <= one("end")!) {
    start = one("start")!;
    end = iso(Date.parse(one("end")!) + DAY);
  }
  const num = (v?: string) => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
  return { address: (one("address") ?? "").trim().slice(0, 100), start, end, min: num(one("min")), max: num(one("max")) };
}

/* ---------- sample ---------- */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const fakeAddress = (r: () => number) => {
  const bech = r() < 0.55;
  if (bech) {
    const chars = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    let s = "ltc1q";
    for (let i = 0; i < 38; i++) s += chars[Math.floor(r() * chars.length)];
    return s;
  }
  let s = r() < 0.5 ? "L" : "M";
  for (let i = 0; i < 33; i++) s += B58[Math.floor(r() * B58.length)];
  return s;
};

export function sampleLinx(q: LinxQuery, tipHeight = 3_171_892): LinxPayload {
  const prov: Provenance = { source: "sample", validatedHeight: tipHeight, validatedAt: null, datasetVersion: "sample", methodologyVersion: null };
  if (!q.address || !isLitecoinAddress(q.address)) return { query: q, valid: isLitecoinAddress(q.address), summary: null, counterparties: [], provenance: prov };
  const r = rng(hash(q.address + q.start + q.end));
  const days = Math.max(1, Math.round((Date.parse(q.end) - Date.parse(q.start)) / DAY));
  const blocksPerDay = 576;
  const heightEnd = tipHeight - Math.floor(r() * 40);
  const heightStart = heightEnd - days * blocksPerDay;
  const n = 5 + Math.floor(r() * 7);
  const cps: Counterparty[] = [];
  for (let i = 0; i < n; i++) {
    const roll = r();
    const direction: Counterparty["direction"] = roll < 0.42 ? "in" : roll < 0.84 ? "out" : "both";
    const magnitude = Math.pow(10, 1 + r() * 3.2) * 1e8;
    const value = Math.round(direction === "out" ? -magnitude : magnitude * (direction === "both" ? (r() - 0.45) * 1.6 : 1));
    const txs = 1 + Math.floor(Math.pow(r(), 2) * 14);
    const hf = heightStart + Math.floor(r() * (heightEnd - heightStart));
    const ht = Math.min(heightEnd, hf + Math.floor(r() * Math.max(1, heightEnd - hf)));
    cps.push({ address: fakeAddress(r), direction, valueAtomic: value, txs, heightFrom: hf, heightTo: ht });
  }
  const filtered = cps.filter((c) => {
    const ltc = Math.abs(c.valueAtomic) / 1e8;
    return (q.min == null || ltc >= q.min) && (q.max == null || ltc <= q.max);
  });
  filtered.sort((a, b) => Math.abs(b.valueAtomic) - Math.abs(a.valueAtomic));
  const received = filtered.filter((c) => c.valueAtomic > 0).reduce((a, c) => a + c.valueAtomic, 0);
  const sent = filtered.filter((c) => c.valueAtomic < 0).reduce((a, c) => a - c.valueAtomic, 0);
  return {
    query: q,
    valid: true,
    summary: {
      balanceAtomic: Math.round(received - sent + Math.pow(10, 2 + r() * 2.5) * 1e8),
      txCount: filtered.reduce((a, c) => a + c.txs, 0),
      firstSeenHeight: Math.min(...filtered.map((c) => c.heightFrom), heightEnd),
      lastSeenHeight: Math.max(...filtered.map((c) => c.heightTo), heightStart),
    },
    counterparties: filtered,
    provenance: prov,
  };
}

/* ---------- live (dormant until FX_API_KEY is set) ---------- */

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function liveLinx(q: LinxQuery): Promise<LinxPayload | null> {
  const key = process.env.FX_API_KEY;
  if (!key || !isLitecoinAddress(q.address)) return null;
  const base = `${FX_ORIGIN}/xtract/v1/litecoin/chain/address/${encodeURIComponent(q.address)}`;
  const headers = { accept: "application/json", authorization: `Bearer ${key}`, "user-agent": "ForceX-Web/next" };
  try {
    const sumRes = await fetch(`${base}?include=activity`, { headers, next: { revalidate: 120 } });
    if (!sumRes.ok) return null;
    const sum = await sumRes.json();
    const startMs = Date.parse(q.start);
    const endMs = Date.parse(q.end);
    const agg = new Map<string, Counterparty>();
    let cursor: string | undefined;
    for (let page = 0; page < 10; page++) {
      const url = `${base}/transactions?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const res = await fetch(url, { headers, next: { revalidate: 120 } });
      if (!res.ok) break;
      const json = await res.json();
      const rows: any[] = json.data?.transactions ?? json.data ?? [];
      let stop = false;
      for (const tx of rows) {
        const t = Date.parse(tx.block_time ?? tx.time ?? tx.timestamp ?? "");
        if (Number.isFinite(t) && t < startMs) {
          stop = true;
          break;
        }
        if (Number.isFinite(t) && t >= endMs) continue;
        const height = Number(tx.block_height ?? tx.height ?? 0);
        const ins: any[] = tx.inputs ?? tx.vin ?? [];
        const outs: any[] = tx.outputs ?? tx.vout ?? [];
        const mine = (x: any) => (x.address ?? x.scriptpubkey_address) === q.address;
        const isSender = ins.some(mine);
        for (const o of outs) {
          const addr = o.address ?? o.scriptpubkey_address;
          const val = Number(o.value_atomic_units ?? o.value ?? 0);
          if (!addr || addr === q.address) continue;
          if (isSender) touch(agg, addr, -val, height);
        }
        if (!isSender) {
          const received = outs.filter(mine).reduce((a, o) => a + Number(o.value_atomic_units ?? o.value ?? 0), 0);
          for (const i of ins) {
            const addr = i.address ?? i.scriptpubkey_address;
            if (addr && addr !== q.address) touch(agg, addr, received / Math.max(1, ins.length), height);
          }
        }
      }
      cursor = json.data?.next_cursor ?? json.meta?.next_cursor ?? json.next_cursor;
      if (stop || !cursor) break;
    }
    const counterparties = [...agg.values()]
      .filter((c) => {
        const ltc = Math.abs(c.valueAtomic) / 1e8;
        return (q.min == null || ltc >= q.min) && (q.max == null || ltc <= q.max);
      })
      .sort((a, b) => Math.abs(b.valueAtomic) - Math.abs(a.valueAtomic));
    const d = sum.data ?? {};
    return {
      query: q,
      valid: true,
      summary: {
        balanceAtomic: d.balance_atomic_units ?? d.balance ?? null,
        txCount: d.transaction_count ?? d.tx_count ?? null,
        firstSeenHeight: d.first_seen_height ?? null,
        lastSeenHeight: d.last_seen_height ?? null,
      },
      counterparties,
      provenance: {
        source: "live",
        validatedHeight: sum.meta?.validation?.validated_height ?? null,
        validatedAt: sum.meta?.validation?.validated_at ?? null,
        datasetVersion: sum.meta?.dataset_version ?? null,
        methodologyVersion: sum.meta?.methodology_version ?? null,
      },
    };
  } catch {
    return null;
  }
}

function touch(agg: Map<string, Counterparty>, addr: string, delta: number, height: number) {
  const cur = agg.get(addr) ?? { address: addr, direction: delta >= 0 ? "in" : "out", valueAtomic: 0, txs: 0, heightFrom: height, heightTo: height };
  cur.valueAtomic += delta;
  cur.txs += 1;
  cur.heightFrom = Math.min(cur.heightFrom, height);
  cur.heightTo = Math.max(cur.heightTo, height);
  if ((delta >= 0 && cur.direction === "out") || (delta < 0 && cur.direction === "in")) cur.direction = "both";
  agg.set(addr, cur);
}

export async function getLinx(q: LinxQuery, tipHeight?: number | null): Promise<LinxPayload> {
  const live = await liveLinx(q);
  if (live) return live;
  return sampleLinx(q, tipHeight ?? undefined);
}
