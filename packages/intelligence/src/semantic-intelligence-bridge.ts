import type { Database } from "@atlas/database";
import type { PersistenceEnvelope } from "./persistence-contract";

export interface SemanticProjection { organizationId:string; projectId:string; recordId:string; entityType:string; content:string; metadata:Record<string,unknown>; sourceId:string; }

export function toSemanticProjection<T>(record:PersistenceEnvelope<T>,scope:{organizationId:string;projectId:string}):SemanticProjection { return {organizationId:scope.organizationId,projectId:scope.projectId,recordId:record.id,entityType:record.entityType,content:JSON.stringify(record.data),metadata:{businessId:record.businessId,version:record.version,evidenceIds:record.evidenceIds},sourceId:record.id}; }

export async function projectIntelligenceToSiel(database:Database,projection:SemanticProjection):Promise<void>{await database.query(`INSERT INTO semantic_objects (id,organization_id,project_id,object_type,source_id,content,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT (id) DO UPDATE SET content=EXCLUDED.content,metadata=EXCLUDED.metadata,object_type=EXCLUDED.object_type,source_id=EXCLUDED.source_id`,[projection.recordId,projection.organizationId,projection.projectId,`intelligence:${projection.entityType}`,projection.sourceId,projection.content,JSON.stringify(projection.metadata)]);}
