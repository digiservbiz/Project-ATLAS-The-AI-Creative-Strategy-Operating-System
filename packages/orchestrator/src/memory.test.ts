import { describe, expect, it } from "vitest";
import { InMemoryAgentMemoryStore } from "./memory";

describe("InMemoryAgentMemoryStore", () => {
  it("isolates records by organization", async () => {
    const store = new InMemoryAgentMemoryStore();
    await store.put({
      id: "m1",
      organizationId: "org-1",
      namespace: "strategy",
      key: "winning-hook",
      value: { hook: "Problem → solution" },
      importance: 0.9,
      createdAt: "2026-08-20T00:00:00Z",
      updatedAt: "2026-08-20T00:00:00Z",
    });

    expect(await store.get("org-1", "strategy", "winning-hook")).not.toBeNull();
    expect(await store.get("org-2", "strategy", "winning-hook")).toBeNull();
  });

  it("filters memory by project", async () => {
    const store = new InMemoryAgentMemoryStore();
    for (const projectId of ["p1", "p2"]) {
      await store.put({
        id: projectId,
        organizationId: "org-1",
        projectId,
        namespace: "campaign",
        key: `result-${projectId}`,
        value: { roas: projectId === "p1" ? 3.1 : 1.2 },
        importance: 0.8,
        createdAt: "2026-08-20T00:00:00Z",
        updatedAt: "2026-08-20T00:00:00Z",
      });
    }
    expect((await store.list("org-1", "campaign", "p1"))).toHaveLength(1);
  });
});
