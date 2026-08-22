import { describe, expect, it } from "vitest";
import { PerformanceLearningBridge } from "./memory-learning-bridge";

class FakeMemory {
  records: unknown[] = [];
  async store(_context: unknown, record: unknown) { this.records.push(record); }
}

describe("PerformanceLearningBridge", () => {
  it("stores performance observations with retrieval tags", async () => {
    const memory = new FakeMemory();
    const bridge = new PerformanceLearningBridge(memory as never);
    await bridge.record({ organizationId: "org-1" } as never, {
      organizationId: "org-1", platform: "meta", campaignId: "c1", timestamp: "2026-08-21T00:00:00Z", impressions: 1000, clicks: 20, spend: 10, conversions: 1, revenue: 40,
    }, { severity: "warning" } as never);
    expect(memory.records).toHaveLength(1);
    expect((memory.records[0] as { tags: string[] }).tags).toContain("meta");
    expect((memory.records[0] as { tags: string[] }).tags).toContain("warning");
  });
});
