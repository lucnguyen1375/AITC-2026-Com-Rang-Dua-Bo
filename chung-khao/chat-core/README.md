# Chatbot tư vấn dinh dưỡng

Ứng dụng thử nghiệm một chatbot tư vấn dinh dưỡng bằng tiếng Việt cho người tập luyện cường độ cao. Backend Python nhận hội thoại và gọi OpenAI Responses API. API `/api/chat` được đấu nối với giao diện React trong `chung-khao/tro-ly-dinh-duong`; `static/index.html` vẫn có thể dùng để chạy thử backend độc lập.

Đây là công cụ tham khảo, không phải dịch vụ y tế. API chat có thể nhận ảnh món ăn để tư vấn; endpoint riêng phân tích ảnh trả về tên món và khối lượng tham khảo. Không phân tích ảnh cơ thể.

## Tính năng hiện có

- Chat nhiều lượt; trình duyệt gửi toàn bộ lịch sử hội thoại trong mỗi yêu cầu.
- Năm prompt mẫu để thử hồ sơ thiếu, hồ sơ đầy đủ, thay đổi cân nặng/món ăn, người dưới 18 tuổi và tình huống khẩn cấp.
- Khi cần dữ liệu cho tư vấn cá nhân hóa, chatbot trả về danh sách trường còn thiếu. Giao diện dựng biểu mẫu tương ứng với nút chọn nhanh, ô nhập số đo/lịch tập và ghi chú thêm.
- Người dùng có thể chọn “Chưa rõ”, không nêu giới tính hoặc để trống mục nhập. Nhấn “Gửi thông tin” để gửi câu hỏi cùng phần bổ sung; chatbot được hướng dẫn trả lời ngay, không tiếp tục hỏi vòng khác. Nếu thiếu dữ liệu, chatbot cần nêu giới hạn và trả lời tổng quát khi phù hợp.
- Có thể tư vấn năng lượng, chất đạm, chất bột đường, chất béo, món Việt và cách sắp xếp bữa quanh giờ tập. Các con số do AI tính/khuyến nghị phải nêu nguồn công khai có thể đối chiếu hoặc ghi “Ước lượng/chưa kiểm chứng”.
- Hiển thị disclaimer: không thay bác sĩ/chuyên gia dinh dưỡng, không chẩn đoán, kê đơn hoặc khuyên tự ý bỏ thuốc. Người dưới 18 tuổi không nhận mục tiêu dinh dưỡng tự động; dấu hiệu nguy hiểm khi tập được hướng đến cơ sở y tế/cấp cứu.

## Cấu trúc mã

- `app.py`: máy chủ FastAPI, kiểm tra dữ liệu yêu cầu, phục vụ trang chính và cung cấp `POST /api/chat` cùng `POST /api/analyze-meal`.
- `chatbot.py`: đọc cấu hình môi trường, chứa chỉ dẫn dinh dưỡng/an toàn, gọi Responses API và trích nội dung phản hồi.
- `static/index.html`: giao diện chat, prompt mẫu và biểu mẫu bổ sung thông tin. Nội dung phản hồi được hiển thị dưới dạng văn bản an toàn.
- `requirements.txt`: các thư viện Python cần cài.
- `test_chatbot.py`: kiểm tra hợp đồng API và lỗi gateway bằng HTTP giả lập.

## Cài đặt và chạy

Yêu cầu Python 3.12 trở lên. Mở PowerShell tại thư mục `chung-khao/chat-core`:

```powershell
python -m pip install -r requirements.txt
python app.py
```

Mở http://localhost:3000. Ở máy cá nhân có thể chọn cổng bằng biến `CHAT_PORT`; Render tự cấp biến `PORT`.

## Chạy cùng giao diện Bữa Việt

Khởi động backend ở cổng 3000 theo các bước trên. Trong terminal khác, chạy giao diện:

```powershell
cd chung-khao/tro-ly-dinh-duong
pnpm install
pnpm dev
```

Vite chuyển tiếp `/api/*` tới FastAPI mà không đưa khóa API vào trình duyệt. Khi triển khai, chuyển tiếp `/api/chat` và `/api/analyze-meal` tới FastAPI. Chat gửi hội thoại/hồ sơ đã khai báo tới dịch vụ AI. Khi người dùng chủ động bấm Phân tích ảnh, ảnh món ăn đã thu nhỏ được gửi qua backend tới nhà cung cấp AI; backend không lưu ảnh hoặc ghi ảnh/nội dung vào log. Không gửi ảnh cơ thể.

Sao chép `.env.example` thành `.env` ở thư mục gốc repository rồi điền khóa OpenAI của bạn:

```dotenv
OPENAI_API_KEY=<khóa OpenAI của bạn>
OPENAI_MODEL=gpt-4.1-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Không đưa khóa vào frontend hoặc commit tệp `.env`. Khóa chỉ được dùng ở backend. Máy chủ không ghi nội dung hội thoại hoặc khóa vào log ứng dụng. Khi chạy trong Render, cấu hình `OPENAI_API_KEY` ở phần Environment của service; Render tự cấp biến `PORT`.

Máy chủ mặc định lắng nghe trên `0.0.0.0`; có thể mở thử trên điện thoại cùng mạng Wi-Fi bằng `http://<địa chỉ IP máy tính>:3000`. Đây là máy chủ thử nghiệm, chưa có đăng nhập hoặc giới hạn lượt gọi riêng; chỉ dùng trong mạng tin cậy.

## API nội bộ

Địa chỉ: `POST /api/chat`, kiểu nội dung `application/json`.

Yêu cầu chat thông thường:

```json
{
  "messages": [
    { "role": "user", "content": "Tôi 25 tuổi, muốn tăng cơ. Hãy tư vấn giúp tôi." }
  ]
}
```

Khi cần thông tin, phản hồi thành công có dạng:

```json
{
  "reply": "Bạn có thể bổ sung cân nặng và lịch tập để mình cá nhân hóa gợi ý hơn.",
  "profile_request": ["weight", "schedule"]
}
```

Frontend chỉ dựng các trường cho phép: `age`, `sex`, `height`, `weight`, `goal`, `training_type`, `intensity`, `sessions`, `schedule`. Sau khi người dùng gửi biểu mẫu, yêu cầu có thêm `profile_answers`; backend kiểm tra tên/độ dài trường và tự ghép câu trả lời biểu mẫu vào tin nhắn cuối. Lỗi trả về `{ "error": "..." }`.

Ví dụ phần bổ sung khi gửi biểu mẫu:

```json
{
  "messages": [
    { "role": "user", "content": "Tôi muốn tư vấn tăng cơ." },
    { "role": "assistant", "content": "Bạn hãy bổ sung cân nặng và lịch tập." },
    { "role": "user", "content": "Thông tin bổ sung từ biểu mẫu." }
  ],
  "profile_answers": {
    "weight": "70",
    "schedule": "Tập tạ thứ Hai, Tư, Sáu lúc 18 giờ",
    "additional": "Không uống sữa"
  }
}
```

API chỉ nhận vai trò `user` và `assistant`; tin nhắn cuối phải là `user`. Giới hạn mỗi tin nhắn người dùng là 4.000 ký tự, tối đa 80 tin nhắn và kích thước phần thân `/api/chat` là 2 MB; `/api/analyze-meal` nhận tối đa 768 KiB ảnh JPEG sau giải mã.

Mọi lượt gọi AI (chat, onboarding, chat kèm ảnh và phân tích ảnh món ăn) dùng `OPENAI_MODEL` (mặc định `gpt-4.1-mini`). Backend gọi Responses API tại `OPENAI_BASE_URL` (mặc định OpenAI) với `store: false`, `stream: false`, thời gian chờ tổng cộng 45 giây. Backend đọc mọi phần `output_text` trong thông điệp trợ lý, không dựa vào vị trí cố định trong mảng `output`. Các lỗi xác thực, giới hạn lượt gọi, hết thời gian và lỗi mạng được chuyển thành thông báo tiếng Việt.

### Phân tích ảnh món ăn

`POST /api/analyze-meal` nhận JSON gồm `image_data_url` (JPEG base64, tối đa 768 KiB sau giải mã) và `description` tùy chọn. Phản hồi chứa `items` (`food_id`, `grams`) cùng `unknown_items`; backend kiểm tra ID, khẩu phần và kích thước ảnh. Endpoint chỉ gợi ý thành phần từ ảnh, không tự ghi nhật ký và không trả macro. Frontend tính macro theo bộ thực phẩm demo chưa kiểm chứng; người dùng phải rà soát/sửa kết quả rồi xác nhận đã ăn. Ảnh được gửi tới dịch vụ AI của nhà cung cấp, do đó việc xử lý/log vận hành của nhà cung cấp áp dụng theo chính sách riêng.

## Căn cứ và giới hạn tư vấn

Chỉ dẫn chatbot cung cấp các căn cứ sau:

- Mifflin và cộng sự (1990), phương trình ước tính năng lượng nghỉ: https://doi.org/10.1093/ajcn/51.2.241. Đây không phải tổng nhu cầu năng lượng trong ngày.
- Jäger và cộng sự (2017), khuyến nghị chất đạm cho phần lớn người tập: https://doi.org/10.1186/s12970-017-0177-8. Đây không phải chỉ định điều trị hoặc phù hợp cho mọi người.
- Viện Dinh dưỡng Quốc gia (2007), *Bảng thành phần thực phẩm Việt Nam*, NXB Y học, Hà Nội; website https://viendinhduong.vn/. Ứng dụng không nạp bảng dữ liệu này để tra cứu tự động; số cụ thể của món/khẩu phần chưa đối chiếu được phải ghi “Ước lượng/chưa kiểm chứng”.

Hệ số vận động và tỉ lệ chất béo dùng trong minh họa chưa được kiểm chứng cho từng cá nhân. Chatbot không được gán các giả định này cho nguồn không đề cập đến chúng, không được bịa nguồn/số liệu, và phải nói rõ khi chưa chắc hoặc thiếu căn cứ. Chỉ dẫn giúp giảm rủi ro nhưng không bảo đảm mọi phản hồi AI đều chính xác; người dùng cần đối chiếu trước khi áp dụng.

Trong chỉ dẫn hiện tại, Mifflin–St Jeor được dùng để ước tính năng lượng nghỉ; khuyến nghị protein tham khảo được dẫn theo Jäger và cộng sự. Hệ số vận động 1,6–2,0 và giả định chất béo 25% chỉ là giả định của bản thử nghiệm, phải được ghi rõ là chưa kiểm chứng cho cá nhân.

Ứng dụng không chẩn đoán bệnh, kê đơn, khuyên tự ý ngừng thuốc, ép tập bù hoặc suy luận thể trạng/bệnh từ ngoại hình. Khi có dấu hiệu nguy hiểm trong lúc tập, cần dừng tập và liên hệ cơ sở y tế/cấp cứu.

## Quyền riêng tư

Với giao diện React, lịch sử hội thoại lưu trong JSON có phiên bản ở localStorage; ảnh xem trước không được gửi tới backend. Ảnh món ăn chỉ được gửi khi người dùng chủ động phân tích. Backend không lưu phiên hội thoại. Nội dung và hồ sơ người dùng được gửi tới OpenAI để tạo phản hồi; `store: false` không khẳng định nhà cung cấp không ghi log vận hành. Trang HTML độc lập chỉ giữ lịch sử trong bộ nhớ của trang đang mở.

## Chạy kiểm tra backend

```powershell
python -m pip install pytest
python -m pytest -q
```

Bộ kiểm tra dùng HTTP giả lập, không gọi mô hình thật.

## Onboarding AI trong ứng dụng React

`POST /api/onboarding` là luồng thu thập hồ sơ nhiều lượt, riêng với chat tư vấn. LLM sinh câu hỏi, textbox và lựa chọn nhanh theo những trường còn thiếu. Backend kiểm tra schema UI, số đo, lịch đủ bảy ngày và giữ các trường đã khai qua các lượt. Chỉ hồ sơ đầy đủ, hợp lệ của người trưởng thành mới có `ready: true`; frontend vẫn cần người dùng đồng ý kế hoạch trước khi chuyển vào ứng dụng.

Endpoint dùng cùng kết nối OpenAI Responses API với chat, không có fallback bằng câu hỏi giả khi dịch vụ lỗi. Chi tiết sử dụng và kiểm thử: [ONBOARDING_AI.md](../tro-ly-dinh-duong/docs/ONBOARDING_AI.md). Kiểm tra hợp đồng bằng `python -m unittest test_onboarding -v`.
