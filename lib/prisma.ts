import { PrismaClient } from "@prisma/client";
function createPrismaClient() {
  const logLevels =
    process.env.NODE_ENV === "development" ? (["query", "warn", "error"] as const) : (["warn", "error"] as const);

  const databaseUrl = process.env.DATABASE_URL ?? "";

  return new PrismaClient({
    datasourceUrl: databaseUrl || undefined,
    log: [...logLevels]
  });
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export { createPrismaClient };
