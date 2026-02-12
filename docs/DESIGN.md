# 🎨 DESIGN: Interactive Learning Platform

Ngày tạo: 2026-02-10
Dựa trên: [SPECS](../specs/interactive_learning_spec.md) | [BRIEF](../BRIEF.md)

---

## 1. Cách Lưu Thông Tin (Database Schema)

### Sơ đồ tổng quan

App lưu trữ 6 loại thông tin chính, liên kết với nhau như sau:

```
┌──────────────────────────────────────────────────────────────┐
│  👤 USERS (Người dùng)                                       │
│  ├── Tên, Email, Mật khẩu (đã mã hóa)                       │
│  └── Vai trò: TEACHER hoặc STUDENT                          │
└────────┬───────────────────────────┬─────────────────────────┘
         │ Teacher tạo video         │ Student học video
         ▼                           ▼
┌────────────────────────┐   ┌─────────────────────────────────┐
│  🎬 VIDEOS             │   │  📈 PROGRESS (Tiến trình học)    │
│  ├── Tên bài giảng     │   │  ├── Đang xem đến giây thứ mấy │
│  ├── Mô tả             │   │  ├── Đã hoàn thành chưa?        │
│  ├── File video         │◄─┤  └── Hoàn thành lúc nào?         │
│  ├── Thời lượng (giây)  │   └─────────────────────────────────┘
│  └── Ngày tạo           │
└────────┬────────────────┘
         │ 1 video có nhiều câu hỏi
         ▼
┌────────────────────────┐   ┌─────────────────────────────────┐
│  ❓ QUIZZES (Câu hỏi)  │   │  📝 QUIZ RESULTS (Kết quả)      │
│  ├── Câu hỏi           │   │  ├── Student nào trả lời        │
│  ├── Dừng ở giây thứ?  │   │  ├── Chọn đáp án nào            │
│  └── Thuộc video nào   │   │  ├── Đúng hay sai?              │
└────────┬────────────────┘   │  └── Thử bao nhiêu lần?         │
         │ 1 câu hỏi có      └─────────────────────────────────┘
         │ nhiều đáp án
         ▼
┌────────────────────────┐
│  🔘 QUIZ OPTIONS       │
│  (Các lựa chọn)        │
│  ├── Nội dung đáp án   │
│  └── Có phải đáp án    │
│      đúng không?       │
└────────────────────────┘
```

### Chi tiết Prisma Schema

```prisma
// ===== ENUM =====
enum Role {
  TEACHER
  STUDENT
}

// ===== USERS =====
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String                        // bcrypt hash
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  videos      Video[]       // Teacher's videos
  progress    Progress[]    // Student's progress
  quizResults QuizResult[]  // Student's quiz answers
}

// ===== VIDEOS =====
model Video {
  id          String   @id @default(cuid())
  title       String
  description String?
  filename    String                       // original filename
  url         String                       // path to video file
  duration    Int                          // total seconds
  teacherId   String
  teacher     User     @relation(fields: [teacherId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  quizzes  Quiz[]
  progress Progress[]
}

// ===== QUIZZES =====
model Quiz {
  id        String   @id @default(cuid())
  videoId   String
  video     Video    @relation(fields: [videoId], references: [id], onDelete: Cascade)
  timestamp Int                            // seconds - khi nào dừng video
  question  String
  createdAt DateTime @default(now())

  // Relations
  options QuizOption[]
  results QuizResult[]
}

// ===== QUIZ OPTIONS =====
model QuizOption {
  id        String  @id @default(cuid())
  quizId    String
  quiz      Quiz    @relation(fields: [quizId], references: [id], onDelete: Cascade)
  text      String
  isCorrect Boolean @default(false)

  // Relations
  results QuizResult[]
}

// ===== PROGRESS =====
model Progress {
  id          String    @id @default(cuid())
  studentId   String
  student     User      @relation(fields: [studentId], references: [id])
  videoId     String
  video       Video     @relation(fields: [videoId], references: [id], onDelete: Cascade)
  currentTime Int       @default(0)        // seconds - đang xem đến đâu
  completed   Boolean   @default(false)
  completedAt DateTime?
  updatedAt   DateTime  @updatedAt

  @@unique([studentId, videoId])           // 1 student - 1 video = 1 progress
}

// ===== QUIZ RESULTS =====
model QuizResult {
  id         String     @id @default(cuid())
  studentId  String
  student    User       @relation(fields: [studentId], references: [id])
  quizId     String
  quiz       Quiz       @relation(fields: [quizId], references: [id], onDelete: Cascade)
  optionId   String
  option     QuizOption @relation(fields: [optionId], references: [id])
  isCorrect  Boolean
  attempts   Int        @default(1)        // số lần thử
  answeredAt DateTime   @default(now())

  @@unique([studentId, quizId])            // 1 student - 1 quiz = 1 result (cập nhật nếu thử lại)
}
```

### Quy tắc dữ liệu quan trọng

| Quy tắc | Chi tiết |
|---------|----------|
| 1 User = 1 Role | Không thể vừa Teacher vừa Student |
| 1 Quiz ≥ 2 Options | Phải có ít nhất 2 lựa chọn |
| 1 Quiz = đúng 1 đáp án đúng | Đúng 1 option có `isCorrect = true` |
| Quiz timestamp < Video duration | Không thể đặt quiz ngoài video |
| Progress unique per student-video | Mỗi student chỉ có 1 record tiến trình cho mỗi video |
| Cascade delete | Xóa video → tự xóa quizzes, options, progress, results |

---

## 2. Danh Sách Màn Hình

### 🏠 Landing Page (Public - ai cũng thấy)

| # | Tên | Mục đích |
|---|-----|----------|
| L1 | Trang chủ (Landing) | Giới thiệu platform + video demo cách hoạt động |

**Chi tiết trang Landing Page:**
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo] Interactive Learning          [Đăng nhập] [Đăng ký] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   🎓 Học video thông minh hơn                                │
│   với Quiz tương tác                                         │
│                                                              │
│   Teacher tạo bài giảng video + quiz.                        │
│   Student học và kiểm tra kiến thức ngay trong lúc xem.      │
│                                                              │
│   [Bắt đầu miễn phí]   [Xem demo ▶]                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   🎬 XEM CÁCH HOẠT ĐỘNG                                      │
│   ┌──────────────────────────────────────────────────┐       │
│   │                                                  │       │
│   │           VIDEO DEMO (~1-2 phút)                 │       │
│   │                                                  │       │
│   │   Nội dung demo:                                 │       │
│   │   • Teacher upload video + tạo quiz              │       │
│   │   • Student xem video, video dừng, quiz hiện     │       │
│   │   • Đúng → tiếp, Sai → xem lại                  │       │
│   │   • Hoàn thành → ghi nhận                        │       │
│   │                                                  │       │
│   │              ▶ Play Demo                         │       │
│   └──────────────────────────────────────────────────┘       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ✨ TÍNH NĂNG NỔI BẬT                                       │
│                                                              │
│   📹 Upload dễ dàng    ❓ Quiz tại timestamps                │
│   Teacher upload video  Câu hỏi tự động dừng                │
│   chỉ trong vài click   video để kiểm tra                   │
│                                                              │
│   🔄 Sai → Xem lại     � Thống kê chi tiết                 │
│   Buộc hiểu mới được    Biết ai học, ai hiểu,              │
│   đi tiếp               ai cần hỗ trợ                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   👩‍🏫 Bạn là giáo viên?        👨‍🎓 Bạn là học sinh?          │
│   [Đăng ký Teacher]           [Đăng ký Student]             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### �👤 Chung (Auth)

| # | Tên | Mục đích |
|---|-----|----------|
| A1 | Đăng ký | Tạo tài khoản mới (chọn Teacher/Student) |
| A2 | Đăng nhập | Vào app |

### 👩‍🏫 Teacher

| # | Tên | Mục đích |
|---|-----|----------|
| T1 | Dashboard | Tổng quan: số video, số student, thống kê nhanh |
| T2 | Danh sách video | Xem, sửa, xóa các video đã upload |
| T3 | Upload video | Upload file + nhập thông tin bài giảng |
| T4 | Quiz Editor | Xem video + tạo/sửa quiz tại timestamps |
| T5 | Thống kê video | Chi tiết: ai học, đúng/sai từng quiz |

### 👨‍🎓 Student

| # | Tên | Mục đích |
|---|-----|----------|
| S1 | Trang chủ | Danh sách bài giảng + tìm kiếm/lọc |
| S2 | Xem bài giảng | Video player + quiz overlay |
| S3 | Tiến trình | Danh sách bài đã học, % hoàn thành |

---

## 3. Luồng Hoạt Động

### 📍 Hành trình 1: Teacher tạo bài giảng

```
1️⃣ Login → Vào Dashboard (T1)
2️⃣ Click "Upload Video" → Mở trang Upload (T3)
3️⃣ Kéo thả file video + nhập tên + mô tả
4️⃣ Bấm "Upload" → Chờ upload xong
5️⃣ Tự động chuyển sang Quiz Editor (T4)
6️⃣ Xem video → Dừng tại vị trí muốn đặt quiz (~5 phút)
7️⃣ Click "Thêm câu hỏi" → Nhập câu hỏi + 4 đáp án
8️⃣ Đánh dấu đáp án đúng → Lưu
9️⃣ Lặp lại bước 6-8 cho các timestamp khác
🔟 Bấm "Xuất bản" → Video hiện cho Student
```

### 📍 Hành trình 2: Student học bài

```
1️⃣ Login → Vào trang chủ (S1)
2️⃣ Tìm kiếm hoặc duyệt danh sách bài giảng
3️⃣ Click vào bài muốn học → Mở trang xem (S2)
4️⃣ Video bắt đầu chạy
5️⃣ Đến phút 5:00 → Video TỰ ĐỘNG DỪNG
6️⃣ Quiz overlay hiện lên: câu hỏi + 4 đáp án
7️⃣ Student chọn 1 đáp án:

   ✅ ĐÚNG:
   → Overlay đóng
   → "Chính xác! 🎉" hiện 1 giây
   → Video play tiếp

   ❌ SAI:
   → "Sai rồi! Xem lại đoạn vừa rồi nhé 📖"
   → Video tua về phút 3:00 (2 phút trước quiz)
   → Video auto play
   → Đến 5:00 lần nữa → Quiz hiện lại
   → Lặp cho đến khi ĐÚNG

8️⃣ Video tiếp tục → đến quiz tiếp ở phút 10:00 → lặp lại
9️⃣ Video hết + tất cả quiz đúng → "🎉 Hoàn thành!"
```

### 📍 Hành trình 3: Student quay lại học tiếp

```
1️⃣ Login → Vào trang chủ (S1)
2️⃣ Thấy bài đang học dở (có progress bar ~50%)
3️⃣ Click vào → Video resume từ vị trí cũ
4️⃣ Các quiz đã trả lời đúng → skip qua, không hỏi lại
5️⃣ Tiếp tục học từ chỗ dừng
```

### Sơ đồ luồng Video Player (chi tiết kỹ thuật)

```
┌──────────────────────────────────────────────────────┐
│                   VIDEO PLAYER                        │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │              VIDEO CONTENT                      │  │
│  │                                                 │  │
│  │     ┌─────────────────────────────────┐        │  │
│  │     │     QUIZ OVERLAY (ẩn/hiện)      │        │  │
│  │     │                                 │        │  │
│  │     │  ❓ Câu hỏi xyz?               │        │  │
│  │     │                                 │        │  │
│  │     │  ○ Đáp án A                     │        │  │
│  │     │  ○ Đáp án B                     │        │  │
│  │     │  ○ Đáp án C                     │        │  │
│  │     │  ○ Đáp án D                     │        │  │
│  │     │                                 │        │  │
│  │     │  [  Trả lời  ]                  │        │  │
│  │     └─────────────────────────────────┘        │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ▶ ──●──────⬥─────────⬥──────────⬥──────── 45:00    │
│      0:00   5:00      10:00      15:00                │
│             ⬥ = Quiz markers (dots trên progress bar) │
│                                                       │
│  🔊 ━━━━━━━━━━━  ⛶ Fullscreen                        │
└──────────────────────────────────────────────────────┘

Note: Thanh tua bị khóa - không thể kéo qua quiz chưa trả lời
```

---

## 4. API Endpoints Chi Tiết

### Auth

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/api/auth/register` | `{name, email, password, role}` | `{user, token}` | - |
| POST | `/api/auth/[...nextauth]` | NextAuth handles | `session` | - |

### Videos (Teacher)

| Method | Endpoint | Body/Params | Response | Auth |
|--------|----------|-------------|----------|------|
| POST | `/api/videos` | FormData: `{title, description, file}` | `{video}` | Teacher |
| GET | `/api/videos` | Query: `?page=1` | `{videos[], total}` | Teacher |
| GET | `/api/videos/[id]` | - | `{video, quizzes[]}` | Auth |
| PATCH | `/api/videos/[id]` | `{title?, description?}` | `{video}` | Teacher (owner) |
| DELETE | `/api/videos/[id]` | - | `{success}` | Teacher (owner) |

### Quizzes (Teacher)

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/api/videos/[id]/quizzes` | `{timestamp, question, options[]}` | `{quiz}` | Teacher (owner) |
| PUT | `/api/quizzes/[id]` | `{question?, options[]?}` | `{quiz}` | Teacher |
| DELETE | `/api/quizzes/[id]` | - | `{success}` | Teacher |

### Lessons (Student)

| Method | Endpoint | Params | Response | Auth |
|--------|----------|--------|----------|------|
| GET | `/api/lessons` | `?search=&page=1` | `{lessons[], total}` | Student |
| GET | `/api/lessons/[videoId]` | - | `{video, quizzes[], progress?}` | Student |

### Progress (Student)

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/api/progress/[videoId]` | `{currentTime}` | `{progress}` | Student |
| POST | `/api/progress/[videoId]/complete` | - | `{progress}` | Student |
| GET | `/api/progress` | - | `{progress[]}` | Student |

### Quiz Results (Student)

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/api/quiz-results` | `{quizId, optionId}` | `{isCorrect, attempts}` | Student |

### Stats (Teacher)

| Method | Endpoint | Params | Response | Auth |
|--------|----------|--------|----------|------|
| GET | `/api/stats/overview` | - | `{totalVideos, totalStudents, completionRate}` | Teacher |
| GET | `/api/stats/videos/[id]` | - | `{students[], quizStats[]}` | Teacher (owner) |

---

## 5. Checklist Kiểm Tra (Acceptance Criteria)

### ✅ Đăng ký / Đăng nhập

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Đăng ký với email + password + chọn role → thành công | ☐ |
| 2 | Đăng ký email đã tồn tại → báo lỗi | ☐ |
| 3 | Password < 6 ký tự → báo lỗi | ☐ |
| 4 | Login đúng → vào dashboard | ☐ |
| 5 | Login sai → báo lỗi rõ ràng | ☐ |
| 6 | Teacher không vào được trang Student | ☐ |
| 7 | Student không vào được trang Teacher | ☐ |

### ✅ Upload Video (Teacher)

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Upload video MP4 → lưu thành công | ☐ |
| 2 | File > 500MB → báo lỗi | ☐ |
| 3 | File không phải video → báo lỗi | ☐ |
| 4 | Thiếu tên bài giảng → báo lỗi | ☐ |
| 5 | Upload xong → chuyển sang Quiz Editor | ☐ |

### ✅ Tạo Quiz (Teacher)

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Click vào timeline → tạo quiz tại timestamp đó | ☐ |
| 2 | Nhập câu hỏi + 4 đáp án + chọn đúng → lưu OK | ☐ |
| 3 | Không chọn đáp án đúng → báo lỗi | ☐ |
| 4 | Chưa đủ 2 đáp án → báo lỗi | ☐ |
| 5 | Quiz markers hiện trên progress bar | ☐ |
| 6 | Sửa quiz → cập nhật OK | ☐ |
| 7 | Xóa quiz → xóa khỏi timeline | ☐ |

### ✅ Xem Video + Quiz (Student - CORE)

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Video dừng đúng tại timestamp quiz | ☐ |
| 2 | Quiz overlay hiện lên với câu hỏi đúng | ☐ |
| 3 | Chọn đúng → overlay đóng, video tiếp tục | ☐ |
| 4 | Chọn sai → video tua về ~2 phút trước | ☐ |
| 5 | Sau khi tua lại, đến timestamp → quiz hiện lại | ☐ |
| 6 | Không thể tua qua quiz chưa trả lời | ☐ |
| 7 | Video hết + all quizzes đúng → ghi nhận hoàn thành | ☐ |
| 8 | Thoát giữa chừng → lần sau resume đúng vị trí | ☐ |
| 9 | Quiz đã đúng rồi → không hỏi lại khi resume | ☐ |

### ✅ Dashboard Teacher

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Hiện số video đã upload | ☐ |
| 2 | Hiện tổng số student đang học | ☐ |
| 3 | Xem chi tiết video: danh sách student đã học | ☐ |
| 4 | Xem tỉ lệ đúng/sai cho từng quiz | ☐ |

### ✅ Tiến trình Student

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Hiện danh sách bài đã học | ☐ |
| 2 | Hiện % hoàn thành mỗi bài | ☐ |
| 3 | Bài hoàn thành có đánh dấu ✅ | ☐ |
| 4 | Click vào bài dở → vào học tiếp | ☐ |

### ✅ Landing Page

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Trang hiện đúng khi chưa đăng nhập | ☐ |
| 2 | Video demo play được | ☐ |
| 3 | Nút "Đăng ký" chuyển đến trang đăng ký | ☐ |
| 4 | Nút "Đăng nhập" chuyển đến trang login | ☐ |
| 5 | Responsive: hiển thị đẹp trên mobile | ☐ |

### ✅ Tìm kiếm / Lọc

| # | Điều kiện | Passed? |
|---|----------|---------|
| 1 | Search theo tên bài → ra kết quả đúng | ☐ |
| 2 | Không tìm thấy → hiện "Không có kết quả" | ☐ |
| 3 | Search nhanh (< 500ms) | ☐ |

---

## 6. Test Cases

### TC-01: Student học bài - Happy Path
```
Given: Student đã login, có 1 video với quiz ở 5:00
When:  Chọn bài → Xem video → Đến 5:00 → Chọn đáp án đúng → Video hết
Then:  ✓ Video dừng tại 5:00
       ✓ Quiz hiện lên
       ✓ Chọn đúng → video tiếp
       ✓ Video hết → "Hoàn thành!"
       ✓ Progress = completed
```

### TC-02: Student trả lời sai → xem lại
```
Given: Student đang xem video, quiz ở 5:00
When:  Đến 5:00 → Chọn đáp án SAI
Then:  ✓ Hiện "Sai rồi!"
       ✓ Video tua về ~3:00
       ✓ Video auto play
       ✓ Đến 5:00 → quiz hiện lại
       ✓ attempts +1
```

### TC-03: Student thoát giữa chừng
```
Given: Student đang xem video ở 7:30, quiz ở 5:00 đã đúng
When:  Đóng trình duyệt → Mở lại → Vào bài
Then:  ✓ Video resume từ 7:30
       ✓ Quiz ở 5:00 không hỏi lại
```

### TC-04: Teacher tạo quiz
```
Given: Teacher đã upload video 15 phút
When:  Click vào 5:00 → Nhập "2+2=?" → Thêm 4 đáp án → Chọn "4" là đúng → Lưu
Then:  ✓ Quiz marker hiện ở 5:00
       ✓ Quiz lưu trong database
       ✓ Student xem video → dừng ở 5:00
```

### TC-05: Upload video quá lớn
```
Given: Teacher ở trang upload
When:  Chọn file 600MB
Then:  ✓ Hiện lỗi "File quá lớn, tối đa 500MB"
       ✓ Không upload
```

---

*Tạo bởi AWF - Design Phase | 2026-02-10*
