import type { StrategyBrief } from "@atlas/strategy";
import type { CreativeJob, CreativeJobStore } from "./job-orchestrator";
import { CreativeJobOrchestrator } from "./job-orchestrator";
import { StrategyCreativeBridge, type CreativePlan } from "./strategy-creative-bridge";

export interface CreativeExecutionResult { plan: CreativePlan; jobs: CreativeJob[]; }

export class StrategyCreativeExecutor {
  private readonly planner = new StrategyCreativeBridge();
  constructor(private readonly orchestrator: CreativeJobOrchestrator) {}

  async execute(strategy: StrategyBrief): Promise<CreativeExecutionResult> {
    const plan = this.planner.build(strategy);
    const jobs = await Promise.all(plan.jobs.map((request) => this.orchestrator.submit(request)));
    return { plan, jobs };
  }
}

export function createCreativeExecutor(router: ConstructorParameters<typeof CreativeJobOrchestrator>[0], store: CreativeJobStore): StrategyCreativeExecutor {
  return new StrategyCreativeExecutor(new CreativeJobOrchestrator(router, store));
}
