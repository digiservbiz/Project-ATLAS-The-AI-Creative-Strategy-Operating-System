export type CampaignStatus =
  | "draft"
  | "researching"
  | "strategy"
  | "production"
  | "review"
  | "active"
  | "paused"
  | "completed";

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: "active" | "archived" | "completed";
}

export interface Brand {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  websiteUrl?: string;
  industry?: string;
  market?: string;
  language?: string;
  toneOfVoice: Record<string, unknown>;
  brandRules: Record<string, unknown>;
}

export interface Product {
  id: string;
  organizationId: string;
  projectId: string;
  brandId: string;
  name: string;
  description: string;
  url?: string;
  price?: number;
  currency?: string;
  features: string[];
  benefits: string[];
  knownObjections: string[];
}

export interface Campaign {
  id: string;
  organizationId: string;
  projectId: string;
  brandId: string;
  productId?: string;
  name: string;
  objective: string;
  channel: string;
  status: CampaignStatus;
  brief: Record<string, unknown>;
}
