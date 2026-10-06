# Vòng chung khảo

Thư mục nộp bài / làm việc cho đội **Cơm Rang Dưa Bò** (`AITC-541`).

## Hướng dẫn

- Đặt toàn bộ source, tài liệu, demo liên quan **Vòng chung khảo** trong thư mục `chung-khao/` này.
- Có thể tạo nhánh riêng theo quy ước đội, nhưng **nội dung vòng này** phải nằm dưới `chung-khao/`.
- Không đẩy secret (API key, `.env`, password) lên repo.

```
chung-khao/
├── README.md          ← file này
└── tro-ly-dinh-duong/ ← ứng dụng Bữa Việt, một service Node.js
```

## Chạy Bữa Việt

```powershell
cd chung-khao/tro-ly-dinh-duong
pnpm install
pnpm dev
```

Giao diện và các endpoint AI chạy chung tại `http://127.0.0.1:5173`. Bản build: `pnpm build` rồi `pnpm start`. Backend Python `chat-core` đã được bỏ; frontend gọi `/api/*` trên chính service này. Cấu hình AI và hướng dẫn chi tiết ở [README ứng dụng](tro-ly-dinh-duong/README.md).
