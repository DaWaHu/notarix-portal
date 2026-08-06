export type OrderSeedEnvironment = {
  NOTARIX_BUILD_MODE?: string;
  NOTARIX_DATABASE_ENVIRONMENT?: string;
  VERCEL_ENV?: string;
};

export function orderSeedFallbackAllowed(
  env: OrderSeedEnvironment = {
    NOTARIX_BUILD_MODE: process.env.NOTARIX_BUILD_MODE,
    NOTARIX_DATABASE_ENVIRONMENT: process.env.NOTARIX_DATABASE_ENVIRONMENT,
    VERCEL_ENV: process.env.VERCEL_ENV,
  },
): boolean {
  if (env.NOTARIX_BUILD_MODE === "1") return true;
  const environment = env.NOTARIX_DATABASE_ENVIRONMENT ?? env.VERCEL_ENV;
  return environment !== "production";
}
