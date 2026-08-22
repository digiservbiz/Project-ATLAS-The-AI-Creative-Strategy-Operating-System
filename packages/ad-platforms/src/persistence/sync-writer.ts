import type { MetaAccountSnapshot } from "../meta/sync";
import type { AdPlatformRepository } from "./repository";

export class AdPlatformSyncWriter {
  constructor(private readonly repository: AdPlatformRepository) {}

  async write(snapshot: MetaAccountSnapshot): Promise<void> {
    for (const campaign of snapshot.campaigns) await this.repository.upsertCampaign(campaign);
    for (const adSet of snapshot.adSets) await this.repository.upsertAdSet(adSet);
    for (const ad of snapshot.ads) await this.repository.upsertAd(ad);
    for (const creative of snapshot.creatives) await this.repository.upsertCreative(creative);
  }
}
