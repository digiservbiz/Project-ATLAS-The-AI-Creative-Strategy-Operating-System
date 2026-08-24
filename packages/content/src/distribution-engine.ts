export type DistributionPlatform = "instagram" | "facebook" | "tiktok" | "youtube" | "linkedin" | "pinterest" | "x" | "shopify" | "email";
export interface DistributionJob { id: string; contentId: string; platform: DistributionPlatform; scheduledAt?: string; status: "draft" | "queued" | "published" | "failed"; payload: Record<string, unknown>; }
export interface PublisherAdapter { publish(job: DistributionJob): Promise<{ externalId: string; url?: string }>; }

export class DistributionEngine {
  constructor(private readonly adapters: Partial<Record<DistributionPlatform, PublisherAdapter>>) {}

  createJobs(contentId: string, platforms: DistributionPlatform[], payload: Record<string, unknown>, scheduledAt?: string): DistributionJob[] {
    return platforms.map((platform, index) => ({ id: `distribution:${contentId}:${index + 1}`, contentId, platform, scheduledAt, status: "draft", payload }));
  }

  async publishApproved(jobs: DistributionJob[], approved = false) {
    if (!approved) return jobs.map((job) => ({ job, status: "blocked_pending_approval" as const }));
    return Promise.all(jobs.map(async (job) => {
      const adapter = this.adapters[job.platform];
      if (!adapter) return { job, status: "failed" as const, error: `No publisher adapter for ${job.platform}` };
      try {
        const published = await adapter.publish({ ...job, status: "queued" });
        return { job: { ...job, status: "published" as const }, published };
      } catch (error) {
        return { job: { ...job, status: "failed" as const }, error: error instanceof Error ? error.message : "Publishing failed" };
      }
    }));
  }
}
