import type { NutritionValues, FoodItem, MealAnalysis, UserProfile, DailyPlan } from '../types';
import { foodItem, zero } from '../data/foods';
import { sources } from '../data/sources';
export const keys: (keyof NutritionValues)[] = ['caloriesKcal','proteinG','carbG','fatG'];
export function sumNutrition(values: NutritionValues[]) { return values.reduce((sum, value) => { keys.forEach(key => sum[key] += value[key]); return sum; }, zero()); }
export function recalculateMeal(items: FoodItem[]): MealAnalysis {
 return { items, knownTotal: sumNutrition(items.flatMap(i => i.nutrition ? [i.nutrition] : [])), isComplete: items.length > 0 && items.every(i => i.nutrition !== null), assumptions: ['Dữ liệu cục bộ chưa kiểm chứng; khối lượng cần bạn xác nhận.', 'Dầu và nước sốt chỉ được tính khi bạn thêm thành phần tương ứng.'], followUpQuestions: ['Bữa ăn có thêm dầu hoặc nước sốt không?'], advice: ['Đối chiếu cả nhật ký của ngày; một bữa chưa phản ánh tổng lượng ăn.'], sources: sources.filter(s => s.id === 'food-demo'), mode: 'demo' };
}
export async function createPlan(profile: UserProfile): Promise<DailyPlan[]> {
 if (profile.age < 18) throw new Error('Người dưới 18 tuổi cần chuyên gia hướng dẫn; bản thử nghiệm không tạo kế hoạch tự động.');
 if (![profile.age, profile.weightKg, profile.heightCm].every(n => Number.isFinite(n) && n > 0)) throw new Error('Kiểm tra lại các chỉ số thể trạng.');
 return profile.weekSchedule.map(day => {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  const factor = day.isRestDay ? 1.4 : profile.trainingIntensity === 'Cao' ? 1.7 : 1.55;
  const adjust = profile.goal === 'gainMuscle' ? 150 : profile.goal === 'loseFat' ? -150 : 0;
  const target = (sex: number): NutritionValues => { const caloriesKcal = Math.round(((base+sex)*factor+adjust)/10)*10; const proteinG = Math.round(profile.weightKg*1.6); const fatG = Math.round(caloriesKcal*0.25/9); return {caloriesKcal,proteinG,fatG,carbG:(caloriesKcal-4*proteinG-9*fatG)/4}; };
  const menu = [ {name:'Bữa sáng',items:[foodItem('sweetpotato',200),foodItem('egg',100),foodItem('milk',200)]}, {name:'Bữa trưa',items:[foodItem('rice',250),foodItem('chicken',150),foodItem('vegetable',150),foodItem('oil',10)]}, {name:'Bữa tối',items:[foodItem('rice',200),foodItem('fish',150),foodItem('tofu',100),foodItem('vegetable',150)]}, {name:'Bữa phụ',items:[foodItem('banana',120),foodItem('peanut',25)]} ];
  return { weekday: day.weekday, targetMin: target(profile.sex === 'male' ? 5 : -161), targetMax: target(profile.sex === 'female' ? -161 : 5), suggestedMeals: menu.map(meal => ({...meal,total:sumNutrition(meal.items.map(i => i.nutrition!))})), trainingAdvice: day.isRestDay ? ['Ngày nghỉ vẫn cần ăn đủ bữa và duy trì chất đạm.'] : [`Trước ${day.startTime}: ăn bữa dễ tiêu trước buổi tập khoảng 1–2 giờ; điều chỉnh theo cảm giác của bạn.`, 'Sau buổi tập: kết hợp chất đạm và chất bột đường trong bữa kế tiếp.'], assumptions: [`Hệ số vận động ${factor}: giả định của bản thử nghiệm, chưa kiểm chứng cho cá nhân.`, 'Chọn đạm 1,6 g/kg, béo 25% năng lượng; điều chỉnh mục tiêu ±150 kcal là giả định sơ bộ.', 'Thực đơn là cấu trúc tham khảo, tổng thực phẩm chưa được tối ưu để khớp mục tiêu.'], sources, mode:'demo' };
 });
}
