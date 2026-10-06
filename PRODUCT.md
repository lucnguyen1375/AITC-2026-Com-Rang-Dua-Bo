# Bữa Việt — Ăn theo nhịp tập
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
React + TypeScript + Vite, CSS, SVG và Three.js cho trợ lý 3D.

## Users
Người trưởng thành tập luyện cường độ cao ở Việt Nam, cần lên kế hoạch và đối chiếu khẩu phần với lịch tập.

## Product Purpose
Trò chuyện với trợ lý để cung cấp thể trạng, mục tiêu và lịch tập 7 ngày; tạo kế hoạch tham khảo, xác nhận thành phần món Việt, sửa khối lượng và ghi nhật ký theo ngày.

## Capabilities and Constraints
Onboarding là màn hình riêng, không có mục Kế hoạch hoặc sidebar ứng dụng. Vi 3D đồng hành trong onboarding AI: LLM sinh câu hỏi, textbox và lựa chọn nhanh theo thông tin còn thiếu; người dùng cũng trả lời tự do. Backend kiểm tra hồ sơ trước khi tạo đề xuất; lỗi giữ câu trả lời và có thử lại. Người dùng xem đề xuất, nguồn/giả định rồi chọn **Đồng ý kế hoạch** mới vào ứng dụng chính. Sau onboarding, desktop từ trái qua phải là Sidebar, Main panel, trợ lý 3D chuyển động, chat. Kế hoạch chỉ hiển thị nội dung đã thống nhất. Biểu mẫu phục vụ chỉnh hồ sơ sau onboarding. Chat trong ứng dụng hỗ trợ câu hỏi thực phẩm và ảnh món ăn. Màn Bữa ăn gửi ảnh tới backend AI khi người dùng chủ động bấm Phân tích ảnh; AI chỉ gợi ý món và khối lượng từ danh sách có sẵn. Macro được tính từ dữ liệu thực phẩm minh họa chưa kiểm chứng, người dùng sửa khẩu phần rồi xác nhận đã ăn trước khi ghi vào tổng ngày. Theo yêu cầu cập nhật, dữ liệu giao diện lưu gọn nhẹ bằng JSON trong localStorage của trình duyệt, không dùng database. Giữ hồ sơ, kế hoạch, nhật ký, check-in, hội thoại và nội dung nhập dở qua tải lại. Ảnh xem trước được thu nhỏ trước khi lưu. Ảnh món ăn chỉ được gửi tới dịch vụ AI sau khi người dùng chủ động yêu cầu phân tích; không gửi ảnh cơ thể. Có tải bản JSON và xóa toàn bộ dữ liệu trên thiết bị; không ghi sức khỏe hoặc ảnh vào log hay URL. Dưới 18 tuổi không tạo kế hoạch tự động. Không thay chuyên gia, không chẩn đoán, không khuyên bỏ bữa hoặc tập bù. Khoảng mục tiêu được giữ khi không cung cấp giới tính.

## Brand Commitments
Tên Bữa Việt. Tiếng Việt hoàn toàn. Người dùng chọn phong cách sân tập hiện đại, xanh cobalt, cam năng lượng, nền trắng sáng, chữ đậm và số liệu rõ.

## Evidence on Hand
docs/KE_HOACH_MVP_DINH_DUONG_2_AGENT.md và DE_BAI.md. Công thức Mifflin–St Jeor và khoảng protein ISSN có DOI. Giá trị thực phẩm chưa đối chiếu được phải gắn nhãn chưa kiểm chứng. Chat backend AI đã được đấu nối; kết quả nhận diện món và khẩu phần từ ảnh vẫn là ước lượng.

## Product Principles
- Khẩu phần sửa được, nguồn và giả định kiểm tra được.
- Ngày tập quyết định ngữ cảnh, không chỉ tổng tuần.
- Hiển thị giới hạn và thiếu dữ liệu ngay gần kết quả.
- Giữ thông tin đã nhập qua các bước và lần tải lại bằng JSON trên thiết bị.
