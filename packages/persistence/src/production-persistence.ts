import { PostgresTransaction } from "./postgres-repository";
import type { PostgresClient } from "./postgres-repository";

export class ProductionPersistence {
  readonly transaction: PostgresTransaction;
  constructor(db: PostgresClient) { this.transaction = new PostgresTransaction(db); }

  async runCampaignWrite<T>(work: () => Promise<T>): Promise<T> {
    return this.transaction.run(work);
  }
}
