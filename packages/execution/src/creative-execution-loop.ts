export type ExecutionStage = "production" | "qa" | "approval" | "distribution" | "testing" | "analytics";

export interface CreativeArtifact { id: string; kind: string; content: unknown; status: "draft" | "approved" | "rejected" | "published"; }
export interface ExecutionContext { campaignId: string; artifacts: CreativeArtifact[]; metrics?: Record<string, number>; metadata?: Record<string, unknown>; }
export interface StageResult { stage: ExecutionStage; status: "completed" | "blocked" | "failed"; artifacts?: CreativeArtifact[]; reason?: string; }
export interface ExecutionStageRunner { readonly stage: ExecutionStage; run(context: ExecutionContext): Promise<StageResult>; }

export class CreativeExecutionLoop {
  constructor(private readonly runners: ExecutionStageRunner[]) {}

  async run(context: ExecutionContext): Promise<{ context: ExecutionContext; results: StageResult[] }> {
    const results: StageResult[] = [];
    const order: ExecutionStage[] = ["production", "qa", "approval", "distribution", "testing", "analytics"];

    for (const stage of order) {
      const runner = this.runners.find((item) => item.stage === stage);
      if (!runner) {
        results.push({ stage, status: "blocked", reason: `No runner registered for ${stage}` });
        break;
      }
      const result = await runner.run(context);
      results.push(result);
      if (result.artifacts?.length) context = { ...context, artifacts: [...context.artifacts, ...result.artifacts] };
      if (result.status !== "completed") break;
    }

    return { context, results };
  }
}
