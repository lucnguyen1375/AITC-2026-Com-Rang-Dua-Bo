# Bữa Việt — Ăn theo nhịp tập

Ứng dụng React + TypeScript + Vite, giao diện tiếng Việt, tối ưu điện thoại và desktop.

## Chạy
```powershell
cd chung-khao/tro-ly-dinh-duong
pnpm install
pnpm dev
```
Mở địa chỉ Vite in ra. Kiểm tra: `pnpm build`. Xem bản build: `pnpm preview`.

## Chat AI
Chạy backend chat-core ở một terminal riêng trước khi mở chat:
```powershell
cd chung-khao/chat-core
python -m pip install -r requirements.txt
python app.py
```
Đặt `THUCCHIEN_API_KEY` trong `.env` ở thư mục gốc repository. Vite chuyển tiếp `/api/chat` tới backend cổng 3000. Ở môi trường triển khai, cấu hình máy chủ web chuyển tiếp cùng đường dẫn `/api/chat` tới FastAPI. Không đặt khóa API trong frontend.

## Luồng demo
1. Chat với Vi: nhập **25 tuổi, 65 kg, 170 cm**, chọn biến thể giới tính, mục tiêu, hình thức/cường độ tập và lịch. Xem đề xuất rồi chọn **Đồng ý kế hoạch**.
2. Trên PC: Sidebar → Main dinh dưỡng → nhân vật Vi 3D → Chat. Trên điện thoại, onboarding bắt đầu với Vi và chat; sau tạo kế hoạch, nội dung dinh dưỡng đứng trước, có nút quay về chat.
3. Chọn ngày ở **Kế hoạch**; mở **Cách tính và nguồn** để kiểm tra công thức và giả định.
4. Sau khi có hồ sơ, hỏi Vi trong chat để nhận tư vấn AI; khi thiếu thông tin, điền biểu mẫu bổ sung ngay trong khung chat. Ảnh chỉ xem trước; Vi không nhận diện ảnh. Chọn **Ghi bữa ăn** để xác nhận thành phần.
5. Vào **Bữa ăn**, chọn **Thử với bữa mẫu**, sửa thực phẩm/cách chế biến/gram và ghi nhận. Cách chế biến chưa rõ giữ trạng thái thiếu dữ liệu.
6. Quay lại **Kế hoạch**: tổng đúng ngày cập nhật; xóa bữa để hoàn tác. Sửa hồ sơ tính lại kế hoạch và giữ nhật ký. **Xóa dữ liệu** yêu cầu xác nhận rồi xóa hồ sơ, kế hoạch, nhật ký, check-in, trò chuyện và ảnh.

Biểu mẫu ba bước có thể mở ngay từ onboarding hoặc Hồ sơ ở **Muốn tự nhập? Mở biểu mẫu**. Vi và chat vẫn hiện diện trong luồng này. Nhân vật 3D chào/phản hồi, nhìn theo con trỏ; có nút dừng chuyển động và hỗ trợ reduced motion, fallback khi thiết bị không có WebGL.

## Kiểm thử
`pnpm exec playwright test` tự khởi động Vite nếu cần. Nếu máy chưa có Chromium: `pnpm exec playwright install chromium`. Bộ kiểm thử bao phủ công thức/khoảng, dữ liệu thiếu, onboarding hội thoại desktop/điện thoại, câu hỏi/ảnh trong chat, ghi/xóa bữa theo ngày và xóa dữ liệu.

## Giới hạn
- Chat gửi hội thoại và hồ sơ đã khai báo tới backend AI; lịch sử vẫn lưu dưới dạng JSON trên thiết bị. Backend không lưu phiên hội thoại, nhưng nội dung được gửi tới nhà cung cấp AI. Kế hoạch và phân tích bữa ăn vẫn dùng công thức/dữ liệu demo; ảnh chưa được phân tích.
- Bộ giá trị 12 thực phẩm là dữ liệu minh họa **chưa kiểm chứng**, ghi rõ ngay trong kết quả. Nguồn DOI công khai chỉ áp dụng công thức năng lượng nghỉ và khoảng protein.
- Không phải tư vấn y tế; không tự tạo kế hoạch cho người dưới 18 tuổi.
- Dữ liệu giao diện lưu dưới dạng JSON có phiên bản trong localStorage (`bua-viet:v1:*`); không cần database cho hồ sơ, kế hoạch và nhật ký. Chat cần backend theo hướng dẫn bên trên. Tải lại vẫn giữ hồ sơ, kế hoạch, nhật ký, check-in, hội thoại và nội dung nhập dở. Ảnh xem trước thu nhỏ tối đa 960 px, JPEG chất lượng 0,7 trước khi lưu. Dữ liệu nằm riêng ở trình duyệt/thiết bị hiện tại, chưa đồng bộ giữa thiết bị.
- **Tải bản JSON** xuất bản sao JSON của dữ liệu hiện tại, kể cả nội dung chưa ghi được khi bộ nhớ bị chặn; **Xóa dữ liệu** chỉ xóa các khóa của Bữa Việt. Nếu trình duyệt chặn lưu hoặc hết dung lượng, giao diện báo lỗi; dữ liệu chưa lưu chỉ còn trong bộ nhớ phiên.
- Chat cần backend `chung-khao/chat-core` đang chạy và khóa API hợp lệ trong `.env`; không có chế độ AI khi backend chưa kết nối.

## Thiết kế và tài nguyên
Be Vietnam Pro từ `@fontsource/be-vietnam-pro` (SIL OFL); Lucide (ISC); Three.js (MIT). Font tự phục vụ từ bundle. Nhân vật được dựng bằng hình học 3D trong mã nguồn; không dùng ảnh stock, ảnh AI hoặc model bên ngoài. Three.js tải riêng qua dynamic import.

## Luồng lưu trữ và chỉnh sửa
- Sửa bữa từ nhật ký, thay khẩu phần rồi **Lưu thay đổi**: cập nhật cùng ID, không ghi trùng.
- **Về kế hoạch** hoặc **Quay lại kế hoạch** để xem tổng ngày; **Ghi bữa mới** mở nội dung trống sau khi ghi.
- Sửa hồ sơ tạo lại kế hoạch và giữ nhật ký đã lưu; nút quay lại giữ bản nháp nhập dở.
- Kiểm tra riêng lưu trữ: `pnpm exec playwright test tests/persistence.spec.ts`.
