import type { DailyPlan, MealAnalysis, NutritionValues, UserProfile } from '../types';
import { foods, zero } from '../data/foods';

export const goalLabels = { gainMuscle: 'Tăng cơ', loseFat: 'Giảm mỡ', maintain: 'Giữ thể trạng' };
export const nutritionDisclaimer = 'Thông tin dinh dưỡng chỉ để tham khảo, không hoàn toàn chính xác. Giá trị thay đổi theo nguyên liệu, khẩu phần và cách chế biến; dữ liệu hiện tại chưa kiểm chứng, không thay thế tư vấn chuyên gia.';
export type MealAlignment = { status: 'aligned' | 'review' | 'unknown'; title: string; message: string };
export function assessMeal(analysis: MealAnalysis, profile?: UserProfile, plan?: DailyPlan, logged: NutritionValues = zero()): MealAlignment {
 if (!profile || !plan) return { status: 'unknown', title: 'Chưa có kế hoạch để đối chiếu', message: 'Tạo hồ sơ và chọn ngày để xem bữa ăn hỗ trợ mục tiêu của bạn như thế nào.' };
 if (!analysis.isComplete) return { status: 'unknown', title: 'Cần xác nhận khẩu phần', message: 'Bổ sung khối lượng và cách chế biến của tất cả thành phần trước khi đánh giá mức phù hợp.' };
 const total = analysis.knownTotal;
 if (total.caloriesKcal + logged.caloriesKcal > plan.targetMax.caloriesKcal) return { status: 'review', title: 'Cần xem lại tổng ngày', message: 'Bữa này cùng nhật ký đã vượt khoảng năng lượng tham khảo. Kiểm tra khẩu phần và dầu/sốt; tiếp tục ăn đều, không bỏ bữa hoặc tập bù.' };
 const lean = analysis.items.some(item => {
  const food = foods.find(food => food.id === item.id);
  return food && item.nutrition && item.nutrition.proteinG >= 10 && food.values.proteinG >= 15 && food.values.fatG <= 8;
 });
 const hasVegetables = analysis.items.some(item => item.id === 'vegetable' && (item.grams ?? 0) >= 80);
 const hasCarbs = total.carbG >= 20;
 // Heuristics for a meal, not a clinical score or a conclusion about the whole day.
 const enoughProtein = total.proteinG >= plan.targetMin.proteinG * 0.15;
 const aligned = profile.goal === 'gainMuscle' ? lean && enoughProtein : profile.goal === 'loseFat' ? lean && enoughProtein && hasVegetables : enoughProtein && hasVegetables && hasCarbs;
 if (!aligned) return { status: 'review', title: `Đối chiếu mục tiêu ${goalLabels[profile.goal].toLocaleLowerCase('vi')}`, message: profile.goal === 'gainMuscle' ? 'Có thể bổ sung nguồn đạm ít béo như ức gà hoặc cá hấp, rồi cân đối với các bữa còn lại trong ngày.' : 'Có thể kết hợp chất đạm, rau và bột đường theo khẩu phần phù hợp; đối chiếu tổng ngày trước khi điều chỉnh.' };
 return { status: 'aligned', title: `Hỗ trợ mục tiêu ${goalLabels[profile.goal].toLocaleLowerCase('vi')}`, message: profile.goal === 'gainMuscle' ? `Lựa chọn tốt cho kế hoạch tăng cơ! Bữa này có nguồn đạm ít béo và khoảng ${Math.round(total.proteinG)} g đạm, góp phần vào mục tiêu ${Math.round(plan.targetMin.proteinG)} g/ngày. Cứ duy trì từng bữa như vậy nhé.` : profile.goal === 'loseFat' ? 'Bạn đang chọn bữa có đạm ít béo và rau, phù hợp hướng kế hoạch giảm mỡ. Một bước tiến đáng ghi nhận; hãy duy trì các bữa đều đặn nhé.' : 'Bữa này kết hợp đạm, rau và bột đường trong khoảng năng lượng còn lại. Bạn đang chăm sóc nhịp ăn rất tốt!' };
}
