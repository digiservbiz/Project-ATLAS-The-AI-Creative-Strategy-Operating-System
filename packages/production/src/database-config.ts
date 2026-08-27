export interface DatabaseConfig { url: string; maxConnections?: number; idleTimeoutMs?: number; connectionTimeoutMs?: number; ssl?: boolean; }

export function loadDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const url = env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for production persistence");
  return {
    url,
    maxConnections: Number(env.DATABASE_MAX_CONNECTIONS ?? 10),
    idleTimeoutMs: Number(env.DATABASE_IDLE_TIMEOUT_MS ?? 30_000),
    connectionTimeoutMs: Number(env.DATABASE_CONNECTION_TIMEOUT_MS ?? 10_000),
    ssl: env.DATABASE_SSL !== "false",
  };
}
