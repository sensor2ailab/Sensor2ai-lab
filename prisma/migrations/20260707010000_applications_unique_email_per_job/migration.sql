-- Enforce one application per email per job. Email is citext, so the unique index
-- is case-insensitive (intern1@ and INTERN1@ collide).

-- First deduplicate existing rows: within each (job_id, email) group keep the most
-- recent application (latest created_at, id as tie-break) and delete the rest.
DELETE FROM applications a
USING applications b
WHERE a.job_id = b.job_id
  AND a.email = b.email
  AND (a.created_at, a.id) < (b.created_at, b.id);

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_id_email_key" ON "applications"("job_id", "email");
