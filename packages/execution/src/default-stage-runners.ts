import type { CreativeArtifact, ExecutionContext, ExecutionStageRunner, StageResult } from "./creative-execution-loop";

export interface ArtifactProducer { produce(context: ExecutionContext): Promise<CreativeArtifact[]>; }
export interface ArtifactValidator { validate(context: ExecutionContext): Promise<{ ok: boolean; reasons?: string[] }>; }
export interface ApprovalGate { request(context: ExecutionContext): Promise<"approved" | "rejected" | "pending">; }
export interface Publisher { publish(context: ExecutionContext): Promise<CreativeArtifact[]>; }
export interface TestPlanner { plan(context: ExecutionContext): Promise<CreativeArtifact[]>; }
export interface MetricsProvider { collect(context: ExecutionContext): Promise<Record<string, number>>; }

export class ProductionRunner implements ExecutionStageRunner {
  readonly stage = "production" as const;
  constructor(private readonly producer: ArtifactProducer) {}
  async run(context: ExecutionContext): Promise<StageResult> {
    const artifacts = await this.producer.produce(context);
    return { stage: this.stage, status: artifacts.length ? "completed" : "blocked", artifacts, reason: artifacts.length ? undefined : "Production produced no artifacts" };
  }
}

export class QARunner implements ExecutionStageRunner {
  readonly stage = "qa" as const;
  constructor(private readonly validator: ArtifactValidator) {}
  async run(context: ExecutionContext): Promise<StageResult> {
    const result = await this.validator.validate(context);
    return result.ok ? { stage: this.stage, status: "completed" } : { stage: this.stage, status: "blocked", reason: (result.reasons ?? ["QA validation failed"]).join("; ") };
  }
}

export class ApprovalRunner implements ExecutionStageRunner {
  readonly stage = "approval" as const;
  constructor(private readonly gate: ApprovalGate) {}
  async run(context: ExecutionContext): Promise<StageResult> {
    const decision = await this.gate.request(context);
    if (decision === "approved") return { stage: this.stage, status: "completed" };
    return { stage: this.stage, status: "blocked", reason: decision === "pending" ? "Human approval required" : "Human approval rejected" };
  }
}

export class DistributionRunner implements ExecutionStageRunner {
  readonly stage = "distribution" as const;
  constructor(private readonly publisher: Publisher) {}
  async run(context: ExecutionContext): Promise<StageResult> {
    const published = await this.publisher.publish(context);
    return { stage: this.stage, status: published.length ? "completed" : "blocked", artifacts: published, reason: published.length ? undefined : "No artifacts published" };
  }
}

export class TestingRunner implements ExecutionStageRunner {
  readonly stage = "testing" as const;
  constructor(private readonly planner: TestPlanner) {}
  async run(context: ExecutionContext): Promise<StageResult> {
    const tests = await this.planner.plan(context);
    return { stage: this.stage, status: tests.length ? "completed" : "blocked", artifacts: tests, reason: tests.length ? undefined : "No creative tests planned" };
  }
}

export class AnalyticsRunner implements ExecutionStageRunner {
  readonly stage = "analytics" as const;
  constructor(private readonly metrics: MetricsProvider) {}
  async run(context: ExecutionContext): Promise<StageResult> {
    const metrics = await this.metrics.collect(context);
    return { stage: this.stage, status: "completed", artifacts: [], };
  }
}
