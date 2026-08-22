import type { CreativeGenerationRequest, CreativeGenerationResult, CreativeProviderRouter } from "./provider";

export interface CreativeJobStore {
  save(job: CreativeJob): Promise<void>;
  get(jobId: string): Promise<CreativeJob | undefined>;
}

export interface CreativeJob {
  id: string;
  status: CreativeGenerationResult["status"];
  request: CreativeGenerationRequest;
  result?: CreativeGenerationResult;
  createdAt: string;
  updatedAt: string;
}

export class CreativeJobOrchestrator {
  constructor(private readonly router: CreativeProviderRouter, private readonly store: CreativeJobStore) {}

  async submit(request: CreativeGenerationRequest): Promise<CreativeJob> {
    const now = new Date().toISOString();
    const job: CreativeJob = { id: request.jobId, status: "queued", request, createdAt: now, updatedAt: now };
    await this.store.save(job);
    try {
      job.status = "processing";
      job.updatedAt = new Date().toISOString();
      await this.store.save(job);
      const result = await this.router.generate(request);
      job.result = result;
      job.status = result.status;
      job.updatedAt = new Date().toISOString();
      await this.store.save(job);
      return job;
    } catch (error) {
      job.status = "failed";
      job.result = { jobId: request.jobId, status: "failed", error: error instanceof Error ? error.message : String(error) };
      job.updatedAt = new Date().toISOString();
      await this.store.save(job);
      return job;
    }
  }
}
