-- Applications now capture a shared resume link (e.g. Google Drive, view access)
-- instead of an uploaded file, and phone becomes required.
ALTER TABLE "applications" RENAME COLUMN "resume_path" TO "resume_link";

UPDATE "applications" SET "phone" = '' WHERE "phone" IS NULL;
ALTER TABLE "applications" ALTER COLUMN "phone" SET NOT NULL;
