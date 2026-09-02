import { NextResponse } from "next/server";
import { getChainHome } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const data = await getChainHome();
  if (!data) return NextResponse.json({ error: "unavailable" }, { status: 502 });
  return NextResponse.json(
    { data },
    { headers: { "cache-control": "public, max-age=120, stale-while-revalidate=600" } },
  );
}
