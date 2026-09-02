import { NextResponse } from "next/server";
import { getNetworkSummary } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const data = await getNetworkSummary();
  return NextResponse.json(
    { data },
    { headers: { "cache-control": "public, max-age=30, stale-while-revalidate=120" } },
  );
}
