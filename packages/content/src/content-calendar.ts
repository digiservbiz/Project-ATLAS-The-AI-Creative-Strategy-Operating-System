import type { ContentFormat, ContentPillar, ContentPiece } from "./content-production-engine";

export interface CalendarSlot { id: string; date: string; format: ContentFormat; pillar: ContentPillar; goal: string; audience: string; status: "planned" | "produced" | "approved" | "published"; pieceId?: string; }
export interface ContentCalendarRequest { startDate: string; days: number; frequencyPerDay: number; formats: ContentFormat[]; pillars: ContentPillar[]; goal: string; audience: string; }

export class ContentCalendarService {
  plan(request: ContentCalendarRequest): CalendarSlot[] {
    if (request.days < 1 || request.frequencyPerDay < 1) throw new Error("Calendar duration and frequency must be positive");
    const slots: CalendarSlot[] = [];
    const start = new Date(`${request.startDate}T00:00:00Z`);
    for (let day = 0; day < request.days; day++) {
      const date = new Date(start); date.setUTCDate(start.getUTCDate() + day);
      for (let i = 0; i < request.frequencyPerDay; i++) {
        const format = request.formats[(day * request.frequencyPerDay + i) % request.formats.length];
        const pillar = request.pillars[(day * request.frequencyPerDay + i) % request.pillars.length];
        slots.push({ id: `slot:${day + 1}:${i + 1}`, date: date.toISOString().slice(0, 10), format, pillar, goal: request.goal, audience: request.audience, status: "planned" });
      }
    }
    return slots;
  }

  assign(slots: CalendarSlot[], pieces: ContentPiece[]): CalendarSlot[] {
    return slots.map((slot, index) => pieces[index] ? { ...slot, pieceId: pieces[index].id, status: "produced" } : slot);
  }
}
