import { CreativeExecutionLoop } from "./creative-execution-loop";
import { AnalyticsRunner, ApprovalRunner, DistributionRunner, ProductionRunner, QARunner, TestingRunner, type ApprovalGate, type ArtifactProducer, type ArtifactValidator, type MetricsProvider, type Publisher, type TestPlanner } from "./default-stage-runners";

export interface ExecutionDependencies {
  producer: ArtifactProducer;
  validator: ArtifactValidator;
  approval: ApprovalGate;
  publisher: Publisher;
  testPlanner: TestPlanner;
  metrics: MetricsProvider;
}

export function createCreativeExecutionLoop(deps: ExecutionDependencies): CreativeExecutionLoop {
  return new CreativeExecutionLoop([
    new ProductionRunner(deps.producer),
    new QARunner(deps.validator),
    new ApprovalRunner(deps.approval),
    new DistributionRunner(deps.publisher),
    new TestingRunner(deps.testPlanner),
    new AnalyticsRunner(deps.metrics),
  ]);
}
