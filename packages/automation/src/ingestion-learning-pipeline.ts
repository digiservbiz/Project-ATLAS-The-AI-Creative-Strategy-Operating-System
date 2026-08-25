export interface IngestionBatch<TMetric = unknown, TPurchase = unknown> { metrics: TMetric[]; purchases: TPurchase[]; collectedAt: string; }
export interface LearningSink<TMetric = unknown> { persist(batch: IngestionBatch<TMetric>): Promise<void>; learn(batch: IngestionBatch<TMetric>): Promise<void>; }
export interface PurchaseAttributor<TMetric = unknown, TPurchase = unknown> { attribute(metrics: TMetric[], purchases: TPurchase[]): TMetric[]; }

export class IngestionLearningPipeline<TMetric = unknown, TPurchase = unknown> {
  constructor(private readonly attributor: PurchaseAttributor<TMetric, TPurchase>, private readonly sink: LearningSink<TMetric>) {}
  async process(batch: IngestionBatch<TMetric, TPurchase>) {
    const attributed = this.attributor.attribute(batch.metrics, batch.purchases);
    const enriched = { ...batch, metrics: attributed };
    await this.sink.persist(enriched);
    await this.sink.learn(enriched);
    return enriched;
  }
}
