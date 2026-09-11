import { describe, expect, it } from "vitest";
import { assertTenantAccess, requireTenantScope } from "./tenant-authorization";

describe("tenant authorization", () => {
  it("accepts a principal for the same organization and project", () => {
    expect(() => assertTenantAccess(
      { organizationId: "org-1", projectId: "project-1" },
      { organizationId: "org-1", projectIds: ["project-1", "project-2"] },
    )).not.toThrow();
  });

  it("rejects cross-organization access", () => {
    expect(() => assertTenantAccess(
      { organizationId: "org-2" },
      { organizationId: "org-1" },
    )).toThrow("organization mismatch");
  });

  it("rejects projects outside the principal scope", () => {
    expect(() => assertTenantAccess(
      { organizationId: "org-1", projectId: "project-3" },
      { organizationId: "org-1", projectIds: ["project-1"] },
    )).toThrow("project mismatch");
  });

  it("requires non-empty tenant identifiers", () => {
    expect(() => requireTenantScope({ organizationId: "" })).toThrow("Organization scope is required");
    expect(() => requireTenantScope({ organizationId: "org-1", projectId: " " })).toThrow("Project scope cannot be empty");
  });
});
