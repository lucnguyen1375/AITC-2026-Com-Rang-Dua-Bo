import { ShieldCheck } from 'lucide-react';
import { FoodCredits } from './FoodCredits';
export function SafetyNotice() { return <><div className="safety"><ShieldCheck size={18} aria-hidden="true"/><p>Chỉ để tham khảo, không thay bác sĩ hoặc chuyên gia dinh dưỡng; không chẩn đoán, kê đơn hay hướng dẫn ngừng thuốc. Ước lượng có giới hạn. Dữ liệu và ảnh được lưu trên thiết bị; dùng chức năng xóa dữ liệu khi muốn làm mới.</p></div><FoodCredits/></>; }
