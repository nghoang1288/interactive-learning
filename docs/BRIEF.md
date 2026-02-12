# 💡 BRIEF: Interactive Learning

**Ngày tạo:** 2026-02-10
**Loại sản phẩm:** Web App

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Học video truyền thống rất thụ động - student xem xong không nhớ gì, không có cách kiểm tra liệu họ có thực sự hiểu bài hay không.

## 2. GIẢI PHÁP ĐỀ XUẤT

Web app cho phép Teacher upload video bài giảng và chèn câu hỏi trắc nghiệm tại các mốc thời gian (~5 phút/lần). Video sẽ tự động dừng để hiện quiz:
- **Đúng** → học tiếp
- **Sai** → buộc xem lại đoạn vừa học rồi trả lời lại

Cơ chế "sai → xem lại" khác biệt với đối thủ, buộc student phải thực sự hiểu mới được đi tiếp.

## 3. ĐỐI TƯỢNG SỬ DỤNG

- **Teacher:** Upload video, tạo quiz, xem thống kê học sinh
- **Student:** Xem video, trả lời quiz, theo dõi tiến trình

## 4. NGHIÊN CỨU THỊ TRƯỜNG

### Đối thủ:

| App | Điểm mạnh | Điểm yếu |
|-----|-----------|----------|
| Edpuzzle | Dễ dùng, phổ biến nhất | Giới hạn miễn phí, chỉ hiện đáp án rồi qua |
| PlayPosit | Nhiều loại câu hỏi, branching | Giao diện phức tạp, giá cao |
| H5P | Miễn phí, open-source | Cần tự host, khó dùng |
| Nearpod | Đa dạng tool tương tác | Nặng, nhiều tính năng gây rối |

### Điểm khác biệt của mình:

- **"Sai → xem lại"**: Buộc student hiểu mới được tiếp, không cho qua như đối thủ
- **Đơn giản**: Chỉ focus video + quiz, không phình to tính năng
- **Thị trường**: $9.8B vào 2033, tăng trưởng 12.5%/năm

## 5. TÍNH NĂNG MVP

### 👤 Hệ thống User:
- [ ] Đăng ký / đăng nhập (Teacher & Student)
- [ ] Phân quyền Teacher vs Student

### 🎬 Teacher - Tạo bài giảng:
- [ ] Upload video bài giảng
- [ ] Tạo câu hỏi trắc nghiệm tại các timestamp (~5 phút/lần)
- [ ] Dashboard xem thống kê: bao nhiêu student học, ai đúng/sai

### 📖 Student - Học bài:
- [ ] Xem danh sách bài giảng + tìm kiếm/lọc
- [ ] Xem video, tự dừng tại timestamp hiện quiz
- [ ] Đúng → tiếp tục | Sai → rewatch đoạn vừa xem rồi trả lời lại
- [ ] Ghi nhận hoàn thành khi học hết video
- [ ] Xem tiến trình học của mình

### 💭 Backlog (Cân nhắc sau):
- [ ] AI tự gợi ý câu hỏi từ nội dung video
- [ ] Gamification (điểm, badge, leaderboard)
- [ ] Bình luận / thảo luận trên bài giảng

## 6. ƯỚC TÍNH SƠ BỘ

- **Độ phức tạp:** Trung bình
- **Rủi ro:** Upload/streaming video cần storage + bandwidth, cần thiết kế video player custom

## 7. BƯỚC TIẾP THEO

→ Chạy `/plan` để lên thiết kế chi tiết
