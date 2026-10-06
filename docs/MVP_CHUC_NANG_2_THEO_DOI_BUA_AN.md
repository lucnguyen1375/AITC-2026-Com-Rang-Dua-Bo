# Kế hoạch MVP — Chức năng 2: Theo dõi và đánh giá bữa ăn

> **Tài liệu lịch sử:** kế hoạch dưới đây dùng kiến trúc cũ. Backend Python đã được bỏ. Ứng dụng hiện tại ở `chung-khao/tro-ly-dinh-duong/`, chạy giao diện và xử lý AI trong một service Node.js; xem [hướng dẫn hiện tại](../chung-khao/tro-ly-dinh-duong/README.md).

> Tài liệu giao việc cho 2 coding agent. Mục tiêu là bổ sung một luồng mobile web gọn vào phần `chat-core` đang có, giữ nguyên chức năng chat và không dựng thêm backend trong đợt MVP frontend này.

## Mục tiêu

Người dùng chụp/chọn ảnh món ăn, ghi mô tả và khẩu phần, xem ước lượng dinh dưỡng, sửa lại thành phần nếu cần, rồi ghi nhận bữa để xem tổng trong ngày so với mục tiêu.

## Hiện trạng và giới hạn cần biết

- Ứng dụng hiện tại ở `chung-khao/chat-core/`, dùng FastAPI và một trang HTML/CSS/JavaScript thuần. Không cần chuyển sang React hay cài thêm framework.
- Backend hiện có `POST /api/chat`, nhận JSON dạng văn bản. API này chưa nhận ảnh, chưa trả về dữ liệu dinh dưỡng có cấu trúc, và không cung cấp mục tiêu hằng ngày cho giao diện.
- Do phạm vi lần này chỉ là frontend, phần phân tích ảnh dùng adapter dữ liệu mẫu/mô phỏng. Giao diện phải nói rõ **“Bản demo — ảnh chưa được AI phân tích/gửi đi”**; không giả kết quả mẫu là kết quả nhận diện thật.
- Để so sánh trong ngày, cho phép nhập hoặc nạp mục tiêu mẫu ngay trong phiên. Không trích số từ đoạn trả lời chat tự do để làm mục tiêu.
- Không lưu ảnh hoặc nhật ký sau khi tải lại trang; không thêm database, đăng nhập hay lưu `localStorage`.

> Muốn phân tích ảnh thật cần bổ sung endpoint phía máy chủ để nhận ảnh và gọi mô hình đa phương thức. Đây là bước tiếp theo, ngoài phạm vi frontend MVP này; không đưa khóa API vào trình duyệt.

## Luồng người dùng

1. Mở mục **Bữa ăn** từ giao diện hiện tại; luồng chat-core vẫn dùng được như cũ.
2. Chọn loại bữa (sáng/trưa/tối/phụ), ngày và ảnh từ camera hoặc thư viện. Trên điện thoại ưu tiên `input type="file" accept="image/*" capture="environment"`; vẫn dùng được khi trình duyệt chỉ mở bộ chọn tệp.
3. Xem trước ảnh, thay/xóa ảnh; nhập mô tả món và khẩu phần bằng tiếng Việt. Có thể tiếp tục bằng mô tả khi không chọn ảnh.
4. Bấm **Phân tích bữa ăn**. Adapter demo trả về món mẫu/ước lượng, hoặc yêu cầu người dùng bổ sung mô tả khi chưa đủ dữ liệu. Hiển thị nhãn mô phỏng rõ cạnh kết quả.
5. Hiện danh sách thành phần có thể sửa: tên món, lượng ăn (g), cách chế biến. Cho phép xóa/thêm thành phần; đổi lượng thì tính lại tổng ngay.
6. Hiển thị tổng bữa (kcal, protein, carb, fat), các giả định/cảnh báo, và so sánh với mục tiêu ngày cùng những bữa đã ghi nhận.
7. Chỉ cộng vào nhật ký khi người dùng bấm **Ghi nhận bữa ăn**. Có thể sửa hoặc xóa bản ghi trong phiên; xem tổng ngày cập nhật tương ứng.

## Quy tắc kết quả

- Tất cả con số của demo phải mang nhãn **Ước lượng / dữ liệu mẫu**, và không mô tả là AI đã nhận diện ảnh.
- Nếu thiếu lượng ăn, dầu/sốt hoặc thành phần, hỏi người dùng hoặc ghi rõ giả định; không trình bày con số như chính xác.
- Dùng một danh mục nhỏ món/nguyên liệu để demo; giá trị dinh dưỡng có nguồn hoặc gắn nhãn chưa kiểm chứng. Tính khẩu phần theo `giá trị trên 100 g × số gram / 100`.
- So sánh theo tổng nhật ký đã ghi trong đúng ngày. Khi ngày chưa đủ dữ liệu, ghi **“Nhật ký hiện tại”**, không kết luận cả ngày thiếu dinh dưỡng.
- Nếu còn thiếu so với mục tiêu: gợi ý thực phẩm/khẩu phần phù hợp để cân nhắc. Nếu vượt: gợi ý điều chỉnh khẩu phần ở bữa sau; không khuyên tập bù, bỏ bữa hoặc ép cắt năng lượng.
- Mục tiêu ngày nhập thủ công hoặc dữ liệu mẫu phải có nhãn tương ứng. Không tự động lấy số từ câu trả lời văn bản của chatbot.

## Hợp đồng frontend tối thiểu

Giữ trạng thái ở JavaScript trong bộ nhớ của trang. Adapter phân tích cần có thể thay từ demo sang API sau này mà không viết lại giao diện:

```js
window.MealFeature.mount(rootElement, {
  getDailyTarget(dateKey), // { caloriesKcal, proteinG, carbG, fatG } | null
  getEntries(dateKey),
  onSave(entry),
  onUpdate(entry),
  onDelete(entryId),
});
```

Mỗi bản ghi tối thiểu gồm `id`, `dateKey`, `mealType`, `description`, `items`, `totals`, `createdAt`. Ảnh chỉ giữ dưới dạng `File`/URL xem trước tạm thời trong giao diện, không đưa vào bản ghi nhật ký. Thu hồi URL xem trước khi thay/xóa ảnh hoặc rời màn.

## Chia việc cho 2 coding agent

### Agent 1 — Tích hợp giao diện mobile

**Sở hữu:** `chung-khao/chat-core/static/index.html`.

- Thêm điều hướng/mục **Bữa ăn** và vùng mount cho tính năng mới; giữ nguyên chat, form hồ sơ và hành vi hiện có.
- Làm bố cục ưu tiên điện thoại, nút đủ lớn, nhãn tiếng Việt, trạng thái rỗng/đang xử lý/lỗi và thông báo mô phỏng dễ thấy.
- Tạo điểm nối cố định, ví dụ `<section id="meal-panel"></section>`, và nạp script `meal-feature.js` sau khi thống nhất với Agent 2.
- Kiểm tra bằng trình duyệt ở chiều rộng 360–430 px; không thêm thư viện giao diện.

### Agent 2 — Luồng bữa ăn, dữ liệu và tính toán

**Sở hữu:** `chung-khao/chat-core/static/meal-feature.js` (có thể thêm một tệp dữ liệu nhỏ cùng thư mục nếu cần).

- Cài đặt API `window.MealFeature.mount(...)` theo hợp đồng trên; không sửa `app.py`, `chatbot.py` hoặc endpoint chat.
- Làm chọn/chụp ảnh, preview/thay/xóa, mô tả món, sửa thành phần và trạng thái phân tích.
- Tạo adapter demo có kết quả mẫu rõ ràng; không gửi ảnh lên mạng và không gọi endpoint chat như thể endpoint đó phân tích ảnh.
- Tính kcal/protein/carb/fat từ dữ liệu thành phần, cộng/trừ nhật ký theo ngày, xử lý thiếu dữ liệu và gợi ý trung tính.
- Bàn giao hướng dẫn ngắn cho Agent 1 về cách khởi tạo component và các trạng thái cần hiển thị.

### Phối hợp

- Chốt tên điểm mount và chữ ký callback trước khi làm song song. Agent 1 chỉ sửa `index.html`; Agent 2 chỉ sửa file tính năng/dữ liệu.
- Không thay stack, không đổi API chat, không thêm dependency, không lưu dữ liệu bền vững.
- Tích hợp theo luồng: mở Bữa ăn → chọn ảnh/nhập mô tả → xem và sửa kết quả → ghi nhận → tổng ngày cập nhật.

## Tiêu chí hoàn thành

- [ ] Chat-core hiện có vẫn mở và gửi tin nhắn như trước.
- [ ] Màn Bữa ăn dùng tốt trên điện thoại; chụp/chọn, xem trước, thay và xóa ảnh hoạt động.
- [ ] Có thể phân tích demo bằng mô tả, kể cả khi không có ảnh; trạng thái mô phỏng được ghi rõ.
- [ ] Sửa/xóa thành phần cập nhật dinh dưỡng; thiếu thông tin không bị hiểu thành 0.
- [ ] Chỉ ghi nhật ký khi xác nhận; sửa/xóa bữa cập nhật đúng tổng ngày.
- [ ] Mục tiêu ngày có thể nhập/chọn mẫu và được nhận diện rõ là đầu vào demo.
- [ ] Không có ảnh, dữ liệu cá nhân hay khóa API trong lưu trữ bền vững/trình duyệt.
- [ ] Giao diện không khuyên tập bù hoặc bỏ bữa khi vượt mục tiêu.

## Phạm vi để sau MVP

Phân tích ảnh thật, API nhận ảnh, lưu lịch sử giữa các phiên, đồng bộ mục tiêu cấu trúc từ chat-core, tài khoản người dùng và nhận diện khẩu phần tự động. Khi bắt đầu tích hợp AI ảnh, bổ sung endpoint phía máy chủ và cập nhật rõ đồng ý gửi ảnh, giới hạn tệp và trạng thái lỗi.
