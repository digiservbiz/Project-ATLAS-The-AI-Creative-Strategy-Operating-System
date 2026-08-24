import type { ResearchStrategySignals } from "./research-strategy-bridge";

export interface SpecialistStrategyOutput {
  positioning: string[];
  offers: string[];
  angles: string[];
  hooks: string[];
  scripts: string[];
  creativeDirections: string[];
  confidence: number;
  evidenceIds: string[];
}

export interface SpecialistAgent<T> {
  run(input: ResearchStrategySignals): Promise<T>;
}

export class ResearchSpecialistPipeline {
  constructor(
    private readonly positioning: SpecialistAgent<string[]>,
    private readonly offer: SpecialistAgent<string[]>,
    private readonly angle: SpecialistAgent<string[]>,
    private readonly hook: SpecialistAgent<string[]>,
    private readonly script: SpecialistAgent<string[]>,
    private readonly creativeDirection: SpecialistAgent<string[]>,
  ) {}

  async run(signals: ResearchStrategySignals): Promise<SpecialistStrategyOutput> {
    const positioning = await this.positioning.run(signals);
    const enriched = { ...signals, positioning: [...signals.positioning, ...positioning] };
    const offers = await this.offer.run(enriched);
    const angles = await this.angle.run({ ...enriched, angles: [...enriched.angles, ...offers] });
    const hooks = await this.hook.run({ ...enriched, angles: [...enriched.angles, ...angles] });
    const scripts = await this.script.run({ ...enriched, hooks: [...enriched.hooks, ...hooks] });
    const creativeDirections = await this.creativeDirection.run({ ...enriched });

    return {
      positioning,
      offers,
      angles,
      hooks,
      scripts,
      creativeDirections,
      confidence: signals.confidence,
      evidenceIds: signals.evidenceIds,
    };
  }
}
