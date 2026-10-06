# Bữa Việt — Ăn theo nhịp tập

**Bữa Việt** là ứng dụng trợ lý dinh dưỡng dành cho người tập luyện. Người dùng trò chuyện với Vi để tạo hồ sơ và nhận kế hoạch ăn uống phù hợp, theo dõi năng lượng và dưỡng chất theo ngày, đồng thời ghi nhật ký bữa ăn bằng cách nhập món hoặc phân tích ảnh. Kế hoạch và giá trị dinh dưỡng hiện mang tính tham khảo.

Ứng dụng được xây dựng bằng React, TypeScript và Vite, với giao diện tiếng Việt tối ưu cho điện thoại và máy tính.

## Chức năng trên giao diện
- **Làm quen cùng Vi:** điền tuổi, cân nặng, chiều cao trong một lượt hoặc gửi cả hồ sơ bằng tin nhắn; Vi gom tối đa ba câu hỏi còn thiếu mỗi lượt. Xem đề xuất trước khi đồng ý và có thể chỉnh sửa hồ sơ sau đó.
- **Kế hoạch dinh dưỡng:** xem mục tiêu năng lượng và dưỡng chất theo ngày, chọn ngày cần theo dõi, xem cách tính và nguồn tham khảo.
- **Nhật ký bữa ăn:** nhập món hoặc chụp/chọn ảnh để AI gợi ý món và khẩu phần; kiểm tra, chỉnh sửa thành phần rồi xác nhận đã ăn. Có thể sửa hoặc xóa bữa đã ghi.
- **Trò chuyện với Vi:** trao đổi để cập nhật thông tin và nhận hướng dẫn trong giao diện có nhân vật Vi 3D; có tùy chọn dừng chuyển động.
- **Quản lý dữ liệu:** dữ liệu lưu trên thiết bị hiện tại; có thể tải bản sao JSON hoặc xóa dữ liệu ứng dụng. Giao diện thích ứng với điện thoại và máy tính.

Kế hoạch và giá trị dinh dưỡng là ước lượng tham khảo, không thay thế tư vấn y tế.

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
Đặt `OPENAI_API_KEY` trong `.env` ở thư mục gốc repository. Vite chuyển tiếp `/api/*` tới backend cổng 3000. Không đặt khóa API trong frontend.

## Triển khai Render

Repository có `render.yaml` và `Dockerfile` để build frontend, phục vụ frontend cùng FastAPI trên một web service. Tạo Blueprint từ repository ở Render rồi đặt `OPENAI_API_KEY` trong Environment của service (Render hỏi khóa khi tạo mới; nếu service đã có thì thêm biến ở Dashboard). Ứng dụng dùng biến `PORT` Render tự cấp và health check tại `/healthz`. Chi tiết cấu hình cục bộ xem `.env.example` ở thư mục gốc.

## Luồng demo
1. Onboarding riêng: chọn **Bắt đầu với Vi**. LLM sinh câu hỏi, nhãn textbox, gợi ý nhập và lựa chọn nhanh theo thông tin còn thiếu. Chọn phương án hoặc tự trả lời; có thể nhắn tự do để sửa hồ sơ. Khi đủ thông tin, xem đề xuất rồi chọn **Đồng ý kế hoạch**.
2. Trên PC: Sidebar → Main dinh dưỡng → nhân vật Vi 3D → Chat. Trên điện thoại, onboarding bắt đầu với Vi và chat; sau tạo kế hoạch, nội dung dinh dưỡng đứng trước, có nút quay về chat.
3. Chọn ngày ở **Kế hoạch**; mở **Cách tính và nguồn** để kiểm tra công thức và giả định.
4. Trong **Bữa ăn**, chụp/chọn ảnh rồi bấm **Phân tích ảnh**. Ảnh được gửi tới backend AI; kết quả gợi ý thành phần và gram để bạn kiểm tra, sửa hoặc bổ sung dầu/sốt. Không muốn gửi ảnh thì nhập tên món bằng tay.
5. Xem macro ước lượng từ bộ giá trị thực phẩm minh họa chưa kiểm chứng. Rà soát món AI chưa nhận diện; chỉ tiếp tục sau khi xử lý danh sách đó. Bấm **Xác nhận đã ăn** để cộng vào nhật ký ngày đang chọn.
6. Quay lại **Kế hoạch**: tổng đúng ngày cập nhật; xóa bữa để hoàn tác. Sửa hồ sơ tính lại kế hoạch và giữ nhật ký. **Xóa dữ liệu** yêu cầu xác nhận rồi xóa hồ sơ, kế hoạch, nhật ký, check-in, trò chuyện và ảnh.

Onboarding không có sidebar hoặc điều hướng Kế hoạch. Biểu mẫu ba bước phục vụ chỉnh hồ sơ trong ứng dụng sau onboarding. Vi 3D phản hồi cùng hội thoại, nhìn theo con trỏ; có dừng chuyển động và reduced motion. Yêu cầu cập nhật tập trung vào desktop.

## Kiểm thử
`pnpm exec playwright test` tự khởi động Vite nếu cần. Nếu máy chưa có Chromium: `pnpm exec playwright install chromium`. Bộ kiểm thử bao phủ công thức/khoảng, dữ liệu thiếu, onboarding hội thoại desktop/điện thoại, câu hỏi/ảnh trong chat, ghi/xóa bữa theo ngày và xóa dữ liệu.

## Giới hạn
- Chat gửi hội thoại và hồ sơ đã khai báo tới backend AI; lịch sử vẫn lưu dưới dạng JSON trên thiết bị. Backend không lưu phiên hội thoại, nhưng nội dung được gửi tới nhà cung cấp AI. Kế hoạch và macro vẫn dùng công thức/dữ liệu demo. Khi người dùng bấm Phân tích ảnh, ảnh món ăn được gửi tới backend rồi nhà cung cấp AI; backend không ghi ảnh vào log và không lưu phiên. Nhà cung cấp có thể áp dụng log vận hành riêng.
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
