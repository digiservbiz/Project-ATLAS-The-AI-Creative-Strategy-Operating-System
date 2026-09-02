import { describe, expect, it } from "vitest";
import type { AgentSkill } from "@atlas/orchestrator";
import { createProductionRuntime } from "./production-runtime-factory";

function components() {
  const runtimeStore = {
    save: async () => undefined,
    get: async () => undefined,
  } as any;
  const jobStore = {
    enqueue: async () => "job-1",
    claim: async () => null,
    complete: async () => undefined,
    fail: async () => undefined,
    recoverExpiredLeases: async () => 0,
  } as any;
  const queue = { enqueue: async () => undefined } as any;
  const skills: AgentSkill[] = [];
  return { runtimeStore, jobStore, queue, skills };
}

describe("createProductionRuntime", () => {
  it("accepts intelligence context loading as part of production composition", () => {
    const loader = { enrich: async (context: any) => context };
    const result = createProductionRuntime({
      ...components(),
      intelligence: { enabled: true, intelligenceContextLoader: loader },
    });
    expect(result.runtime).toBeDefined();
    expect(result.worker).toBeDefined();
  });

  it("preserves the non-intelligence runtime path", () => {
    const result = createProductionRuntime({ ...components(), intelligence: { enabled: false } });
    expect(result.runtime).toBeDefined();
    expect(result.worker).toBeDefined();
  });
});
