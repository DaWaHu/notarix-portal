import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Re-use the same Prisma client in development (prevents too many connections)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function getPgPool() {
  if (globalForPrisma.pgPool) return globalForPrisma.pgPool;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optional: you can lower this if you want fewer DB connections in dev
    max: 5,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  return pool;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(getPgPool()),
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
