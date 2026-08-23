export type LoopStage = "research" | "strategy" | "creative" | "qa" | "approval" | "execution" | "performance" | "learning" | "memory";

export interface LoopContext { runId: string; productId: string; stage: LoopStage; status: "pending" | "running" | "blocked" | "completed" | "failed"; data: Record<string, unknown>; }
export interface LoopStep { stage: LoopStage; run(ctx: LoopContext): Promise<Record<string, unknown>>; }

const nextStage: Partial<Record<LoopStage, LoopStage>> = { research: "strategy", strategy: "creative", creative: "qa", qa: "approval", approval: "execution", execution: "performance", performance: "learning", learning: "memory", memory: "strategy" };

export class ClosedLoopOrchestrator {
  constructor(private readonly steps: Map<LoopStage, LoopStep>) {}

  async advance(ctx: LoopContext): Promise<LoopContext> {
    const step = this.steps.get(ctx.stage);
    if (!step) throw new Error(`No step registered for stage: ${ctx.stage}`);
    const output = await step.run({ ...ctx, status: "running" });
    const stage = nextStage[ctx.stage] ?? ctx.stage;
    return { ...ctx, stage, status: "completed", data: { ...ctx.data, [ctx.stage]: output } };
  }
}
