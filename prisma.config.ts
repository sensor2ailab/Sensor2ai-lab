import "dotenv/config";
import { defineConfig, env } from "prisma/config";

//The app client connects via a driver adapter (see src/server/db/prisma.ts) using DATABASE_URL (the pooled URL in production).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
