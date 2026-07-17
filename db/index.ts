import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let dbClient: ReturnType<typeof postgres> | undefined;

export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Postgres DATABASE_URL is unavailable. Configure DATABASE_URL as a Vercel environment variable before using the production database.",
    );
  }

  dbClient ??= postgres(databaseUrl, {
    max: 1,
    prepare: false,
  });

  return drizzle(dbClient, { schema });
}

export async function getOptionalDb() {
  try {
    return await getDb();
  } catch {
    return undefined;
  }
}
