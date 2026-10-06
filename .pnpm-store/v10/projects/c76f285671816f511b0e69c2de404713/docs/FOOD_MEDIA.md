# Ảnh món ăn và đối chiếu kế hoạch

## Phương án ảnh đã triển khai

12 ảnh thật từ Wikimedia Commons được lưu tại `public/images/foods`, tải từ ứng dụng thay vì hotlink. Mỗi ảnh giữ URL nguồn, tác giả, giấy phép và thay đổi trong `credits.json`, cùng metadata JPEG. Giao diện có mục “Nguồn ảnh minh họa món ăn”. Nguồn ảnh độc lập với nguồn dữ liệu dinh dưỡng.

Ảnh dùng để nhận diện thực phẩm, không đại diện chính xác gram hoặc cách chế biến. Hiển thị khung 4:3, lazy loading, có tên món và biểu tượng dự phòng nếu ảnh lỗi. Các ảnh có bố cục, ánh sáng khác nhau; bộ ảnh chuyên nghiệp thống nhất là bước nâng cấp phù hợp khi ra mắt.

## Lựa chọn để nâng cấp

- **Chụp thực tế:** phù hợp nhất cho món Việt và đúng cách chế biến. Chụp góc 45°, ánh sáng cửa sổ, nền sáng, ít đạo cụ, cùng bộ bát đĩa. Lưu ảnh gốc tối thiểu 1.200 px và xác nhận quyền sử dụng. Đây là lựa chọn ưu tiên cho sản phẩm chính thức.
- **Ảnh có giấy phép:** phù hợp demo nhanh; kiểm tra đúng thực phẩm, đủ nét, quyền sử dụng, tác giả và giấy phép từng ảnh. Không lấy ảnh tùy ý từ Google Images. Đã áp dụng phương án này.
- **Tạo ảnh AI:** phù hợp món khó tìm hoặc cần bộ ảnh đồng nhất. Gắn nhãn ảnh minh họa AI, rà lại nguyên liệu và dấu hiệu món Việt, không suy ra dinh dưỡng hay gram từ ảnh. Ví dụ prompt: “Ảnh món ăn chân thực: ức gà luộc bỏ da thái lát, bày riêng trên đĩa sứ trắng, góc 45 độ, ánh sáng cửa sổ, màu tự nhiên, nền sáng, chi tiết rõ, không thêm dầu/sốt/rau, không chữ; dùng làm ảnh minh họa nhận diện thực phẩm.” Chưa tạo ảnh AI trong phiên này.

## Dinh dưỡng và kế hoạch

Mỗi thực phẩm hiển thị kcal, đạm, bột đường và béo theo gram. Chưa rõ gram/cách chế biến thì giữ trạng thái thiếu dữ liệu. Disclaimer xuất hiện ngay gần kết quả và trong chat: “Thông tin dinh dưỡng chỉ để tham khảo, không hoàn toàn chính xác.” Bộ số liệu cục bộ vẫn chưa kiểm chứng.

Nút “Dùng bữa gợi ý này” mở bữa cùng thành phần và gram từ kế hoạch của ngày đang chọn, không tự ghi nhật ký. Người dùng có thể sửa rồi xác nhận. Đánh giá dùng mục tiêu hồ sơ, kế hoạch ngày và tổng nhật ký; không tính bữa đã lưu hai lần.

`services/mealAlignment.ts` áp dụng quy tắc sơ bộ: tăng cơ ưu tiên thành phần đạm ít béo (≥15 g đạm và ≤8 g béo/100 g, đóng góp ≥10 g đạm trong khẩu phần) và bữa đạt ≥15% mục tiêu đạm ngày; giảm mỡ thêm ít nhất 80 g rau; giữ thể trạng có đạm, rau và ≥20 g bột đường. Nếu thiếu dữ liệu hoặc tổng ngày vượt khoảng năng lượng, không trả trạng thái phù hợp. Đây không phải thang điểm y khoa, không xác nhận đủ dinh dưỡng cả ngày. Thực đơn hiện tại là cấu trúc tham khảo, chưa tối ưu toàn bộ lượng ăn để khớp các mục tiêu.

Sau khi ghi bữa phù hợp, Vi cổ vũ với lý do cụ thể. Câu hỏi trong chat chỉ đánh giá có điều kiện “Nếu dùng khẩu phần này”, không coi câu hỏi là việc đã ăn. Phản hồi là mô phỏng; chưa gọi mô hình AI.

Khi có API AI, truyền hồ sơ mục tiêu, kế hoạch ngày, khẩu phần đã xác nhận, tổng nhật ký và kết quả đối chiếu vào dịch vụ phía server; yêu cầu lời cổ vũ dựa trên dữ liệu, giữ disclaimer và không bịa thêm số dinh dưỡng. Khóa API không đặt ở frontend. `services/assistant.ts` là điểm nối hiện tại.
