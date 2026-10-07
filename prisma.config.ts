import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Hosted Postgres URL (secret — env only, never committed).
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/effective_lamp"
  }
});
