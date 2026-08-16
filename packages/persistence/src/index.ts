import type { Campaign, Product, Project } from "@atlas/domain";

export interface ProjectRepository {
  getById(id: string, organizationId: string): Promise<Project | null>;
  save(project: Project): Promise<void>;
}

export interface ProductRepository {
  getById(id: string, organizationId: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
}

export interface CampaignRepository {
  getById(id: string, organizationId: string): Promise<Campaign | null>;
  save(campaign: Campaign): Promise<void>;
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly data = new Map<string, Project>();
  async getById(id: string, organizationId: string): Promise<Project | null> {
    const value = this.data.get(id);
    return value?.organizationId === organizationId ? value : null;
  }
  async save(project: Project): Promise<void> { this.data.set(project.id, project); }
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly data = new Map<string, Product>();
  async getById(id: string, organizationId: string): Promise<Product | null> {
    const value = this.data.get(id);
    return value?.organizationId === organizationId ? value : null;
  }
  async save(product: Product): Promise<void> { this.data.set(product.id, product); }
}

export class InMemoryCampaignRepository implements CampaignRepository {
  private readonly data = new Map<string, Campaign>();
  async getById(id: string, organizationId: string): Promise<Campaign | null> {
    const value = this.data.get(id);
    return value?.organizationId === organizationId ? value : null;
  }
  async save(campaign: Campaign): Promise<void> { this.data.set(campaign.id, campaign); }
}
