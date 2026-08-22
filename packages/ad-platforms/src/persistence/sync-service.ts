import type { MetaAccountSnapshot } from "../meta/sync";
import { mapMetaInsight, type MetaInsightPayload } from "../meta/insights";
import type { AdPlatformRepository } from "./repository";
import { AdPlatformSyncWriter } from "./sync-writer";

export class AdDataSyncService {
  private readonly writer: AdPlatformSyncWriter;

  constructor(private readonly repository: AdPlatformRepository) {
    this.writer = new AdPlatformSyncWriter(repository);
  }

  async persistAccount(snapshot: MetaAccountSnapshot): Promise<void> {
    await this.writer.write(snapshot);
  }

  async persistMetaInsights(organizationId: string, payloads: MetaInsightPayload[], timestamp?: string): Promise<void> {
    for (const payload of payloads) {
      await this.repository.appendPerformance(mapMetaInsight(payload, organizationId, timestamp));
    }
  }
}
