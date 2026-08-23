export interface AgentTask<T = unknown> { id: string; agentId: string; objective: string; input: T; context?: Record<string, unknown>; knowledgeQuery?: string; requiresApproval?: boolean; }
export interface AgentEvidence { id: string; claim: string; source: string; confidence: number; }
export interface AgentResult<T = unknown> { taskId: string; agentId: string; status: "completed" | "blocked" | "failed"; output: T; evidence: AgentEvidence[]; nextAgentIds: string[]; warnings: string[]; }
export interface AgentExecutor { execute<T, R>(task: AgentTask<T>): Promise<AgentResult<R>>; }

export const AGENT_ROUTES: Record<string, string[]> = {
  "brand-intelligence": ["product-research", "customer-research"],
  "product-research": ["competitor-intelligence", "positioning"],
  "competitor-intelligence": ["positioning", "angle-generation"],
  "customer-research": ["audience-strategy", "positioning"],
  "market-trends": ["campaign-strategy", "creative-research"],
  "creative-research": ["angle-generation", "creative-direction"],
  "positioning": ["offer-strategy", "angle-generation"],
  "offer-strategy": ["campaign-strategy", "hook-generation"],
  "angle-generation": ["hook-generation", "creative-direction"],
  "hook-generation": ["copywriting", "script-writing"],
  "audience-strategy": ["campaign-strategy", "creative-direction"],
  "campaign-strategy": ["creative-direction", "creative-testing"],
  "copywriting": ["creative-qa"],
  "script-writing": ["video-creative", "creative-qa"],
  "creative-direction": ["image-creative", "video-creative"],
  "image-creative": ["creative-qa"],
  "video-creative": ["creative-qa"],
  "creative-qa": ["landing-page", "campaign-governance"],
  "landing-page": ["cro", "campaign-governance"],
  "cro": ["creative-testing"],
  "creative-testing": ["performance-analytics"],
  "performance-analytics": ["learning"],
  "learning": ["campaign-strategy", "brand-intelligence"],
};

export function routeNextAgents(agentId: string): string[] { return AGENT_ROUTES[agentId] ?? []; }
