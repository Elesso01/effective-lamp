import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Local SQLite file (not a secret). Override via DATABASE_URL in real deploys.
    url: process.env.DATABASE_URL ?? "file:./dev.db"
  }
});
