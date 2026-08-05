import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle migration commands.");
}

export default defineConfig({
  dbCredentials: {
    url: sanitizePostgresUrl(databaseUrl),
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./db/schema.ts",
});

function sanitizePostgresUrl(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.delete("schema");
  return parsed.toString();
}
