export type CampaignStage = "research" | "strategy" | "creative" | "production" | "qa" | "approval" | "distribution" | "testing" | "analytics" | "learning";
export type CampaignStatus = "draft" | "running" | "blocked" | "completed" | "failed" | "archived";

export interface CampaignSnapshot {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  brandId: string;
  productId: string;
  objective: string;
  stage: CampaignStage;
  status: CampaignStatus;
  strategy?: unknown;
  artifacts: string[];
  approval?: "pending" | "approved" | "rejected";
  distribution?: Record<string, unknown>;
  experiments?: string[];
}

export interface CampaignStateStore {
  get(id: string): Promise<CampaignSnapshot | null>;
  save(snapshot: CampaignSnapshot): Promise<void>;
  history(id: string): Promise<CampaignSnapshot[]>;
}

export class InMemoryCampaignStateStore implements CampaignStateStore {
  private readonly current = new Map<string, CampaignSnapshot>();
  private readonly versions = new Map<string, CampaignSnapshot[]>();

  async get(id: string): Promise<CampaignSnapshot | null> {
    return this.current.get(id) ?? null;
  }

  async save(snapshot: CampaignSnapshot): Promise<void> {
    const next = { ...snapshot, updatedAt: new Date().toISOString() };
    this.current.set(snapshot.id, next);
    const history = this.versions.get(snapshot.id) ?? [];
    history.push(next);
    this.versions.set(snapshot.id, history);
  }

  async history(id: string): Promise<CampaignSnapshot[]> {
    return [...(this.versions.get(id) ?? [])];
  }
}
