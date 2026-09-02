import { NextResponse } from "next/server";
import { FX_ORIGIN, PUBLIC_ENDPOINTS } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  if (!(PUBLIC_ENDPOINTS as readonly string[]).includes(joined)) {
    return NextResponse.json({ error: "unknown_endpoint" }, { status: 404 });
  }
  try {
    const upstream = await fetch(`${FX_ORIGIN}/api/public/litecoin/${joined}`, {
      headers: { accept: "application/json", "user-agent": "ForceX-Web/next" },
      next: { revalidate: 30 },
    });
    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=30, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }
}
