import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;
function createAdapter() {
  // No DATABASE_URL (e.g. static build)? Return null and let callers fail only if used.
  if (!process.env.DATABASE_URL) return null;
  // Plain connection string. NOTE (dev-machine only): this network blackholes
  // IPv6 while Node prefers AAAA records, so local runs need
  // NODE_OPTIONS=--dns-result-order=ipv4first (see .env.example).
  // Production hosts (Vercel/Neon) resolve correctly without it.
  return new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL }));
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
