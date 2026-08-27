export interface MetricsSink { increment(name: string, value?: number, tags?: Record<string,string>): void; timing(name: string, ms: number, tags?: Record<string,string>): void; }
export interface Logger { info(message: string, context?: Record<string,unknown>): void; error(message: string, context?: Record<string,unknown>): void; }

export class NoopMetricsSink implements MetricsSink { increment(_name: string, _value = 1, _tags?: Record<string,string>) {} timing(_name: string, _ms: number, _tags?: Record<string,string>) {} }
export class ConsoleLogger implements Logger {
  info(message: string, context?: Record<string,unknown>) { console.info(message, context ?? {}); }
  error(message: string, context?: Record<string,unknown>) { console.error(message, context ?? {}); }
}

export class ObservabilityTimer {
  private readonly started = Date.now();
  constructor(private readonly metrics: MetricsSink, private readonly metricName: string, private readonly tags?: Record<string,string>) {}
  stop() { this.metrics.timing(this.metricName, Date.now() - this.started, this.tags); }
}
