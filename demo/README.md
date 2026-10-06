# Việt Nam Bốn Mùa Hoa Trái — Frontend demo

Landing page HTML, CSS, JavaScript thuần dựa trên `../DESIGN.md`, không cần cài dependency hoặc backend.

## Mở trang

Mở `index.html` bằng trình duyệt. Hoặc chạy từ thư mục `demo`:

```powershell
python -m http.server 5500
```

Sau đó truy cập `http://localhost:5500`.

## Tính năng

- Responsive cho desktop, tablet, mobile; menu mobile.
- Lọc sản phẩm, tìm kiếm tiếng Việt có hoặc không dấu.
- Thêm sản phẩm, thay đổi số lượng, giỏ hàng lưu bằng localStorage.
- Biểu mẫu email với trạng thái lỗi, loading và thành công mô phỏng.
- Điều hướng bàn phím, focus-visible, dialog native và reduced motion.

## Thiết kế

CSS dùng semantic tokens với màu nâu `#67350a`, kem `#f1f3e6`, xanh `#61ce70` và font hệ thống theo DESIGN.md. Bổ sung token khoảng cách cho bố cục landing page, cỡ chữ display responsive và xanh đậm để bảo đảm khả năng đọc. Nội dung, tên sản phẩm, giá và vùng trồng dùng để minh họa giao diện; không kết nối dữ liệu bán hàng. Biểu mẫu không gửi hoặc lưu email.

Ảnh minh họa từ Unsplash, lưu tại `assets/` để trang không cần tải ảnh bên ngoài khi chạy. Các ảnh không xác nhận xuất xứ của sản phẩm.

- Hero: https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b
- Xoài: https://images.unsplash.com/photo-1553279768-865429fa0078
- Cam: https://images.unsplash.com/photo-1547514701-42782101795e
- Bơ: https://images.unsplash.com/photo-1523049673857-eb18f1d7b578
- Dâu: https://images.unsplash.com/photo-1464965911861-746a04b4bca6

Không hỗ trợ đặt hàng hoặc thanh toán. Dữ liệu giỏ hàng có thể xóa bằng cách xóa dữ liệu trang trong trình duyệt.
