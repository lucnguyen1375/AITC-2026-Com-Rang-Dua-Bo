import type { ChatPlanContext, CheckIns, PlanUpdate } from '../types';

export function validPlanUpdate(value: unknown): value is PlanUpdate {
  if (!value || typeof value !== 'object') return false;
  const update = value as Record<string, unknown>;
  return typeof update.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(update.date)
    && ['nutrition', 'training'].includes(String(update.category))
    && (update.checked === undefined || typeof update.checked === 'boolean')
    && (update.note === undefined || typeof update.note === 'string' && update.note.length <= 240)
    && (typeof update.checked === 'boolean' || typeof update.note === 'string');
}

export function applyCheckInUpdates(checkIns: CheckIns, updates: PlanUpdate[], context: Pick<ChatPlanContext, 'today' | 'days'>): CheckIns {
  if (!updates.length || updates.length > 14 || updates.some(update => !validPlanUpdate(update) || update.date > context.today || !context.days.some(day => day.date === update.date))) {
    throw new Error('Chỉ cập nhật checklist hôm nay hoặc các ngày đã qua trong tuần hiện tại.');
  }
  const next = { ...checkIns };
  for (const update of updates) {
    const day = { ...(next[update.date] ?? { nutrition: false, training: false }) };
    if (update.checked !== undefined) day[update.category] = update.checked;
    if (update.note !== undefined) day[update.category === 'nutrition' ? 'nutritionNote' : 'trainingNote'] = update.note.trim();
    next[update.date] = day;
  }
  return next;
}
