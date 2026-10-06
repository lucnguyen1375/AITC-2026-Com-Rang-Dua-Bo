# RULES — Sử dụng AI Agent tại AI Thực Chiến, vòng Chung khảo

Nguồn: [Tài liệu vòng 2](https://docs.thucchien.ai/docs/round-2), `transcripts(1).md` (tóm tắt training; không phải chép nguyên văn) và nguyên tắc chuẩn bị do đội xác nhận. Các thông số kỹ thuật dưới đây được giữ theo tài liệu gốc; đối chiếu Gateway hiện hành trước khi dùng.

## 1. Cách hiểu và sử dụng file

- **BẮT BUỘC / CẤM:** yêu cầu được nêu trong tài liệu BTC.
- **KHUYẾN NGHỊ:** cách làm được tài liệu khuyên dùng; không tự động trở thành điều kiện hợp lệ của bài thi.
- **ĐỀ XUẤT CHO ĐỘI:** cách vận hành bổ sung của bản tổng hợp này, không phải luật BTC.

Dùng file này làm tài liệu kiểm tra cho thành viên và làm ngữ cảnh cho agent. Khi đề thi hoặc BTC có hướng dẫn cụ thể hơn, đối chiếu lại trước khi hành động; nếu mâu thuẫn, hỏi BTC.

## 2. Quy định bắt buộc đối với AI và tính trung thực

### 2.1. Gateway và AI Log

**BẮT BUỘC / CẤM** — [Nguồn: AI Log](https://docs.thucchien.ai/docs/round-2/ai-log-guide).

- Chỉ dùng model qua Gateway BTC; ghi/gửi đủ event thật.
- Cấm giả, sửa/xóa/thêm log thủ công, lọc event, tắt hook, gửi thiếu hoặc dùng token/log đội khác.
- Được sửa script/hook/lịch gửi nếu giữ đầy đủ, đúng định dạng, trung thực.
- Bí mật: không đưa vào prompt; không cho agent đọc/in/sửa file key, `.env`; không commit `.env`/chia sẻ token ngoài đội.
- Agent mở ở gốc repo có `origin`. Token xác định đội; `repo`/`student` chỉ đối chiếu.
- Push thành công chưa chứng minh gửi log thành công.
- Ngoại lệ gửi lại: nguồn cho phép chép log gốc từ archive về session để gửi lại; không sửa nội dung. Hệ thống loại trùng.

**Event phải giữ:**

| Công cụ | Prompt | Tool | Lượt / phiên |
| --- | --- | --- | --- |
| Claude Code | `UserPromptSubmit` | `PostToolUse`, `PostToolUseFailure` | `Stop`, `SubagentStop`, `SessionStart` |
| Cursor | `beforeSubmitPrompt` | `postToolUse`, `postToolUseFailure` | `afterAgentResponse`, `stop` |
| Codex | `UserPromptSubmit` | `PostToolUse` | `Stop` |
| Gemini CLI | `BeforeAgent` | `AfterTool` | `AfterAgent`, `SessionEnd` |
| GitHub Copilot | `userPromptSubmitted` | `postToolUse`, `postToolUseFailure` | `agentStop`, `sessionEnd` |
| Antigravity | `PreInvocation` và transcript quét khi push | — | — |

### 2.2. Xác minh log đã đến BTC

[Nguồn: Đọc lại AI Log](https://docs.thucchien.ai/docs/round-2/api-reference/ai-log-entries).

Example:
```curl
curl -G 'https://live.thucchien.ai/api/ingest/entries' \
-H 'Authorization: Bearer <AI_LOG_API_KEY>' \
--data-urlencode 'limit=20' \
--data-urlencode 'tool=' \
--data-urlencode 'event='
```

### 2.3. Chuẩn bị năng lực, không chuẩn bị thành phẩm

**BẮT BUỘC / CẤM** — nguyên tắc đội xác nhận, đối chiếu phần 5–7 của transcript.

- **Được chuẩn bị năng lực:** tài khoản, công cụ, kỹ năng, môi trường, cấu hình harness, skill, prompt, script hỗ trợ và hạ tầng trống (server/hosting/domain).
- **Không được chuẩn bị thành phẩm:** mã nguồn, cấu trúc code sản phẩm, giao diện, dữ liệu hoặc asset cấu thành bài nộp làm sẵn; không dựng sẵn sản phẩm/template trên server để đưa nguyên vào bài.
- **Thành phẩm phải được tạo trong ca thi, trên Repo BTC cấp, bằng AI của Gateway BTC**, để BTC truy vết qua **audit log Gateway, lịch sử commit và AI Log**. Không nhập thành phẩm làm sẵn rồi chỉ sửa nhẹ để coi là sản phẩm tạo trong ca thi.
- Skill/script chuẩn bị trước phải phục vụ năng lực làm bài; không dùng chúng làm nơi chứa hoặc tự động chép ra thành phẩm đã chuẩn bị.
- Được tham khảo tài liệu, ý tưởng, ảnh/UI mẫu, thư viện, mã nguồn và dữ liệu bên ngoài; không suy rộng thành quyền chuẩn bị sẵn bộ mã/giao diện/dữ liệu cho bài nộp. Việc tạo và tích hợp thành phẩm từ nguồn tham khảo phải diễn ra trong ca thi, có dấu vết truy vết.
- Kiểm tra giấy phép và quyền tái sử dụng; tài nguyên có bản quyền không mặc nhiên được phép sao chép. Giữ nguồn gốc tài nguyên sử dụng.
- Được để AI tự động điền qua công cụ BTC cho phép và tìm kiếm Internet thông thường. Google AI summary xuất hiện mặc định được **tạm chấp nhận** theo hỏi đáp; không chủ động mở **AI Mode** hoặc AI bên thứ ba ngoài hệ thống được phép.
- Không nhận hỗ trợ từ người ngoài đội, kể cả điều khiển máy từ xa để làm hộ.

### 2.4. Tool, skill, MCP và AI trong sản phẩm

**BẮT BUỘC / CẤM** — transcript, phần 5 và hỏi đáp.

- Mọi năng lực mô hình AI, gồm sinh mã, suy luận, ảnh, video, âm thanh, embedding và AI tích hợp trong sản phẩm, phải dùng Gateway BTC hoặc công cụ chuyên biệt BTC cấp/cho phép.
- Không dùng key cá nhân, AI tích hợp ngoài hệ thống, mô hình local/tự host hoặc proxy để gọi AI ngoài Gateway; mã nguồn mở không tạo ngoại lệ.
- Được chọn IDE/harness/tool/MCP theo hành vi thực tế: đọc dữ liệu, thao tác web, đọc Figma qua API/MCP được phép nếu không gọi AI ngoài hệ thống; AI tạo giao diện ngoài Gateway bị cấm.
- Kiểm tra cả lời gọi AI ngầm của tool/skill/MCP. Tự host công cụ không dùng AI ngoài Gateway là khuyến nghị kiểm soát, không phải yêu cầu mọi MCP phải tự viết.
- Dùng skill vẫn phải ghi/gửi AI Log; không có ngoại lệ miễn log.

### 2.5. Repo và truy vết

**BẮT BUỘC / KHUYẾN NGHỊ** — transcript, phần 7.

- Source code phải đưa lên Repo BTC cấp; commit/push thường xuyên theo tiến độ, không dồn toàn bộ tới cuối ca thi. Cả hai máy làm bài phải có hook và xác nhận log đến hệ thống.
- BTC đối chiếu audit log Gateway, lịch sử commit, AI Log và dữ liệu giám sát; giữ bằng chứng gốc để giải trình khi không khớp.
- Bản triển khai phải khớp source và asset đã nộp; không đưa thêm thành phẩm không có căn cứ truy vết lên hosting.
- Rebase khi phối hợp hai máy không tự động bị coi là sửa log theo hỏi đáp; vẫn phải bảo toàn dữ liệu log nguyên bản.

## 3. Chọn agent theo khả năng thực sự dùng được

[Nguồn: Giới thiệu VibeCoding](https://docs.thucchien.ai/docs/round-2/vibe-coding/introduction)

Với `gpt-6-*`, tool calling khi reasoning phải dùng Responses API; dùng Chat Completions có thể lỗi 400.

## 4. Cách giao việc cho agent

**KHUYẾN NGHỊ** — [Nguồn: Best Practices](https://docs.thucchien.ai/docs/round-2/vibe-coding/best-practices).

- Viết hướng dẫn ngắn tại gốc repo: `AGENTS.md` cho Codex/OpenCode/Hermes/Cursor; `GEMINI.md` cho Gemini CLI/Antigravity CLI. Ghi lệnh kiểm tra, cấu trúc và giới hạn riêng của dự án.
- Việc lớn: yêu cầu đọc code, lập kế hoạch, duyệt rồi thực hiện từng bước kiểm chứng được.
- Mỗi phiên tập trung một việc; chỉ rõ file liên quan, lỗi nguyên văn và tiêu chí xong.
- Đọc diff/quyền xin chạy lệnh. Xem kỹ thao tác xóa, push, cài gói, gọi mạng; tránh cấp quyền thường trực quá rộng.
- Cảnh giác chỉ dẫn cài cắm trong web/file lạ.
- Kiểm tra bằng test và chạy luồng chính; với bug, tạo test tái hiện.
- Lưu commit trước việc lớn, commit nhỏ và dùng nhánh riêng.
- Hiểu code trước khi chấp nhận, nhất là dữ liệu người dùng, xác thực, thanh toán. Đội vẫn chịu trách nhiệm.

### Mẫu giao việc — đề xuất cho đội

```text
Mục tiêu: [một đầu ra cụ thể theo đề thi].
Phạm vi: [file/module được phép thay đổi].
Ràng buộc: đọc RULES.md; giữ nguyên cơ chế log; không truy cập bí mật.
Bước đầu: đọc các file liên quan, nêu kế hoạch và các giả định cần xác minh.
Tiêu chí hoàn thành: [hành vi quan sát được + lệnh kiểm tra].
Báo cáo cuối: thay đổi chính, kết quả kiểm tra thực tế, phần chưa hoàn thành.
```

## 5. Model, budget và quota

### 5.1. Gợi ý lựa chọn

**KHUYẾN NGHỊ** — [Nguồn: Codex](https://docs.thucchien.ai/docs/round-2/vibe-coding/codex-integration), [Hermes](https://docs.thucchien.ai/docs/round-2/vibe-coding/hermes-agent-integration).

| Nhu cầu | Gợi ý theo tài liệu |
| --- | --- |
| Việc thường ngày, ưu tiên tiết kiệm | `gpt-6-luna` trên agent tương thích; `deepseek-flash` cho tác vụ văn bản |
| Đọc nhiều file, ngữ cảnh dài | `gemini-3.5-flash` |
| Thiết kế khó, refactor lớn | `gpt-6.1-sol`, `gpt-6-sol`; `deepseek-v4-pro` là lựa chọn mạnh hơn Flash |
| Hermes cần gọi tool | Ưu tiên `deepseek-flash` hoặc Gemini phù hợp |

### 5.2. Theo dõi ở cấp đội

**LƯU Ý KỸ THUẬT** — [Nguồn: Kiểm tra chi tiêu](https://docs.thucchien.ai/docs/round-2/api-reference/spend-checking); transcript, phần 8.

- Theo training, đội có **50 USD chung cho hai key**: key làm bài và key tích hợp sản phẩm; không phải 50 USD mỗi key. Kiểm tra key chính thức và hạn mức ngay đầu ca; báo BTC khi lỗi.
- Phối hợp request giữa hai máy/agent, theo dõi chi phí và rate limit; tính cả chi phí chạy demo AI. Hạn chế context/tool không cần thiết và retry tốn tiền.
- Model/giá/quota phải đối chiếu bảng hiện hành; thông tin nhận dạng không rõ trong transcript không dùng làm bảng giá.

## 6. Lưu ý model và đầu ra khi agent triển khai sản phẩm

### 6.1. Reasoning và giới hạn sinh văn bản

**LƯU Ý KỸ THUẬT** — [Nguồn: OpenAI và DeepSeek](https://docs.thucchien.ai/docs/round-2/user-guide/openai-deepseek).

- OpenAI Chat Completions: dùng `max_completion_tokens`; Responses: `max_output_tokens`. `gpt-6*` không nhận `max_tokens`.
- Giới hạn quá thấp có thể hết token ở phần suy nghĩ và trả content rỗng. `temperature`/`top_p` không có tác dụng với nhóm OpenAI reasoning trên Gateway.
- `reasoning_effort` phải phù hợp model; không model nào trong bảng nhận `minimal`. `gpt-6.1-sol`/`gpt-6-astra` không nhận `none`; `o3`/`o4-mini` không nhận `xhigh`/`max`.
- DeepSeek bật thinking mặc định. Dùng `deepseek-flash`; alias cũ bị Gateway từ chối. JSON mode cần prompt nêu JSON/cấu trúc.
- DeepSeek không hỗ trợ ảnh đầu vào, sinh ảnh, âm thanh hoặc web search theo nguồn; tránh bắn hàng trăm request đồng thời.

[Nguồn bổ sung: Chat Completions](https://docs.thucchien.ai/docs/round-2/api-reference/text-generation).

`finish_reason=length` cho biết kết quả dừng vì giới hạn độ dài, không chứng minh nội dung hoàn chỉnh. `seed` chỉ giúp hệ thống cố gắng tái lập, không bảo đảm tuyệt đối. **Đề xuất:** kiểm tra định dạng, cú pháp và hành vi đầu ra trước khi dùng vào bài.

### 6.2. Tìm kiếm thông tin mới

**KHUYẾN NGHỊ / LƯU Ý** — [Nguồn: Web grounding](https://docs.thucchien.ai/docs/round-2/user-guide/google-search-grounding).

- Bật tìm kiếm khi cần dữ liệu mới; ghi ngày cụ thể và giữ nguồn để đối chiếu.
- Gemini sử dụng `googleSearch`; OpenAI sử dụng `web_search` qua Responses. DeepSeek không có web search tích hợp theo tài liệu.
- Không dựa vào `web_search_options` để mặc nhiên cho rằng tìm kiếm đã chạy; có trường hợp tham số bị bỏ qua.
- Với demo hiển thị câu trả lời được Google grounding, tài liệu nêu yêu cầu hiển thị Search Suggestions từ `searchEntryPoint.renderedContent`. Đây là yêu cầu nhà cung cấp được tài liệu nhắc tới.

**ĐỀ XUẤT CHO ĐỘI:** đối chiếu nguồn thực tế thay vì nhận một đường link do model tự viết là bằng chứng.

### 6.3. Ảnh

**LƯU Ý KỸ THUẬT** — [Nguồn: Sinh ảnh](https://docs.thucchien.ai/docs/round-2/user-guide/image-generation), [API sinh ảnh](https://docs.thucchien.ai/docs/round-2/api-reference/image-generation), [Ảnh qua chat](https://docs.thucchien.ai/docs/round-2/api-reference/image-generation-chat).

- Theo tài liệu, `nano-banana`/`gemini-2.5-flash-image` ngừng hỗ trợ từ **02/10/2026**. Chọn model còn hỗ trợ thay vì dùng tên cũ trong ví dụ.
- Nano Banana: `nano-banana-2-lite` ưu tiên tốc độ/giá; `nano-banana-2` là lựa chọn khác; `nano-banana-pro` ưu tiên chất lượng theo nguồn.
- Với API Nano Banana chuẩn: mỗi request một ảnh (`n=1`), dùng `aspect_ratio`; `size` không có tác dụng. OpenAI image dùng `size` và `quality` theo trang riêng.
- Ảnh chuẩn nằm ở `data[].b64_json`; ảnh qua chat nằm ở `message.images[].image_url.url` dạng data URL. Không chỉ đọc `message.content` rồi kết luận không có ảnh.
- Tài liệu có mẹo đổi nhẹ prompt khi gặp vấn đề cache; không tự coi mọi ảnh lặp là lỗi cache.

### 6.4. Video

**LƯU Ý KỸ THUẬT** — [Nguồn: Veo 3.1](https://docs.thucchien.ai/docs/round-2/user-guide/video-generation-veo3), [Tạo](https://docs.thucchien.ai/docs/round-2/api-reference/video-generation-start), [Trạng thái](https://docs.thucchien.ai/docs/round-2/api-reference/video-generation-status), [Tải](https://docs.thucchien.ai/docs/round-2/api-reference/video-generation-download).

- Chi phí phát sinh khi tạo tác vụ, kể cả không tải file. Mặc định 8 giây; tài liệu khuyên thử bản Lite 4 giây trước.
- Giữ ID tác vụ; theo dõi đến `completed` hoặc `failed`. Có thể kiểm tra khoảng 10 giây/lần; chỉ tải MP4 khi hoàn tất. Video 4–8 giây có thể mất từ khoảng 30 giây đến vài phút.
- Khi thất bại, đọc `error`; không tiếp tục chờ vô hạn.
- Video từ ảnh cần đầu vào file và request multipart; không dùng JSON cho trường hợp này.

**ĐỀ XUẤT CHO ĐỘI:** nếu chưa rõ tác vụ đã được tạo hay chưa, kiểm tra ID/trạng thái trước khi tạo lại để hạn chế tác vụ và chi phí trùng.

### 6.5. Âm thanh và embedding

**LƯU Ý KỸ THUẬT** — [STT](https://docs.thucchien.ai/docs/round-2/user-guide/speech-to-text), [TTS](https://docs.thucchien.ai/docs/round-2/user-guide/text-to-speech), [Embedding](https://docs.thucchien.ai/docs/round-2/user-guide/embeddings).

- STT nhận file multipart, trả văn bản ở `text`. `gpt-transcribe` cần `response_format=json` theo tài liệu.
- TTS trả file âm thanh. Chọn giọng đúng nhóm model: giọng OpenAI và Gemini không dùng thay thế tùy tiện.
- Lập chỉ mục và truy vấn embedding bằng cùng model; không so sánh vector từ các model khác nhau.
- `gemini-embedding-2`: mỗi request một đoạn; gửi danh sách nhiều đoạn chỉ trả một vector theo nguồn. Các model còn lại trong bảng hỗ trợ nhiều đoạn/request.

### 6.6. Hướng dẫn sử dụng Suno và OTP

[Nguồn: Hướng dẫn Suno](https://docs.thucchien.ai/docs/round-2/suno-login-guidelines), [Công cụ OTP](https://docs.thucchien.ai/docs/round-2/otp-generator).

**Đăng nhập và sử dụng Suno:**

1. Mở [Suno](https://suno.com/home), chọn **Sign In**.
2. Chọn đăng nhập bằng Microsoft; nhập email và mật khẩu BTC cấp.
3. Nếu được yêu cầu OTP, lấy mã theo hướng dẫn bên dưới và nhập vào màn hình xác thực.
4. Sau khi đăng nhập, dùng Suno để tạo nhạc, xem lịch sử bài hát và quản lý thư viện phục vụ bài thi.

**Lấy mã OTP:**

1. Mở [công cụ OTP của BTC](https://docs.thucchien.ai/docs/round-2/otp-generator).
2. Dán secret key Base32 của tài khoản vào ô **Secret Key**; không dùng key mẫu trên trang cho tài khoản thật.
3. Công cụ tạo mã sáu chữ số. Chọn **Copy** và nhập mã vào bước xác thực.
4. Mã tự đổi mỗi 30 giây; nếu mã hết hiệu lực, dùng mã mới.

**Bảo mật và xử lý lỗi:**

- Không chia sẻ thông tin đăng nhập/secret key; không đổi mật khẩu hoặc dùng **Forgot Password** cho tài khoản BTC.
- Nếu đăng nhập lỗi, kiểm tra thông tin, thử xóa cache/cookie hoặc đổi trình duyệt; vẫn lỗi thì liên hệ BTC.
- Theo tài liệu, công cụ OTP tính toán trong trình duyệt, không gửi secret key đến máy chủ. Không đưa secret key vào prompt hay log của agent.

## 7. Xử lý lỗi trong lúc thi

| Tình huống | Diễn giải và hành động |
| --- | --- |
| Gateway `401` | Kiểm tra xác thực/key; không đổi sang dịch vụ ngoài BTC. [Khái niệm cốt lõi](https://docs.thucchien.ai/docs/round-2/user-guide/core-concepts) |
| `429 Budget has been exceeded` | Đội hết ngân sách; retry liên tục không giải quyết được. [Codex](https://docs.thucchien.ai/docs/round-2/vibe-coding/codex-integration) |
| `429` do giới hạn tần suất/đồng thời | Giảm song song, chờ rồi thử lại có giới hạn; phân biệt với hết budget. [Quota](https://docs.thucchien.ai/docs/round-2/api-reference/spend-checking), [OpenAI/DeepSeek](https://docs.thucchien.ai/docs/round-2/user-guide/openai-deepseek) |
| `400 Function tools with reasoning_effort are not supported` | Kiểm tra cặp agent/model và giao thức; chọn Responses phù hợp hoặc Gemini/DeepSeek cho đường Chat Completions. [Hermes](https://docs.thucchien.ai/docs/round-2/vibe-coding/hermes-agent-integration), [OpenCode](https://docs.thucchien.ai/docs/round-2/vibe-coding/opencode-integration) |
| `404` hoặc model bị từ chối trong Gemini CLI | Chọn Gemini có trên Gateway. [Gemini CLI](https://docs.thucchien.ai/docs/round-2/vibe-coding/gemini-cli-integration) |
| Antigravity từ chối tên model | Chọn tên trong danh sách CLI; tên Gateway không nhất thiết là tên CLI nhận. [Antigravity](https://docs.thucchien.ai/docs/round-2/vibe-coding/antigravity-integration) |
| Log gửi lỗi / log không xuất hiện | Đối chiếu hướng dẫn AI Log và báo BTC nếu chưa giải quyết được; giữ bằng chứng gốc. [AI Log](https://docs.thucchien.ai/docs/round-2/ai-log-guide) |
| Thiếu khả năng model cần thiết | Chọn model/agent khác qua Gateway có khả năng đó, giữ đầy đủ log; không để agent tự vượt ràng buộc. Đây là đề xuất vận hành. |

**ĐỀ XUẤT CHO ĐỘI:** mỗi sự cố cần được xác định là lỗi bài làm, lỗi khả năng tương thích, xác thực, quota hay log trước khi sửa. Chỉ báo cáo đã kiểm tra khi thực sự chạy và quan sát được kết quả.

## 8. Thời gian và checklist bàn giao

**THEO TRAINING** — transcript, phần 4 và 10; đối chiếu đề và giao diện nộp chính thức.

- Làm bài **120 phút**, tiếp theo **10 phút nộp bài**; dừng phát triển thành phẩm ở T + 120, không tiếp tục sửa bài trong khung nộp. Chỉ submit **một lần**.
- Theo cuộc họp: tối đa **20 file**, tổng khoảng **500 MB**; định dạng và giới hạn chính xác xem trên giao diện. File lớn/vượt giới hạn phải báo giám thị; không tự suy ra phương án gửi ngoài.
- Trong 24 giờ sau phiên thi, gửi video thuyết trình và nội dung ghi hình theo form/hướng dẫn BTC; không suy đoán định dạng hoặc hạn riêng cho từng video.

**ĐỀ XUẤT CHO ĐỘI — agent trước khi báo hoàn thành:**

- [ ] Đối chiếu từng yêu cầu đề với tính năng và đầu ra; ghi rõ phần thiếu, không tự bịa tiêu chí chấm.
- [ ] Chạy kiểm tra phù hợp và luồng chính; chỉ báo kết quả thực sự quan sát được.
- [ ] Kiểm tra URL demo, source/asset cần nộp và sự khớp nhau giữa repo với bản triển khai.
- [ ] Kiểm tra lời gọi AI đúng hệ thống, nguồn tài nguyên và việc gửi log; không sửa log để bổ sung bằng chứng.
- [ ] Chuẩn bị danh sách URL/file đầy đủ trước hạn; thành viên kiểm tra và thực hiện submit cuối cùng.
