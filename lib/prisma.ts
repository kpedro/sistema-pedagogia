import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient as createLibsqlClient } from "@libsql/client";

function createPrismaClient() {
  const logLevels =
    process.env.NODE_ENV === "development" ? (["query", "warn", "error"] as const) : (["warn", "error"] as const);

  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("http://") || databaseUrl.startsWith("https://")) {
    const url = databaseUrl;
    const tokenFromUrl = (() => {
      try {
        const parsed = new URL(databaseUrl);
        return parsed.searchParams.get("authToken") ?? undefined;
      } catch {
        return undefined;
      }
    })();
    const authToken = process.env.DATABASE_AUTH_TOKEN ?? tokenFromUrl;
    const client = createLibsqlClient({
      url,
      authToken
    });
    const adapter = new PrismaLibSQL(client);

    return new PrismaClient({
      adapter,
      log: [...logLevels]
    });
  }

  return new PrismaClient({
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
