export type ExperimentStatus = "draft" | "running" | "paused" | "completed";
export interface ExperimentVariant { id: string; name: string; creativeId: string; allocation: number; }
export interface Experiment { id: string; campaignId: string; hypothesis: string; primaryMetric: string; variants: ExperimentVariant[]; status: ExperimentStatus; startedAt?: string; endedAt?: string; }
export interface ExperimentStore { save(experiment: Experiment): Promise<void>; get(id: string): Promise<Experiment | null>; }
export interface ExperimentMetrics { variantId: string; sampleSize: number; value: number; confidence?: number; }

export class InMemoryExperimentStore implements ExperimentStore {
  private readonly items = new Map<string, Experiment>();
  async save(experiment: Experiment) { this.items.set(experiment.id, experiment); }
  async get(id: string) { return this.items.get(id) ?? null; }
}

export class ExperimentEngine {
  constructor(private readonly store: ExperimentStore) {}
  async start(experiment: Experiment): Promise<Experiment> {
    if (!experiment.variants.length) throw new Error("Experiment requires at least one variant");
    const total = experiment.variants.reduce((sum, variant) => sum + variant.allocation, 0);
    if (Math.abs(total - 1) > 0.001) throw new Error("Variant allocations must total 1");
    const running = { ...experiment, status: "running" as const, startedAt: new Date().toISOString() };
    await this.store.save(running);
    return running;
  }

  async evaluate(experimentId: string, metrics: ExperimentMetrics[]): Promise<{ winner?: ExperimentMetrics; confidence: number; recommendation: string }> {
    const experiment = await this.store.get(experimentId);
    if (!experiment) throw new Error(`Experiment not found: ${experimentId}`);
    if (!metrics.length) return { confidence: 0, recommendation: "Collect more data before making a decision." };
    const ranked = [...metrics].sort((a, b) => b.value - a.value);
    const winner = ranked[0];
    const runnerUp = ranked[1];
    const gap = runnerUp ? Math.max(0, winner.value - runnerUp.value) : winner.value;
    const confidence = Math.min(0.99, Math.max(0.1, (winner.sampleSize / Math.max(1, winner.sampleSize + (runnerUp?.sampleSize ?? 0))) + gap / Math.max(1, Math.abs(winner.value)) * 0.25));
    return { winner, confidence, recommendation: confidence >= 0.8 ? `Promote variant ${winner.variantId} and create controlled variations.` : "Keep the experiment running and collect more evidence." };
  }
}
