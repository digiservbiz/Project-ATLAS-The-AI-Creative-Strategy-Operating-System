import { runDemo } from "./index.js";

const run = await runDemo();

console.log(JSON.stringify({
  runId: run.summary.runId,
  status: run.summary.status,
  stages: run.summary.stages,
  artifacts: {
    generated: run.summary.artifactCount,
    persisted: run.summary.persistedArtifactCount,
  },
  nextActions: run.summary.nextActions,
  failures: run.summary.failures,
}, null, 2));
