# Onboarding AI cùng Vi

Giao diện desktop dùng màn riêng trước khi vào Kế hoạch. Chọn **Bắt đầu với Vi**, rồi chọn phương án nhanh, trả lời trong textbox hoặc nhắn tự do. Mỗi lượt LLM hỏi những thông tin còn thiếu; có thể nhắn để sửa thông tin đã khai. Khi đủ hồ sơ, người dùng xem đề xuất và chọn **Đồng ý kế hoạch** mới vào ứng dụng.

## Kết nối

Chỉ chạy `pnpm dev` trong `chung-khao/tro-ly-dinh-duong` (port 5173). Với bản build chạy `pnpm build` rồi `pnpm start`. Bộ xử lý `server/ai.mjs` được gắn vào Vite dev/preview trên cùng port và gọi LLM trực tiếp từ tiến trình Node. Backend Python `chat-core` đã được bỏ; frontend chỉ gọi `/api/*` cùng nguồn, không gọi sang service khác. API key lấy từ `.env` gốc hoặc `.env.local` của ứng dụng, chỉ tồn tại phía server, không dùng tiền tố `VITE_`.

`POST /api/onboarding` nhận lịch sử dạng `role/content`, hồ sơ đã thu thập và câu trả lời có nhãn. LLM trả JSON gồm `reply`, `profile`, `questions`, `blocked`. Bộ xử lý AI kiểm tra tám trường hồ sơ, phạm vi số đo, lịch đủ bảy ngày, giờ/thời lượng, danh sách trường UI và các lựa chọn. Bộ xử lý AI tự xác định `ready`; không tin cờ hoàn tất do LLM tự nêu. Trường đã khai vẫn được giữ nếu LLM bỏ sót trong lượt mới. Giao diện chỉ dựng các kiểu text, number và textarea; nội dung được render như văn bản.

AI thu thập hồ sơ và dẫn dắt hội thoại. Chỉ số đề xuất vẫn được tính bằng công thức trong `services/nutrition.ts`, có nguồn và giả định riêng; đây là kế hoạch tham khảo. Dưới 18 tuổi không tạo kế hoạch tự động. Onboarding không gửi ảnh đến LLM. Hồ sơ, hội thoại và bản nháp lưu dạng JSON trên thiết bị; nội dung câu trả lời được gửi đến OpenAI để xử lý.

Lỗi mạng hoặc hết thời gian hiển thị thông báo và nút **Thử lại**. Giữ cả đáp án đã chọn, không thêm trùng lượt khi thử lại. Đầu ra LLM sai định dạng không chặn onboarding: bộ xử lý AI giữ hồ sơ và đáp án có nhãn đã ghi nhận, hỏi tiếp trường còn thiếu; frontend bổ sung thuộc tính UI còn thiếu thay vì báo lỗi validate. Hồ sơ vẫn phải đầy đủ trước khi tạo đề xuất.

## Kiểm tra

- API tích hợp: `pnpm test:api` trong thư mục ứng dụng; giả lập LLM, không gửi dữ liệu tới Gateway.
- Giao diện: chạy `pnpm preview --port 4175`, rồi `pnpm exec playwright test --config playwright.onboarding.config.ts --grep-invert 'Gateway BTC thật'`.
- Gateway thật: đặt `$env:RUN_BTC_LIVE='1'`, rồi chạy cùng cấu hình với `--grep 'Gateway BTC thật'`. Test dùng hồ sơ minh họa và có gọi Gateway. Các test mặc định giả lập đầu ra LLM để kiểm tra hợp đồng UI, không chứng minh dịch vụ đang hoạt động.

Lần kiểm tra trực tiếp trước khi gom service nhận HTTP 400 tại địa chỉ Gateway đang cấu hình, trước khi có phản hồi mô hình. Chưa xác minh thành công luồng AI thật; cần địa chỉ Gateway hoạt động để kiểm tra lại. Không thay đổi tệp chứa cấu hình bí mật.
