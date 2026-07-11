import { route, ok } from "@/server/http/respond";
import { requireAdmin } from "@/server/auth/session";
import { listHires } from "@/server/hires/service";
import { toHireDto } from "@/server/hires/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin: every hired member (approved applicant) with their college, last meeting,
// positions, and notifications.
export const GET = route(async (req) => {
  await requireAdmin(req);
  const hires = await listHires();
  return ok({ items: hires.map(toHireDto) });
});
