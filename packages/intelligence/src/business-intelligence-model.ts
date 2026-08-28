export type BusinessModelType = "ecommerce" | "saas" | "service" | "local_business" | "digital_product" | "course" | "personal_brand" | "agency" | "real_estate" | "automotive" | "other";

export interface Business { id: string; name: string; model: BusinessModelType; description?: string; markets: string[]; channels: string[]; brandIds: string[]; }
export interface Brand { id: string; businessId: string; name: string; positioning?: string; }
export interface Offer { id: string; businessId: string; name: string; type: "product" | "service" | "subscription" | "bundle" | "other"; valueProposition?: string; price?: number; currency?: string; }
export interface Audience { id: string; businessId: string; name: string; problems: string[]; desires: string[]; objections: string[]; awarenessLevel?: string; purchaseIntent?: string; }
export interface Competitor { id: string; businessId: string; name: string; positioning?: string; offerIds?: string[]; }
export interface Campaign { id: string; businessId: string; channel: string; objective: string; offerId?: string; audienceIds: string[]; }
export interface BusinessIntelligenceModel { business: Business; brands: Brand[]; offers: Offer[]; audiences: Audience[]; competitors: Competitor[]; campaigns: Campaign[]; }

export function createBusinessIntelligenceModel(input: BusinessIntelligenceModel): BusinessIntelligenceModel {
  const ids = new Set<string>();
  for (const collection of [input.brands, input.offers, input.audiences, input.competitors, input.campaigns]) {
    for (const item of collection) { if (ids.has(item.id)) throw new Error(`Duplicate business intelligence entity id: ${item.id}`); ids.add(item.id); }
  }
  if (!input.business.name.trim()) throw new Error("Business name is required");
  return structuredClone(input);
}
