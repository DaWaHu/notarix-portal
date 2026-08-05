const POSTGRES_DRIVER_UNSUPPORTED_PARAMS = new Set(["schema"]);

export function sanitizePostgresUrl(databaseUrl: string) {
  const parsed = new URL(databaseUrl);

  for (const parameter of POSTGRES_DRIVER_UNSUPPORTED_PARAMS) {
    parsed.searchParams.delete(parameter);
  }

  return parsed.toString();
}
