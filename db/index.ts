import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sanitizePostgresUrl } from "./database-url";
import * as schema from "./schema";

let dbClient: ReturnType<typeof postgres> | undefined;

export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Postgres DATABASE_URL is unavailable. Configure DATABASE_URL as a Vercel environment variable before using the production database.",
    );
  }

  dbClient ??= postgres(sanitizePostgresUrl(databaseUrl), {
    max: 1,
    prepare: false,
  });

  return drizzle(dbClient, { schema });
}

export async function getOptionalDb() {
  // Static page discovery must never open a production database connection.
  // Runtime requests do not inherit this build-command-only environment flag.
  if (process.env.NOTARIX_BUILD_MODE === "1") return undefined;

  try {
    return await getDb();
  } catch {
    return undefined;
  }
}
