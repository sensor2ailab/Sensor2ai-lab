import { z } from "zod";
import { route, ok } from "@/server/http/respond";
import { clientMeta } from "@/server/http/request";
import { enforceRateLimit } from "@/server/http/rate-limit";
import { submitApplication } from "@/server/applications/service";
import { toApplicationDto } from "@/server/applications/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.object({ id: z.string().uuid() });
const bodySchema = z
  .object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
    phone: z.string().min(1).max(40),
    college: z.string().trim().min(1).max(200).optional(),
    coverLetter: z.string().max(5000).optional(),
    // A shareable resume link (e.g. Google Drive with view access).
    resumeLink: z.string().url().max(2000),
  })
  .strict();

// Public, no login. Applicants share a resume link instead of uploading a file, so
// there is no storage involved. Rate limited per IP and per email.
export const POST = route(async (req, ctx) => {
  const { id } = idSchema.parse(await ctx.params);
  const { ip } = clientMeta(req);
  enforceRateLimit(`apply:ip:${ip ?? "unknown"}`, 5, 60_000);

  const body = bodySchema.parse(await req.json());
  enforceRateLimit(`apply:email:${body.email.toLowerCase()}`, 3, 3_600_000);

  const application = await submitApplication({ jobId: id, ...body });
  return ok({ application: toApplicationDto(application) }, { status: 201 });
});
