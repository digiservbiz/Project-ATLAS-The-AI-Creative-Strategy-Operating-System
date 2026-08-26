export type ReadinessArea = "code" | "configuration" | "credentials" | "infrastructure" | "observability" | "security" | "testing" | "external-validation";

export interface ReadinessCheck { id: string; area: ReadinessArea; required: boolean; satisfied: boolean; evidence?: string; }

export interface ReadinessReport { ready: boolean; score: number; checks: ReadinessCheck[]; blockers: string[]; }

/**
 * Production readiness is deliberately explicit: code presence never implies
 * that external credentials, infrastructure, endpoints or security controls exist.
 */
export function buildReadinessReport(checks: ReadinessCheck[]): ReadinessReport {
  const required = checks.filter((c) => c.required);
  const satisfied = required.filter((c) => c.satisfied);
  const blockers = required.filter((c) => !c.satisfied).map((c) => `${c.area}:${c.id}`);
  return { ready: blockers.length === 0, score: required.length ? satisfied.length / required.length : 0, checks, blockers };
}
