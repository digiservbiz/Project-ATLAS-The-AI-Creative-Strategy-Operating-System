export type AgentDomain = "research" | "strategy" | "creative" | "conversion" | "analytics" | "governance";
export interface AgentDefinition { id: string; name: string; domain: AgentDomain; responsibilities: string[]; knowledgeTopics: string[]; outputs: string[]; requiresApproval?: boolean; }

type AgentSeed = readonly [id: string, name: string, domain: AgentDomain];

const AGENT_SEEDS: readonly AgentSeed[] = [
  ["brand-intelligence","Brand Intelligence","research"], ["product-research","Product Research","research"], ["competitor-intelligence","Competitor Intelligence","research"], ["customer-research","Customer Research","research"], ["market-trends","Market Trends","research"], ["creative-research","Creative Research","research"],
  ["positioning","Positioning","strategy"], ["offer-strategy","Offer Strategy","strategy"], ["angle-generation","Angle Generation","strategy"], ["hook-generation","Hook Generation","strategy"], ["audience-strategy","Audience Strategy","strategy"], ["campaign-strategy","Campaign Strategy","strategy"],
  ["copywriting","Direct Response Copywriting","creative"], ["script-writing","Script Writing","creative"], ["creative-direction","Creative Direction","creative"], ["ugc-strategy","UGC Strategy","creative"], ["image-creative","Image Creative","creative"], ["video-creative","Video Creative","creative"], ["creative-qa","Creative QA","governance"],
  ["landing-page","Landing Page Optimization","conversion"], ["cro","CRO","conversion"], ["creative-testing","Creative Testing","analytics"], ["performance-analytics","Performance Analytics","analytics"], ["learning","Continuous Learning","analytics"], ["campaign-governance","Campaign Governance","governance"],
];

export const ATLAS_AGENTS: AgentDefinition[] = AGENT_SEEDS.map(([id, name, domain]) => ({
  id,
  name,
  domain,
  responsibilities: [],
  knowledgeTopics: [],
  outputs: [],
}));

export class AgentRegistry {
  private readonly agents = new Map(ATLAS_AGENTS.map((agent) => [agent.id, agent]));
  get(id: string) { return this.agents.get(id); }
  list(domain?: AgentDomain) { return [...this.agents.values()].filter((agent) => !domain || agent.domain === domain); }
}
