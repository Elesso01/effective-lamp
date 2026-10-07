import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;
function createAdapter() {
  // No DATABASE_URL (e.g. static build)? Return null and let callers fail only if used.
  if (!process.env.DATABASE_URL) return null;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return new PrismaPg(pool);
}
const adapter = globalForPrisma.__adapter ?? createAdapter();
if (process.env.NODE_ENV !== "production") globalForPrisma.__adapter = adapter;
function createClient() {
  if (!adapter) {
    // Build/edge without DATABASE_URL: fail only if actually queried.
    return new Proxy({}, { get() { throw new Error("DATABASE_URL is not set"); } });
  }
  return new PrismaClient({ adapter });
}
export const db = globalForPrisma.__db ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.__db = db;
