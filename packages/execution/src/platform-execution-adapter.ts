export type PlatformName = "meta" | "tiktok" | "shopify";

export interface ApprovedCreative { id: string; campaignId: string; platform: PlatformName; payload: Record<string, unknown>; }
export interface PublishResult { platform: PlatformName; externalId: string; status: "published" | "failed"; raw?: unknown; }

export interface CreativePublisher { publish(creative: ApprovedCreative): Promise<PublishResult>; }

export class PlatformExecutionAdapter {
  constructor(private readonly publishers: Partial<Record<PlatformName, CreativePublisher>>) {}

  async publish(creative: ApprovedCreative): Promise<PublishResult> {
    const publisher = this.publishers[creative.platform];
    if (!publisher) throw new Error(`No publisher configured for ${creative.platform}`);
    return publisher.publish(creative);
  }
}
