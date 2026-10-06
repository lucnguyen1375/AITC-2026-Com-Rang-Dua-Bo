import type { NutritionValues } from '../types';
export const format = (value: number) => Math.round(value).toLocaleString('vi-VN');
export const macroLabels = ['Năng lượng', 'Chất đạm', 'Bột đường', 'Chất béo'];
export function MacroSummary({ values, max }: { values: NutritionValues; max?: NutritionValues }) {
 return <div className="macro-grid">{(['caloriesKcal','proteinG','carbG','fatG'] as const).map((key, i) => <div className={`macro macro-${i}`} key={key}><span>{macroLabels[i]}</span><div><strong>{format(values[key])}{max && Math.round(max[key]) !== Math.round(values[key]) ? `–${format(max[key])}` : ''}</strong><small>{i === 0 ? 'kcal' : 'g'}</small></div></div>)}</div>;
}
