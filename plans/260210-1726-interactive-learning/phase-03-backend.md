# Phase 03: Backend API
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Xây dựng tất cả API endpoints cho Teacher và Student.

## Tasks

### Video API (Teacher)
1. [ ] POST `/api/videos/upload` - Upload video (multipart/form-data)
2. [ ] GET `/api/videos` - List videos của teacher
3. [ ] GET `/api/videos/[id]` - Chi tiết video
4. [ ] DELETE `/api/videos/[id]` - Xóa video
5. [ ] PATCH `/api/videos/[id]` - Sửa thông tin video

### Quiz API (Teacher)
6. [ ] POST `/api/videos/[id]/quizzes` - Tạo quiz tại timestamp
7. [ ] GET `/api/videos/[id]/quizzes` - List quizzes của video
8. [ ] PUT `/api/quizzes/[id]` - Sửa quiz
9. [ ] DELETE `/api/quizzes/[id]` - Xóa quiz

### Student API
10. [ ] GET `/api/lessons` - Danh sách bài giảng (tìm kiếm/lọc)
11. [ ] POST `/api/progress/[videoId]` - Cập nhật tiến trình (currentTime)
12. [ ] POST `/api/quiz-results` - Submit đáp án quiz
13. [ ] GET `/api/progress` - Tiến trình học tập của student

### Teacher Dashboard API
14. [ ] GET `/api/stats/videos/[id]` - Thống kê: bao nhiêu student, đúng/sai

## Test Criteria
- [ ] Upload video → file lưu thành công
- [ ] CRUD quiz hoạt động
- [ ] Submit quiz → ghi nhận đúng/sai
- [ ] API trả về lỗi rõ ràng khi thiếu dữ liệu

---
Next Phase: → phase-04-frontend.md
