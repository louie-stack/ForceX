import { NextResponse } from "next/server";
import { FX_ORIGIN } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Forwards the contact form to the existing ForceX contact handler.
 * The upstream handler verifies a Cloudflare Turnstile token; when the
 * widget is not configured for this origin the upstream rejection is
 * surfaced so the page can offer the email fallback.
 */
export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();
  if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  }
  if (payload.website) {
    // Honeypot filled: pretend success, drop silently.
    return NextResponse.json({ ok: true });
  }
  try {
    const upstream = await fetch(`${FX_ORIGIN}/contactus/_internal/contact`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (upstream.ok) return NextResponse.json({ ok: true });
    const text = await upstream.text();
    return NextResponse.json(
      { ok: false, error: "upstream", status: upstream.status, detail: text.slice(0, 300) },
      { status: 502 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}
