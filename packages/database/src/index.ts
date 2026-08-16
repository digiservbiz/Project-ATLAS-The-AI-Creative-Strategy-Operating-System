import { Pool, type QueryResultRow } from "pg";

export interface DatabaseConfig { connectionString: string; }

export class Database {
  private readonly pool: Pool;
  constructor(config: DatabaseConfig) { this.pool = new Pool({ connectionString: config.connectionString }); }
  async query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query<T>(text, values);
    return result.rows;
  }
  async close(): Promise<void> { await this.pool.end(); }
}

export function createDatabase(connectionString = process.env.DATABASE_URL): Database {
  if (!connectionString) throw new Error("DATABASE_URL is required");
  return new Database({ connectionString });
}
