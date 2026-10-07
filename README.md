# Ôn tập Triết học Mác - Lênin (BAS 123)

Web ôn trắc nghiệm tĩnh (HTML + CSS + JavaScript thuần), không cần cài đặt hay máy chủ.

## Tính năng
- Chia 3 chương, mỗi chương chọn cả chương hoặc từng mục nhỏ.
- **Ôn chương**: làm từng câu, có đáp án ngay. Chọn sai sẽ hiện nút **Làm lại từ đầu**, xáo ngẫu nhiên thứ tự câu (và thứ tự đáp án).
- **Ôn tổng hợp**: 40 câu ngẫu nhiên từ 600 câu, có đồng hồ, bảng chọn câu, nộp bài, điểm thang 10 và xem lại bài.
- **Làm tiếp**: đang ôn chương hoặc làm đề tổng hợp dở thì bấm *Lưu & thoát* (hoặc đóng tab), lần sau về Trang chủ bấm **▶ Làm tiếp** là vào đúng câu đang làm, giữ nguyên điểm và thời gian.
- **Ôn câu sai**: tự gom các câu từng làm sai (lưu trong trình duyệt).
- **Tra cứu**: tìm câu hỏi theo từ khoá (không cần gõ dấu), xem đáp án đúng.
- Phím tắt: `1-4` hoặc `A-D` chọn đáp án, `Enter` câu tiếp, `R` làm lại từ đầu.
- Giao diện sáng/tối, dùng tốt trên điện thoại.

## Cấu trúc file
| File | Vai trò |
|---|---|
| `index.html` | Khung trang |
| `style.css` | Giao diện |
| `app.js` | Logic: chọn chương, xáo câu, chấm điểm, lưu tiến độ |
| `questions.js` | Dữ liệu 600 câu hỏi và đáp án |

Mỗi câu trong `questions.js` có dạng:
```js
{"lv":1,"id":"c1-1","ch":1,"n":1,"q":"Nội dung câu hỏi","o":["A","B","C","D"],"a":2}
```
`a` là vị trí đáp án đúng (0 = A, 1 = B, 2 = C, 3 = D). Muốn sửa đáp án chỉ cần đổi số `a`.

## Đưa lên GitHub Pages
1. Tạo tài khoản và đăng nhập https://github.com
2. Bấm **New repository**, đặt tên (ví dụ `on-triet-mac-lenin`), chọn **Public**, bấm **Create repository**.
3. Bấm **uploading an existing file**, kéo cả 5 file (`index.html`, `style.css`, `app.js`, `questions.js`, `README.md`) vào, bấm **Commit changes**.
4. Vào **Settings → Pages**. Ở mục *Build and deployment*, chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)`, bấm **Save**.
5. Đợi 1-2 phút, trang sẽ có địa chỉ `https://<tên-tài-khoản>.github.io/on-triet-mac-lenin/`. Gửi link này cho học sinh.

Chạy thử trên máy: mở `index.html` bằng trình duyệt là được.

## Lưu ý
File đề gốc không kèm đáp án, nên đáp án trong `questions.js` được lập theo giáo trình Triết học Mác - Lênin. Giảng viên nên rà lại, nhất là các câu có nhiều đáp án gần giống nhau.
