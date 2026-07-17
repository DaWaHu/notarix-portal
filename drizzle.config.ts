import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://notarix:notarix@localhost:5432/notarix",
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./db/schema.ts",
});
