import type { UserProfile, DailyPlan, MealAnalysis, ChatPlanContext, PlanUpdate } from '../types';
import { validPlanUpdate } from './planUpdates';
import { foodItem, foods } from '../data/foods';
import { recalculateMeal } from './nutrition';
import { safetyResponse } from './chat';
import { assessMeal } from './mealAlignment';
import { mealPhotoForAnalysis } from './storage';
export { createPlan, recalculateMeal } from './nutrition';
export const assistantMode: 'demo' | 'api' = 'api';

export type ChatProfileField = 'age' | 'sex' | 'height' | 'weight' | 'goal' | 'training_type' | 'intensity' | 'sessions' | 'schedule';
export type ChatMessage = { role: 'user' | 'assistant'; text: string; image?: string };
export type ChatProfileAnswers = Partial<Record<ChatProfileField, string>>;
export type ChatReply = { reply: string; profile_request?: ChatProfileField[]; plan_updates?: PlanUpdate[] };

const profileFieldSet = new Set<ChatProfileField>(['age', 'sex', 'height', 'weight', 'goal', 'training_type', 'intensity', 'sessions', 'schedule']);

/** Adapt local conversation JSON to the integrated AI endpoint. */
export async function requestNutritionChat(messages: ChatMessage[], profile?: UserProfile, profileAnswers?: ChatProfileAnswers, planContext?: ChatPlanContext, signal?: AbortSignal): Promise<ChatReply> {
 const context = profile ? [{ role: 'assistant' as const, content: `Hồ sơ dinh dưỡng do người dùng khai báo trong ứng dụng (JSON): ${JSON.stringify(profile)}` }] : [];
 const recent = messages
  .filter(message => message.text.trim() || message.image)
  .slice(-(80 - context.length))
  .map(message => ({ role: message.role, text: message.text || 'Ước lượng dinh dưỡng bữa ăn trong ảnh này.', image: message === messages.at(-1) && message.role === 'user' ? message.image : undefined }));
 const conversation: { role: 'user' | 'assistant'; content: string; image?: string }[] = [];
 let remainingChars = 28000;
 for (let index = recent.length - 1; index >= 0 && remainingChars > 0; index--) {
  const message = recent[index];
  const limit = message.role === 'user' ? 4000 : 20000;
  const content = message.text.slice(-Math.min(limit, remainingChars));
  conversation.unshift({ role: message.role, content, ...(message.image ? { image: message.image } : {}) });
  remainingChars -= content.length;
 }
 const payload: { messages: typeof conversation; profile_answers?: ChatProfileAnswers; plan_context?: ChatPlanContext } = { messages: [...context, ...conversation] };
 if (planContext) payload.plan_context = planContext;
 if (profileAnswers) {
  payload.profile_answers = Object.fromEntries(
   Object.entries(profileAnswers).filter(([field, value]) => profileFieldSet.has(field as ChatProfileField) && typeof value === 'string' && value.trim()),
  ) as ChatProfileAnswers;
 }

 let response: Response;
 try {
  response = await fetch('/api/chat', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(payload),
   signal,
  });
 } catch {
  throw new Error('Không kết nối được Vi. Hãy kiểm tra kết nối ứng dụng rồi thử lại.');
 }
 let result: unknown;
 try { result = await response.json(); }
 catch { throw new Error('Máy chủ chat trả về dữ liệu không hợp lệ. Hãy thử lại.'); }
 if (!response.ok) {
  const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
   ? result.error
   : 'Chưa kết nối được trợ lý dinh dưỡng. Hãy thử lại.';
  throw new Error(message);
 }
 if (!result || typeof result !== 'object' || !('reply' in result) || typeof result.reply !== 'string') {
  throw new Error('Máy chủ chat trả về dữ liệu không hợp lệ. Hãy thử lại.');
 }
 const requested = 'profile_request' in result && Array.isArray(result.profile_request)
  ? result.profile_request.filter((field): field is ChatProfileField => typeof field === 'string' && profileFieldSet.has(field as ChatProfileField))
  : undefined;
 const updates = 'plan_updates' in result ? result.plan_updates : undefined;
 if (updates !== undefined && (!Array.isArray(updates) || updates.length > 14 || !updates.every(validPlanUpdate))) throw new Error('Trợ lý trả về thay đổi checklist không hợp lệ. Hãy thử lại.');
 return { reply: result.reply, profile_request: requested, plan_updates: updates as PlanUpdate[] | undefined };
}

export async function analyzeMeal(input: { description: string; image?: File; profile?: UserProfile; plan?: DailyPlan }): Promise<MealAnalysis> {
 if (!input.image && !input.description.trim()) throw new Error('Chụp ảnh hoặc mô tả thành phần bữa ăn để tiếp tục.');
 const safety = safetyResponse(input.description);
 if (safety) throw new Error(safety);
 if (input.image) {
  const image_data_url = await mealPhotoForAnalysis(input.image);
  let response: Response;
  try {
   response = await fetch('/api/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_data_url, description: input.description.trim() }),
   });
  } catch {
   throw new Error('Không kết nối được dịch vụ phân tích ảnh. Bạn có thể mô tả món bằng tay rồi thử lại.');
  }
  let result: unknown;
  try { result = await response.json(); }
  catch { throw new Error('Dịch vụ phân tích ảnh trả về dữ liệu không hợp lệ. Hãy thử lại.'); }
  if (!response.ok) {
   const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
    ? result.error
    : 'Chưa phân tích được ảnh. Hãy thử lại hoặc nhập món bằng tay.';
   throw new Error(message);
  }
  if (!result || typeof result !== 'object' || !('items' in result) || !Array.isArray(result.items) || !('unknown_items' in result) || !Array.isArray(result.unknown_items)) {
   throw new Error('Dịch vụ phân tích ảnh trả về dữ liệu không hợp lệ. Hãy thử lại.');
  }
  const estimateItems = result.items.filter((item): item is { food_id: string; grams: number } =>
   !!item && typeof item === 'object' && 'food_id' in item && typeof item.food_id === 'string' &&
   foods.some(food => food.id === item.food_id) && 'grams' in item && typeof item.grams === 'number' &&
   Number.isInteger(item.grams) && item.grams > 0 && item.grams <= 3000,
  );
  if (estimateItems.length !== result.items.length) throw new Error('Kết quả nhận diện ảnh không hợp lệ. Hãy thử lại.');
  const unknownItems = result.unknown_items.filter((item): item is string => typeof item === 'string' && !!item.trim()).slice(0, 12);
  const photoAnalysis = recalculateMeal(estimateItems.map(item => foodItem(item.food_id, item.grams)));
  photoAnalysis.mode = 'api';
  photoAnalysis.unmatchedItems = unknownItems;
  photoAnalysis.assumptions.push('Tên món và khẩu phần được AI ước tính từ ảnh; bạn cần kiểm tra, sửa khối lượng và bổ sung dầu hoặc sốt trước khi ghi.');
  photoAnalysis.assumptions.push('Macro được tính từ bộ giá trị thực phẩm minh họa chưa kiểm chứng của ứng dụng, không phải AI đo trực tiếp từ ảnh.');
  if (input.profile && input.plan) photoAnalysis.advice.push(assessMeal(photoAnalysis, input.profile, input.plan).message);
  return photoAnalysis;
 }
 const text = input.description.toLocaleLowerCase('vi');
 const matches = foods.filter(food => text.includes(food.name.toLocaleLowerCase('vi')));
 const result = recalculateMeal(matches.map(food => foodItem(food.id, null)));
 if (!matches.length) result.advice = ['Chưa đủ thông tin để ước lượng. Hãy chọn thực phẩm và nhập khối lượng ở bên dưới.'];
 if (input.image) result.assumptions.push('Ảnh chỉ được xem trước trên thiết bị; chưa phân tích ảnh bằng AI.');
 if (input.profile && input.plan) result.advice.push(assessMeal(result, input.profile, input.plan).message);
 return result;
}
