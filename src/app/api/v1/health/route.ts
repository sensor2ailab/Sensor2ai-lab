import { NextResponse } from "next/server";

// Liveness: the process is up. Kept dependency-free and always fast.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", uptime: process.uptime() });
}
