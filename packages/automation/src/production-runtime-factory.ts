import { AtlasOrchestrator, type AgentSkill } from "@atlas/orchestrator";
import { ProductionAtlasRuntime, type RuntimeJobQueue, type RuntimeStore } from "@atlas/runtime";
import { ProductionWorkflowWorker } from "./production-worker";
import type { JobStore } from "./durable-job-queue";

export interface ProductionRuntimeComponents { runtime: ProductionAtlasRuntime; worker: ProductionWorkflowWorker; }

export function createProductionRuntime(components: { runtimeStore: RuntimeStore; jobStore: JobStore; queue: RuntimeJobQueue; skills: AgentSkill[] }): ProductionRuntimeComponents {
  const orchestrator = new AtlasOrchestrator(components.skills);
  const runtime = new ProductionAtlasRuntime(components.runtimeStore, components.queue, orchestrator);
  const worker = new ProductionWorkflowWorker(components.jobStore, runtime);
  return { runtime, worker };
}
