# Interactive Learning Platform - Specification

## Executive Summary
Web app cho phép Teacher upload video bài giảng và chèn quiz trắc nghiệm tại các timestamps. Student xem video, trả lời quiz (đúng → tiếp, sai → xem lại đoạn vừa học). Hoàn thành video = ghi nhận thành công.

## User Stories

### Teacher
- Là Teacher, tôi muốn đăng ký tài khoản giáo viên để tạo bài giảng
- Là Teacher, tôi muốn upload video để student có thể học
- Là Teacher, tôi muốn tạo câu hỏi trắc nghiệm tại các mốc thời gian để kiểm tra student
- Là Teacher, tôi muốn xem thống kê để biết ai đang học, ai đúng/sai

### Student
- Là Student, tôi muốn đăng ký tài khoản để bắt đầu học
- Là Student, tôi muốn tìm kiếm và chọn bài giảng để học
- Là Student, tôi muốn xem video và trả lời quiz để kiểm tra kiến thức
- Là Student, tôi muốn xem tiến trình để biết mình đã học được bao nhiêu

## Database Design (Sơ bộ)

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Users     │     │   Videos     │     │   Quizzes     │
│─────────────│     │──────────────│     │───────────────│
│ id          │──┐  │ id           │──┐  │ id            │
│ name        │  │  │ title        │  │  │ videoId (FK)  │
│ email       │  ├──│ teacherId(FK)│  ├──│ timestamp     │
│ password    │  │  │ description  │  │  │ question      │
│ role        │  │  │ url          │  │  └───────┬───────┘
│ createdAt   │  │  │ duration     │  │          │
└─────────────┘  │  │ createdAt    │  │  ┌───────┴───────┐
                 │  └──────────────┘  │  │ QuizOptions   │
                 │                    │  │───────────────│
                 │  ┌──────────────┐  │  │ id            │
                 │  │  Progress    │  │  │ quizId (FK)   │
                 │  │──────────────│  │  │ text          │
                 └──│ studentId(FK)│  │  │ isCorrect     │
                    │ videoId (FK) │──┘  └───────────────┘
                    │ currentTime  │
                    │ completed    │  ┌───────────────┐
                    │ completedAt  │  │ QuizResults   │
                    └──────────────┘  │───────────────│
                                      │ id            │
                                      │ studentId(FK) │
                                      │ quizId (FK)   │
                                      │ optionId (FK) │
                                      │ isCorrect     │
                                      │ attempts      │
                                      └───────────────┘
```

## Logic Flowchart

### Student Watch Flow
```
Start → Chọn bài → Load video + quizzes
  → Video playing
  → Đến timestamp quiz?
    → YES → Pause video → Show quiz overlay
      → Student chọn đáp án
        → ĐÚNG → Đóng overlay → Resume video
        → SAI → Thông báo sai → Seek lại ~2 phút trước → Auto play → Lặp lại
  → Video ended + all quizzes correct?
    → YES → Mark completed ✅
    → NO → Chờ quiz cuối
```

### Teacher Upload Flow
```
Start → Upload video → Video processing
  → Xem video → Click vào timeline để đặt quiz
  → Nhập câu hỏi + 4 đáp án + đánh dấu đáp án đúng
  → Save → Publish
```

## API Contract

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | /api/auth/register | Đăng ký | Public |
| POST | /api/auth/login | Đăng nhập | Public |
| POST | /api/videos/upload | Upload video | Teacher |
| GET | /api/videos | List videos | Teacher |
| GET | /api/videos/[id] | Chi tiết video | Auth |
| DELETE | /api/videos/[id] | Xóa video | Teacher |
| POST | /api/videos/[id]/quizzes | Tạo quiz | Teacher |
| GET | /api/videos/[id]/quizzes | List quizzes | Auth |
| PUT | /api/quizzes/[id] | Sửa quiz | Teacher |
| DELETE | /api/quizzes/[id] | Xóa quiz | Teacher |
| GET | /api/lessons | Danh sách bài (search/filter) | Student |
| POST | /api/progress/[videoId] | Cập nhật tiến trình | Student |
| POST | /api/quiz-results | Submit đáp án | Student |
| GET | /api/progress | Tiến trình học tập | Student |
| GET | /api/stats/videos/[id] | Thống kê video | Teacher |

## Tech Stack
- **Runtime:** Node.js 20+
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials Provider)
- **Styling:** TailwindCSS
- **Video:** HTML5 Video API (custom player)
- **File Upload:** Next.js API Routes (multipart)

## Hidden Requirements (Tình huống đặc biệt)
1. Student thoát giữa chừng → Lưu currentTime, lần sau resume
2. Video upload giới hạn 500MB
3. Khóa thanh tua qua quiz chưa trả lời
4. Teacher xóa video → Student không thấy video trong danh sách nữa
5. Quiz timestamp phải nằm trong duration của video
6. Mỗi quiz phải có ít nhất 2 options và đúng 1 đáp án đúng
