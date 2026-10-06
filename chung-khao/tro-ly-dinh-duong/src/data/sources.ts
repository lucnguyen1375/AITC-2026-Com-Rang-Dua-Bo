import type { NutritionSource } from '../types';
export const sources: NutritionSource[] = [
 { id: 'mifflin', title: 'Mifflin và cộng sự (1990)', url: 'https://doi.org/10.1093/ajcn/51.2.241', locator: 'Công thức ước lượng năng lượng nghỉ ở người trưởng thành', status: 'verified' },
 { id: 'protein', title: 'Jäger và cộng sự — ISSN (2017)', url: 'https://doi.org/10.1186/s12970-017-0177-8', locator: 'Khoảng chất đạm tham khảo: 1,4–2,0 g/kg/ngày', status: 'verified' },
 { id: 'food-demo', title: 'Bộ giá trị thực phẩm của bản thử nghiệm', locator: 'Giá trị minh họa trên 100 g phần ăn được; chưa đối chiếu bảng thực phẩm công khai. Không phải số liệu chính thức.', status: 'unverified' },
];
