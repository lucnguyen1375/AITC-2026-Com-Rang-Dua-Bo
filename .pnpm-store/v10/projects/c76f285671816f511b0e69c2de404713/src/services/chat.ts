import type { UserProfile, DailyPlan, NutritionValues } from '../types';
import { recalculateMeal } from './nutrition';
import { assessMeal, nutritionDisclaimer } from './mealAlignment';
import { foods, foodItem } from '../data/foods';
import { format } from '../components/MacroSummary';
export function safetyResponse(text:string):string|null{
 if(/đau ngực|khó thở|ngất|bất tỉnh/i.test(text))return 'Đau ngực, khó thở hoặc ngất khi tập có thể nguy hiểm. Dừng tập, nhờ người hỗ trợ và liên hệ cơ sở y tế; nếu đang có triệu chứng nặng hãy gọi 115. Mình không thể đánh giá cấp cứu qua chat.';
 if(/bỏ thuốc|ngừng thuốc|kê đơn|chữa bệnh|điều trị|tiểu đường|bệnh thận/i.test(text))return 'Mình không chẩn đoán, kê đơn hoặc hướng dẫn ngừng thuốc. Với bệnh lý hay điều trị, hãy hỏi bác sĩ/chuyên gia dinh dưỡng trước khi thay đổi chế độ ăn. Bản demo chỉ hỗ trợ thông tin dinh dưỡng tham khảo.';
 return null;
}
export function answerFoodQuestion(text:string, context?: {profile?:UserProfile;plan?:DailyPlan;logged?:NutritionValues}):string{
 const safety=safetyResponse(text);if(safety)return safety;
 const food=foods.find(f=>text.toLocaleLowerCase('vi').includes(f.name.toLocaleLowerCase('vi')));
 if(food){const match=text.match(/(\d+(?:[.,]\d+)?)\s*(?:g\b|gram)/i);const grams=match?Number(match[1].replace(',','.')):100;if(grams<=0||grams>3000)return 'Hãy nhập khẩu phần từ 1 đến 3.000 g để tính tham khảo.';const item=foodItem(food.id,grams);const values=item.nutrition!;const alignment=assessMeal(recalculateMeal([item]),context?.profile,context?.plan,context?.logged);return `${food.name}, ${food.preparation.toLocaleLowerCase('vi')}, ${grams} g: khoảng ${format(values.caloriesKcal)} kcal; đạm ${format(values.proteinG)} g, bột đường ${format(values.carbG)} g, béo ${format(values.fatG)} g. ${nutritionDisclaimer} ${context?.plan ? `Nếu dùng khẩu phần này: ${alignment.message}` : 'Tạo kế hoạch để đối chiếu món ăn với mục tiêu của bạn.'} Đây là phản hồi mô phỏng, chưa gọi AI. Nếu muốn lưu vào nhật ký, chọn “Ghi bữa ăn”.`;}
 if(/ảnh|chụp/i.test(text))return 'Bạn có thể đính kèm ảnh để xem trước và mô tả các thành phần. Bản demo chưa nhận diện ảnh; mình cần bạn xác nhận tên món và gram trong màn Bữa ăn.';
 if(/trước.*tập|sau.*tập/i.test(text))return 'Bạn có thể dùng bữa dễ tiêu trước buổi tập khoảng 1–2 giờ và kết hợp chất đạm với bột đường trong bữa sau tập. Đây là gợi ý sơ bộ; điều chỉnh theo khả năng và cảm giác, không cần tập bù hoặc bỏ bữa.';
 return 'Mình đang ở chế độ mô phỏng, chưa có AI hỏi đáp tự do. Bạn có thể hỏi các thực phẩm trong danh sách như “Ức gà 150 g có bao nhiêu calo?”, xem kế hoạch hoặc ghi bữa với khẩu phần bạn xác nhận.';
}
