import type { PostgresClient } from "./postgres-repository";

export interface PersistenceConfig {
  databaseUrl: string;
  applicationName?: string;
}

export interface TransactionClient extends PostgresClient {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface PostgresConnectionFactory {
  connect(config: PersistenceConfig): Promise<TransactionClient>;
}

export async function withTransaction<T>(db: TransactionClient, work: (tx: TransactionClient) => Promise<T>): Promise<T> {
  await db.begin();
  try {
    const result = await work(db);
    await db.commit();
    return result;
  } catch (error) {
    await db.rollback();
    throw error;
  }
}

export function readPersistenceConfig(env: Record<string, string | undefined>): PersistenceConfig {
  const databaseUrl = env.ATLAS_DATABASE_URL;
  if (!databaseUrl) throw new Error("ATLAS_DATABASE_URL is required for PostgreSQL persistence");
  return { databaseUrl, applicationName: env.ATLAS_DATABASE_APPLICATION_NAME ?? "atlas-ai" };
}
