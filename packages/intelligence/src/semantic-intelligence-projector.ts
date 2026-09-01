import type { SemanticIntelligenceService } from "@atlas/semantic-intelligence";
import type { IntelligenceEntityType, PersistenceEnvelope } from "./persistence-contract";

const objectTypes: Record<IntelligenceEntityType, string> = {
  strategic_state: "memory",
  decision: "research_finding",
  hypothesis: "research_finding",
  experiment: "campaign",
  learning: "memory",
  creative_dna: "creative",
  audience: "customer_problem",
};

export interface IntelligenceSemanticProjection {
  organizationId: string;
  projectId: string;
  sourceId: string;
  businessId: string;
}

export async function projectIntelligenceToSemantic(
  service: SemanticIntelligenceService,
  record: PersistenceEnvelope,
  scope: IntelligenceSemanticProjection,
): Promise<void> {
  await service.index({
    id: `intelligence:${record.entityType}:${record.id}`,
    organizationId: scope.organizationId,
    projectId: scope.projectId,
    objectType: objectTypes[record.entityType] as never,
    sourceId: scope.sourceId,
    content: JSON.stringify({
      businessId: scope.businessId,
      entityType: record.entityType,
      id: record.id,
      version: record.version,
      data: record.data,
      evidenceIds: record.evidenceIds,
    }),
    metadata: {
      businessId: scope.businessId,
      entityType: record.entityType,
      recordId: record.id,
      version: record.version,
      evidenceIds: record.evidenceIds,
    },
    createdAt: record.createdAt,
  });
}
