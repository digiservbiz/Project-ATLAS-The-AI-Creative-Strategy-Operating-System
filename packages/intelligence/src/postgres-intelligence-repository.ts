import type { Database } from "@atlas/database";
import type { IntelligenceEntityType, IntelligenceRepository, PersistenceEnvelope } from "./persistence-contract";
import { assertBusinessScope } from "./persistence-contract";

export interface IntelligencePersistenceScope { organizationId:string; projectId:string; }

type Row={id:string;business_id:string;entity_type:IntelligenceEntityType;version:number;data:unknown;evidence_ids:string[];created_at:string;updated_at:string};

export class PostgresIntelligenceRepository implements IntelligenceRepository {
  constructor(private readonly database:Database, private readonly scope:IntelligencePersistenceScope) {}

  async get<T>(businessId:string,entityType:IntelligenceEntityType,id:string):Promise<PersistenceEnvelope<T>|null>{
    const rows=await this.database.query<Row>(`SELECT id,business_id,entity_type,version,data,evidence_ids,created_at,updated_at FROM atlas_intelligence_records WHERE id=$1 AND business_id=$2 AND organization_id=$3 AND project_id=$4 AND entity_type=$5 LIMIT 1`,[id,businessId,this.scope.organizationId,this.scope.projectId,entityType]);
    return rows[0]?this.map<T>(rows[0],businessId):null;
  }

  async put<T>(record:PersistenceEnvelope<T>):Promise<void>{
    assertBusinessScope(record,record.businessId);
    await this.database.query(`INSERT INTO atlas_intelligence_records (id,business_id,organization_id,project_id,entity_type,version,data,evidence_ids,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::timestamptz,$10::timestamptz) ON CONFLICT (id) DO UPDATE SET version=EXCLUDED.version,data=EXCLUDED.data,evidence_ids=EXCLUDED.evidence_ids,updated_at=EXCLUDED.updated_at WHERE atlas_intelligence_records.business_id=EXCLUDED.business_id AND atlas_intelligence_records.organization_id=EXCLUDED.organization_id AND atlas_intelligence_records.project_id=EXCLUDED.project_id`,[record.id,record.businessId,this.scope.organizationId,this.scope.projectId,record.entityType,record.version,JSON.stringify(record.data),record.evidenceIds,record.createdAt,record.updatedAt]);
  }

  async list<T>(businessId:string,entityType:IntelligenceEntityType):Promise<PersistenceEnvelope<T>[]> { const rows=await this.database.query<Row>(`SELECT id,business_id,entity_type,version,data,evidence_ids,created_at,updated_at FROM atlas_intelligence_records WHERE business_id=$1 AND organization_id=$2 AND project_id=$3 AND entity_type=$4 ORDER BY updated_at DESC`,[businessId,this.scope.organizationId,this.scope.projectId,entityType]); return rows.map(r=>this.map<T>(r,businessId)); }

  private map<T>(r:Row,businessId:string):PersistenceEnvelope<T>{const record={id:r.id,businessId,entityType:r.entity_type,version:r.version,data:r.data as T,evidenceIds:r.evidence_ids??[],createdAt:r.created_at,updatedAt:r.updated_at};assertBusinessScope(record,businessId);return record;}
}
