# Onboarding AI cùng Vi

Giao diện desktop dùng màn riêng trước khi vào Kế hoạch. Chọn **Bắt đầu với Vi**, rồi chọn phương án nhanh, trả lời trong textbox hoặc nhắn tự do. Mỗi lượt LLM hỏi những thông tin còn thiếu; có thể nhắn để sửa thông tin đã khai. Khi đủ hồ sơ, người dùng xem đề xuất và chọn **Đồng ý kế hoạch** mới vào ứng dụng.

## Kết nối

Chạy `python app.py` trong `chung-khao/chat-core` và `pnpm dev` trong `chung-khao/tro-ly-dinh-duong`. Backend dùng `OPENAI_API_KEY` trong `.env` gốc, không đưa khóa vào frontend. Vite dev/preview chuyển tiếp `/api/*` tới cổng 3000. Trên Render, `Dockerfile` build frontend và đóng gói cùng FastAPI trong một service.

`POST /api/onboarding` nhận lịch sử dạng `role/content`, hồ sơ đã thu thập và câu trả lời có nhãn. LLM trả JSON gồm `reply`, `profile`, `questions`, `blocked`. Backend kiểm tra tám trường hồ sơ, phạm vi số đo, lịch đủ bảy ngày, giờ/thời lượng, danh sách trường UI và các lựa chọn. Backend tự xác định `ready`; không tin cờ hoàn tất do LLM tự nêu. Trường đã khai vẫn được giữ nếu LLM bỏ sót trong lượt mới. Giao diện chỉ dựng các kiểu text, number và textarea; nội dung được render như văn bản.

AI thu thập hồ sơ và dẫn dắt hội thoại. Chỉ số đề xuất vẫn được tính bằng công thức trong `services/nutrition.ts`, có nguồn và giả định riêng; đây là kế hoạch tham khảo. Dưới 18 tuổi không tạo kế hoạch tự động. Onboarding không gửi ảnh đến LLM. Hồ sơ, hội thoại và bản nháp lưu dạng JSON trên thiết bị; nội dung câu trả lời được gửi đến OpenAI để xử lý.

Lỗi mạng hoặc hết thời gian hiển thị thông báo và nút **Thử lại**. Giữ cả đáp án đã chọn, không thêm trùng lượt khi thử lại. Đầu ra LLM sai định dạng không chặn onboarding: backend giữ hồ sơ và đáp án có nhãn đã ghi nhận, hỏi tiếp trường còn thiếu; frontend bổ sung thuộc tính UI còn thiếu thay vì báo lỗi validate. Hồ sơ vẫn phải đầy đủ trước khi tạo đề xuất.

## Kiểm tra

- Backend: `python -m unittest test_onboarding -v` trong `chung-khao/chat-core`.
- Giao diện: chạy `pnpm preview --port 4175`, rồi `pnpm exec playwright test --config playwright.onboarding.config.ts --grep-invert 'OpenAI thật'`.
- OpenAI thật: đặt `$env:RUN_OPENAI_LIVE='1'`, rồi chạy cùng cấu hình với `--grep 'OpenAI thật'`. Test dùng hồ sơ minh họa và có gọi OpenAI. Các test mặc định giả lập đầu ra LLM để kiểm tra hợp đồng UI, không chứng minh dịch vụ đang hoạt động.

Chưa xác minh kết nối AI thật trong lần cập nhật này. Khi triển khai, kiểm tra `OPENAI_API_KEY` và `OPENAI_MODEL` trong cấu hình service nếu AI chưa phản hồi.
