import type { CampaignMetricSnapshot } from "./contracts";

export interface PerformanceSourceClient {
  readonly platform: CampaignMetricSnapshot["platform"];
  fetchCampaignMetrics(input: { organizationId: string; campaignIds: string[]; since: string; until: string }): Promise<CampaignMetricSnapshot[]>;
}

export class PerformanceIngestionService {
  constructor(private readonly clients: PerformanceSourceClient[]) {}

  async ingest(input: { organizationId: string; platform: CampaignMetricSnapshot["platform"]; campaignIds: string[]; since: string; until: string }): Promise<CampaignMetricSnapshot[]> {
    const client = this.clients.find((candidate) => candidate.platform === input.platform);
    if (!client) throw new Error(`Performance source is not configured: ${input.platform}`);
    return client.fetchCampaignMetrics(input);
  }
}
