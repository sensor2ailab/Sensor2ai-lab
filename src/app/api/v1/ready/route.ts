import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

// Readiness: dependencies (the database) are reachable.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready" });
  } catch {
    return NextResponse.json(
      { error: { code: "not_ready", message: "database unreachable" } },
      { status: 503 },
    );
  }
}
