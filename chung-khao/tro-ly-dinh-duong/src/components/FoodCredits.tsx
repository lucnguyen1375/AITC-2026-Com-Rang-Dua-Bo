import { foodImages } from '../data/foodImages';
import { foods } from '../data/foods';
export function FoodCredits() {
 return <details className="source-details food-credits"><summary>Nguồn ảnh minh họa món ăn</summary><p>Ảnh từ Wikimedia Commons, thu nhỏ và cắt khung khi hiển thị. Ảnh không dùng để tính dinh dưỡng hoặc xác định khẩu phần.</p>{foods.map(food => {const image=foodImages[food.id];return image && <p key={food.id}><a href={image.source} target="_blank" rel="noreferrer">{food.name}</a> · {image.author} · {image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a> : image.license}</p>;})}</details>;
}
