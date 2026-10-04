import { describe, expect, it } from "vitest";
import { InMemoryWorkflowEventStore, event } from "./events.js";

describe("workflow events", () => {
  it("preserves tenant scope and rejects duplicate event ids", async () => {
    const store = new InMemoryWorkflowEventStore();
    const first = event("run-1", "org-1", "project-1", "run_created");
    await store.append(first);
    await expect(store.append(first)).rejects.toThrow("WORKFLOW_EVENT_ALREADY_EXISTS");
    expect((await store.list("run-1", { organizationId: "org-1", projectId: "project-1" })).length).toBe(1);
    expect(await store.list("run-1", { organizationId: "org-2", projectId: "project-1" })).toEqual([]);
  });
});
