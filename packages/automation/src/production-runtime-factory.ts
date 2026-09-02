import { AtlasOrchestrator, type AgentSkill } from "@atlas/orchestrator";
import { ProductionAtlasRuntime, type RuntimeJobQueue, type RuntimeStore } from "@atlas/runtime";
import { IntelligenceAwareOrchestrator, type WorkflowSkillMap } from "./intelligence-aware-orchestrator";
import { ProductionWorkflowWorker } from "./production-worker";
import type { JobStore } from "./durable-job-queue";
import type { ProductionIntelligenceContextLoader } from "./intelligence-context-loader";

export interface ProductionRuntimeComponents { runtime: ProductionAtlasRuntime; worker: ProductionWorkflowWorker; }

export interface ProductionRuntimeOptions {
  enabled: boolean;
  workflowSkillMap?: WorkflowSkillMap;
  intelligenceContextLoader?: ProductionIntelligenceContextLoader;
}

export function createProductionRuntime(components: {
  runtimeStore: RuntimeStore;
  jobStore: JobStore;
  queue: RuntimeJobQueue;
  skills: AgentSkill[];
  intelligence?: ProductionRuntimeOptions;
}): ProductionRuntimeComponents {
  const intelligence = components.intelligence;
  const orchestrator = intelligence?.enabled
    ? new IntelligenceAwareOrchestrator(components.skills, intelligence.workflowSkillMap)
    : new AtlasOrchestrator(components.skills);
  const runtime = new ProductionAtlasRuntime(components.runtimeStore, components.queue, orchestrator);
  const worker = new ProductionWorkflowWorker(components.jobStore, runtime, intelligence?.enabled ? intelligence.intelligenceContextLoader : undefined);
  return { runtime, worker };
}
