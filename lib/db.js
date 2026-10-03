import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis;
const adapter = globalForPrisma.__adapter ?? new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
if (process.env.NODE_ENV !== "production") globalForPrisma.__adapter = adapter;
export const db = globalForPrisma.__db ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.__db = db;
