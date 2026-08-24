export type Stage = "research" | "strategy" | "creative" | "production" | "qa" | "approval" | "distribution" | "analytics" | "learning" | "memory";
export type StageStatus = "pending" | "running" | "completed" | "blocked" | "failed";
export interface PipelineStage { id: Stage; status: StageStatus; output?: unknown; error?: string; }
export interface CampaignPipelineRequest { id: string; objective: string; brandId: string; productId?: string; audience?: string; budget?: number; }
export interface CampaignPipelineState { request: CampaignPipelineRequest; stages: Record<Stage, PipelineStage>; status: "running" | "completed" | "blocked" | "failed"; }
export interface StageRunner { run(stage: Stage, context: CampaignPipelineState): Promise<unknown>; }

const ORDER: Stage[] = ["research", "strategy", "creative", "production", "qa", "approval", "distribution", "analytics", "learning", "memory"];

export class AtlasCampaignPipeline {
  constructor(private readonly runners: Partial<Record<Stage, StageRunner>>) {}

  async run(request: CampaignPipelineRequest): Promise<CampaignPipelineState> {
    const stages = Object.fromEntries(ORDER.map((id) => [id, { id, status: "pending" as StageStatus }])) as Record<Stage, PipelineStage>;
    const state: CampaignPipelineState = { request, stages, status: "running" };

    for (const id of ORDER) {
      const runner = this.runners[id];
      if (!runner) { state.stages[id] = { id, status: "blocked", error: `No runner registered for ${id}` }; state.status = "blocked"; break; }
      state.stages[id] = { id, status: "running" };
      try {
        state.stages[id] = { id, status: "completed", output: await runner.run(id, state) };
      } catch (error) {
        state.stages[id] = { id, status: "failed", error: error instanceof Error ? error.message : "Stage failed" };
        state.status = "failed";
        break;
      }
    }
    if (ORDER.every((id) => state.stages[id].status === "completed")) state.status = "completed";
    return state;
  }
}
