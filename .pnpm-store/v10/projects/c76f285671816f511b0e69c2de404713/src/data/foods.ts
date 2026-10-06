import type { NutritionValues, FoodItem } from '../types';
export type Food = { id: string; name: string; preparation: string; values: NutritionValues };
// Prototype values, deliberately not presented as a verified composition database.
export const foods: Food[] = [
  { id: 'rice', name: 'Cơm trắng', preparation: 'Đã nấu chín', values: { caloriesKcal: 130, proteinG: 2.7, carbG: 28.2, fatG: 0.3 } },
  { id: 'chicken', name: 'Ức gà', preparation: 'Luộc, bỏ da', values: { caloriesKcal: 165, proteinG: 31, carbG: 0, fatG: 3.6 } },
  { id: 'beef', name: 'Thịt bò', preparation: 'Nấu chín, phần nạc', values: { caloriesKcal: 217, proteinG: 26, carbG: 0, fatG: 12 } },
  { id: 'egg', name: 'Trứng gà', preparation: 'Luộc, phần ăn được', values: { caloriesKcal: 155, proteinG: 13, carbG: 1.1, fatG: 11 } },
  { id: 'fish', name: 'Cá', preparation: 'Hấp, phần thịt', values: { caloriesKcal: 128, proteinG: 26, carbG: 0, fatG: 2.7 } },
  { id: 'tofu', name: 'Đậu phụ', preparation: 'Chưa chiên', values: { caloriesKcal: 76, proteinG: 8, carbG: 1.9, fatG: 4.8 } },
  { id: 'vegetable', name: 'Rau xanh', preparation: 'Luộc', values: { caloriesKcal: 35, proteinG: 2.4, carbG: 7.2, fatG: 0.4 } },
  { id: 'banana', name: 'Chuối', preparation: 'Bỏ vỏ', values: { caloriesKcal: 89, proteinG: 1.1, carbG: 22.8, fatG: 0.3 } },
  { id: 'milk', name: 'Sữa tươi', preparation: 'Nguyên chất, quy đổi theo g', values: { caloriesKcal: 61, proteinG: 3.2, carbG: 4.8, fatG: 3.3 } },
  { id: 'sweetpotato', name: 'Khoai lang', preparation: 'Luộc, bỏ vỏ', values: { caloriesKcal: 76, proteinG: 1.4, carbG: 17.7, fatG: 0.1 } },
  { id: 'peanut', name: 'Lạc', preparation: 'Rang, bỏ vỏ', values: { caloriesKcal: 587, proteinG: 24.4, carbG: 21.3, fatG: 49.7 } },
  { id: 'oil', name: 'Dầu ăn', preparation: 'Lượng thực sự ăn', values: { caloriesKcal: 884, proteinG: 0, carbG: 0, fatG: 100 } },
];
export const zero = (): NutritionValues => ({ caloriesKcal: 0, proteinG: 0, carbG: 0, fatG: 0 });
export function foodItem(id: string, grams: number | null): FoodItem {
  const food = foods.find(f => f.id === id);
  return { id, name: food?.name ?? 'Thành phần chưa rõ', grams, preparation: food?.preparation ?? 'Chưa rõ', nutrition: food && grams !== null && Number.isFinite(grams) && grams > 0 ? Object.fromEntries(Object.entries(food.values).map(([key, value]) => [key, value * grams / 100])) as NutritionValues : null, sourceIds: ['food-demo'], estimated: true, missingInfo: food && grams !== null && grams > 0 ? [] : ['Cần xác nhận thực phẩm và khối lượng'] };
}
