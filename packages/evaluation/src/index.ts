export interface EvaluationCase { id: string; name: string; input: Record<string, unknown>; requiredSignals: string[]; }
export interface EvaluationResult { caseId: string; passed: boolean; score: number; missingSignals: string[]; notes: string[]; }

function containsSignal(value: unknown, signal: string): boolean {
  const text = JSON.stringify(value).toLowerCase();
  return text.includes(signal.toLowerCase());
}

export function evaluateCase(testCase: EvaluationCase, output: unknown): EvaluationResult {
  const missingSignals = testCase.requiredSignals.filter((signal) => !containsSignal(output, signal));
  const total = testCase.requiredSignals.length;
  const score = total === 0 ? 1 : (total - missingSignals.length) / total;
  return { caseId: testCase.id, passed: missingSignals.length === 0, score, missingSignals, notes: [] };
}

export const creativeStrategyBaseline: EvaluationCase[] = [
  { id: "continuity-001", name: "Hook offer LP continuity", input: { product: "wall adhesive" }, requiredSignals: ["hook", "offer", "landing page"] },
  { id: "proof-001", name: "Proof first", input: { product: "durable product" }, requiredSignals: ["proof", "demo"] },
  { id: "angles-001", name: "Multiple buyer angles", input: { product: "consumer product" }, requiredSignals: ["pain", "gifting", "status", "competitor"] },
];
