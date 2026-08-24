import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  // Neon exposes both pooled and direct endpoints. Some suspended/restarted
  // projects can leave the pooler unavailable while the direct endpoint is
  // healthy, which Prisma reports as P1001. Server-side Prisma can safely use
  // the corresponding direct endpoint; credentials and database stay the same.
  if (url?.includes(".neon.tech") && url.includes("-pooler.")) {
    return url.replace("-pooler.", ".");
  }

  return url;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
