# Phase 02: Database + Authentication
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Thiết kế database schema và hệ thống đăng ký/đăng nhập với phân quyền Teacher/Student.

## Tasks

### Database Schema
1. [ ] Thiết kế Prisma schema: User, Video, Quiz, QuizOption, Progress
2. [ ] Tạo relationships giữa các tables
3. [ ] Chạy `prisma migrate` tạo database
4. [ ] Tạo seed data để test

### Authentication
5. [ ] Setup NextAuth.js với Credentials Provider (email/password)
6. [ ] Tạo trang Register (chọn role: Teacher/Student)
7. [ ] Tạo trang Login
8. [ ] Middleware bảo vệ routes theo role
9. [ ] Hash password với bcrypt
10. [ ] Session management

## Database Tables (Sơ bộ)
```
Users       → id, name, email, password, role (TEACHER/STUDENT)
Videos      → id, title, description, url, duration, teacherId
Quizzes     → id, videoId, timestamp, question
QuizOptions → id, quizId, text, isCorrect
Progress    → id, studentId, videoId, currentTime, completed, completedAt
QuizResults → id, studentId, quizId, selectedOptionId, isCorrect, attempts
```

> ⚠️ Chi tiết schema sẽ được thiết kế kỹ hơn trong `/design`

## Test Criteria
- [ ] Đăng ký tài khoản Teacher thành công
- [ ] Đăng ký tài khoản Student thành công
- [ ] Login/Logout hoạt động
- [ ] Teacher không vào được trang Student và ngược lại

---
Next Phase: → phase-03-backend.md
