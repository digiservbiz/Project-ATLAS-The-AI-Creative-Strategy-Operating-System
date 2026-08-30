import type { IntelligenceEntityType, IntelligenceRepository, PersistenceEnvelope } from "./persistence-contract";
import { assertBusinessScope } from "./persistence-contract";

export class InMemoryIntelligenceRepository implements IntelligenceRepository {
  private readonly records=new Map<string,PersistenceEnvelope>();
  async get<T>(businessId:string,entityType:IntelligenceEntityType,id:string):Promise<PersistenceEnvelope<T>|null>{const r=this.records.get(`${businessId}:${entityType}:${id}`);if(!r)return null;assertBusinessScope(r,businessId);return r as PersistenceEnvelope<T>;}
  async put<T>(record:PersistenceEnvelope<T>):Promise<void>{assertBusinessScope(record,record.businessId);this.records.set(`${record.businessId}:${record.entityType}:${record.id}`,record);}
  async list<T>(businessId:string,entityType:IntelligenceEntityType):Promise<PersistenceEnvelope<T>[]> {return [...this.records.values()].filter(r=>r.businessId===businessId&&r.entityType===entityType).map(r=>r as PersistenceEnvelope<T>);}
}
