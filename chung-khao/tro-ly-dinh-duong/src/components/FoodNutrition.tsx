import type { NutritionValues } from '../types';
export function FoodNutrition({ values }: { values: NutritionValues }) {
 const number = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
 return <dl className="food-nutrition">{(['caloriesKcal', 'proteinG', 'carbG', 'fatG'] as const).map((key, i) => <div key={key}><dt>{['Năng lượng', 'Đạm', 'Bột đường', 'Béo'][i]}</dt><dd>{number(values[key])}<span> {i === 0 ? 'kcal' : 'g'}</span></dd></div>)}</dl>;
}
