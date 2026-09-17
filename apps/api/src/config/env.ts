import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  port: Number(process.env.PORT ?? 4000),

  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/withu",

  jwtSecret: required("JWT_SECRET", process.env.NODE_ENV === "test" ? "test-secret" : undefined),
  jwtRefreshSecret: required(
    "JWT_REFRESH_SECRET",
    process.env.NODE_ENV === "test" ? "test-refresh-secret" : undefined
  ),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? "30d",

  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  mobileAppScheme: process.env.MOBILE_APP_SCHEME ?? "withu",

  corsOrigins: [
    process.env.CLIENT_URL ?? "http://localhost:3000",
    process.env.WEB_URL ?? "http://localhost:3000",
    "http://localhost:8081", // Expo dev server
    "exp://localhost:8081",
    ...(process.env.EXTRA_CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
  ],
};
