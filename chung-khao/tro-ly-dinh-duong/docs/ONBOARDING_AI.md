# Onboarding AI cùng Vi

Giao diện desktop dùng màn riêng trước khi vào Kế hoạch. Chọn **Bắt đầu với Vi**, rồi chọn phương án nhanh, trả lời trong textbox hoặc nhắn tự do. Mỗi lượt LLM hỏi những thông tin còn thiếu; có thể nhắn để sửa thông tin đã khai. Khi đủ hồ sơ, người dùng xem đề xuất và chọn **Đồng ý kế hoạch** mới vào ứng dụng.

## Kết nối

Chạy `python app.py` trong `chung-khao/chat-core` và `pnpm dev` trong `chung-khao/tro-ly-dinh-duong`. Backend dùng cấu hình Gateway BTC hiện có, không đưa khóa vào frontend. Vite dev/preview chuyển tiếp `/api/*` tới cổng 3000; triển khai cần chuyển tiếp cùng đường dẫn tới backend.

`POST /api/onboarding` nhận lịch sử dạng `role/content`, hồ sơ đã thu thập và câu trả lời có nhãn. LLM trả JSON gồm `reply`, `profile`, `questions`, `blocked`. Backend kiểm tra tám trường hồ sơ, phạm vi số đo, lịch đủ bảy ngày, giờ/thời lượng, danh sách trường UI và các lựa chọn. Backend tự xác định `ready`; không tin cờ hoàn tất do LLM tự nêu. Trường đã khai vẫn được giữ nếu LLM bỏ sót trong lượt mới. Giao diện chỉ dựng các kiểu text, number và textarea; nội dung được render như văn bản.

AI thu thập hồ sơ và dẫn dắt hội thoại. Chỉ số đề xuất vẫn được tính bằng công thức trong `services/nutrition.ts`, có nguồn và giả định riêng; đây là kế hoạch tham khảo. Dưới 18 tuổi không tạo kế hoạch tự động. Onboarding không gửi ảnh đến LLM. Hồ sơ, hội thoại và bản nháp lưu dạng JSON trên thiết bị; nội dung câu trả lời được gửi đến Gateway để xử lý.

Lỗi mạng, hết thời gian hoặc đầu ra LLM không hợp lệ hiển thị thông báo và nút **Thử lại**. Giữ câu trả lời, không thêm trùng lượt khi thử lại và không thay bằng hội thoại giả.

## Kiểm tra

- Backend: `python -m unittest test_onboarding -v` trong `chung-khao/chat-core`.
- Giao diện: chạy `pnpm preview --port 4175`, rồi `pnpm exec playwright test --config playwright.onboarding.config.ts --grep-invert 'Gateway BTC thật'`.
- Gateway thật: đặt `$env:RUN_BTC_LIVE='1'`, rồi chạy cùng cấu hình với `--grep 'Gateway BTC thật'`. Test dùng hồ sơ minh họa và có gọi Gateway. Các test mặc định giả lập đầu ra LLM để kiểm tra hợp đồng UI, không chứng minh dịch vụ đang hoạt động.

Lần kiểm tra trực tiếp trong phiên triển khai này nhận HTTP 400 tại địa chỉ Gateway đang cấu hình, trước khi có phản hồi mô hình. Chưa xác minh thành công luồng AI thật; cần địa chỉ Gateway hoạt động để kiểm tra lại. Không thay đổi tệp chứa cấu hình bí mật.
