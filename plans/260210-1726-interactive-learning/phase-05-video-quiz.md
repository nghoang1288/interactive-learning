# Phase 05: Video Player + Quiz Integration
Status: ⬜ Pending
Dependencies: Phase 03 + Phase 04

## Objective
Xây dựng video player tùy chỉnh với tính năng core: dừng video tại timestamp → hiện quiz → đúng tiếp/sai xem lại.

## Tasks

### Custom Video Player
1. [ ] HTML5 Video Player wrapper component
2. [ ] Custom controls: play/pause, progress bar, volume, fullscreen
3. [ ] Khóa thanh tua (không cho tua qua timestamp quiz chưa trả lời)
4. [ ] Hiển thị markers trên progress bar tại vị trí các quiz

### Quiz Overlay
5. [ ] Tự động dừng video khi đến timestamp có quiz
6. [ ] Hiện quiz overlay (câu hỏi + các lựa chọn)
7. [ ] Xử lý đúng → đóng overlay, play tiếp
8. [ ] Xử lý sai → hiện thông báo sai, tua lại đoạn vừa xem (~1-2 phút trước), phải xem lại rồi trả lời lại

### Progress Tracking
9. [ ] Lưu vị trí xem hiện tại (resume khi quay lại)
10. [ ] Ghi nhận hoàn thành khi xem hết video + trả lời hết quiz

## Logic Chi Tiết

### Khi đến timestamp quiz:
```
Video playing at 5:00 → timestamp quiz = 5:00
  → Video pause
  → Show quiz overlay (câu hỏi + 4 đáp án)
  → Student chọn:
    → ĐÚNG: overlay đóng, video play tiếp từ 5:00
    → SAI:  overlay hiện "Sai rồi! Xem lại đoạn vừa rồi nhé!"
            → Video seek về ~3:00 (2 phút trước)
            → Video auto play
            → Khi đến 5:00 lần nữa → hiện quiz lại
            → Lặp cho đến khi đúng
```

### Khi hoàn thành:
```
Video ended + tất cả quiz đã đúng
  → POST /api/progress → completed = true
  → Hiện: "🎉 Chúc mừng! Bạn đã hoàn thành bài học!"
```

## Test Criteria
- [ ] Video dừng đúng tại timestamp
- [ ] Quiz overlay hiện đúng câu hỏi
- [ ] Đúng → tiếp tục mượt
- [ ] Sai → tua lại đúng đoạn, quiz hiện lại
- [ ] Không thể tua qua quiz chưa trả lời
- [ ] Hoàn thành → ghi nhận thành công

---
Next Phase: → phase-06-testing.md
