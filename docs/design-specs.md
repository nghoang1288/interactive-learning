# Design Specifications - Interactive Learning
**Style:** Coursera-inspired (Clean, Professional, Education-focused)
**Created:** 2026-02-10

---

## 🎨 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#0056D2` | Buttons, links, nav active states |
| Primary Dark | `#003E99` | Hover states, active buttons |
| Primary Light | `#E8F0FE` | Success badges bg, selected items |
| Secondary | `#1F1F1F` | Headings, important text |
| Accent Green | `#198754` | Success, completed, correct answer |
| Accent Red | `#DC3545` | Error, wrong answer |
| Accent Orange | `#F5A623` | Warning, in-progress |
| Background | `#FFFFFF` | Main background |
| Background Gray | `#F5F5F5` | Page background, section bg |
| Surface | `#FFFFFF` | Cards, modals |
| Border | `#E0E0E0` | Card borders, dividers |
| Text Primary | `#1F1F1F` | Headings, body text |
| Text Secondary | `#636363` | Subtitles, descriptions |
| Text Muted | `#8C8C8C` | Timestamps, meta info |

---

## 📝 Typography

**Font Family:** `"Source Sans Pro", "Roboto", sans-serif` (giống Coursera)

| Element | Size | Weight | Color | Line Height |
|---------|------|--------|-------|-------------|
| H1 (Page title) | 32px | 700 | #1F1F1F | 1.25 |
| H2 (Section title) | 24px | 700 | #1F1F1F | 1.3 |
| H3 (Card title) | 18px | 600 | #1F1F1F | 1.4 |
| Body | 16px | 400 | #1F1F1F | 1.6 |
| Body Small | 14px | 400 | #636363 | 1.5 |
| Caption | 12px | 400 | #8C8C8C | 1.4 |
| Button | 14px | 600 | #FFFFFF | 1 |
| Nav Link | 14px | 600 | #636363 | 1 |

---

## 📐 Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Icon gaps |
| `--space-sm` | 8px | Tight spacing, badge padding |
| `--space-md` | 16px | Default padding, gaps |
| `--space-lg` | 24px | Card padding, section gaps |
| `--space-xl` | 32px | Section margins |
| `--space-2xl` | 48px | Page section spacing |
| `--space-3xl` | 64px | Hero section spacing |

---

## 🔲 Border & Radius

| Element | Radius | Border |
|---------|--------|--------|
| Button | 4px | none |
| Card | 8px | 1px solid #E0E0E0 |
| Input | 4px | 1px solid #E0E0E0 |
| Modal | 12px | none |
| Avatar | 50% | 2px solid #E0E0E0 |
| Badge | 12px | none |
| Progress bar | 4px | none |

---

## 🌫️ Shadows

| Name | Value | Usage |
|------|-------|-------|
| Card | `0 2px 4px rgba(0,0,0,0.08)` | Cards on hover |
| Dropdown | `0 4px 12px rgba(0,0,0,0.1)` | Dropdowns, menus |
| Modal | `0 8px 24px rgba(0,0,0,0.15)` | Modals, quiz overlay |
| Navbar | `0 1px 0 rgba(0,0,0,0.08)` | Bottom border effect |

---

## 📱 Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | 1 column, hamburger menu |
| Tablet | 768-1024px | 2 columns |
| Desktop | > 1024px | 3 columns, sidebar |

---

## ✨ Animations

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| Hover | 200ms | ease | Button hover, card hover |
| Transition | 300ms | ease-in-out | Page transitions, overlay |
| Slide-up | 400ms | cubic-bezier(0.4,0,0.2,1) | Quiz overlay appear |
| Progress | 600ms | ease | Progress bar fill |
| Fade-in | 300ms | ease | Content load |

---

## 🖼️ Component Specifications

### Navbar
```
Height: 64px
Background: #FFFFFF
Border-bottom: 1px solid #E0E0E0
Logo: 32px height, left-aligned
Search bar: 400px width, centered (desktop only)
Nav items: right-aligned
Padding: 0 24px
```

### Lesson Card (Student trang chủ)
```
Width: 100% (grid column)
Border: 1px solid #E0E0E0
Border-radius: 8px
Overflow: hidden
Hover: translateY(-2px) + shadow

┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │     THUMBNAIL (16:9)      │  │
│  │     200px height          │  │
│  │     cover, object-fit     │  │
│  │     Duration badge ──┐    │  │
│  │                      │    │  │
│  └──────────────────[15:30]──┘  │
│                                 │
│  Padding: 16px                  │
│                                 │
│  📖 Lesson Title (H3, 18px)    │
│  👤 Teacher Name (14px, gray)  │
│                                 │
│  ▓▓▓▓▓▓▓░░░░░ 60%              │
│  Progress bar (4px height)      │
│  Green = completed portion      │
│                                 │
└─────────────────────────────────┘
```

### Primary Button
```
Background: #0056D2
Color: #FFFFFF
Padding: 10px 24px
Border-radius: 4px
Font: 14px, 600 weight
Hover: background #003E99
Active: scale(0.98)
Disabled: opacity 0.5, cursor not-allowed
```

### Secondary Button (Outlined)
```
Background: transparent
Color: #0056D2
Border: 1px solid #0056D2
Padding: 10px 24px
Border-radius: 4px
Hover: background #E8F0FE
```

### Quiz Overlay (trên video)
```
Position: absolute, full video area
Background: rgba(0,0,0,0.7)
Content box:
  Background: #FFFFFF
  Border-radius: 12px
  Padding: 32px
  Max-width: 520px
  Centered (flex)
  Shadow: modal shadow
  Animation: slide-up 400ms

Question: H2, 24px, bold
Options: clickable cards
  Padding: 16px
  Border: 2px solid #E0E0E0
  Border-radius: 8px
  Hover: border-color #0056D2, bg #E8F0FE
  Selected: border-color #0056D2, bg #E8F0FE
  Correct (after): border-color #198754, bg #D1E7DD
  Wrong (after): border-color #DC3545, bg #F8D7DA
  Gap between options: 12px
Submit button: full-width primary button
```

### Video Player
```
Width: 100% of content area (max 900px)
Aspect ratio: 16:9
Background: #000000
Border-radius: 8px (top)
Controls bar:
  Height: 48px
  Background: #1F1F1F
  Border-radius: 0 0 8px 8px

Progress bar:
  Height: 4px (expand to 8px on hover)
  Background: #636363
  Played: #0056D2
  Buffered: rgba(255,255,255,0.3)
  Quiz markers: ◆ diamond shape, #F5A623, 10px

Seek restriction:
  Locked area (past unanswered quiz): diagonal stripes pattern
  Cursor: not-allowed
```

### Teacher Dashboard Stats Card
```
Background: #FFFFFF
Border: 1px solid #E0E0E0
Border-radius: 8px
Padding: 24px

┌─────────────────────────┐
│  📹 Total Videos        │
│  ──────────────────────  │
│  42  (H1, 32px, bold)   │
│  +3 this week (caption)  │
└─────────────────────────┘

Icon: 40px, circle background (#E8F0FE)
Number: 32px, bold, #1F1F1F
Label: 14px, #636363
Sublabel: 12px, #198754 (positive) / #DC3545 (negative)
```

### Search Bar
```
Width: 100% (max 600px)
Height: 44px
Background: #F5F5F5
Border: 1px solid #E0E0E0
Border-radius: 4px
Padding: 0 16px 0 44px (left padding for icon)
Focus: border-color #0056D2, bg #FFFFFF
Placeholder: "Search lessons..." (#8C8C8C)
Search icon: 20px, #8C8C8C, absolute left 12px
```

### Progress Bar (trong card)
```
Height: 4px
Background: #E0E0E0
Border-radius: 4px
Fill: #0056D2 (in progress) / #198754 (completed)
Transition: width 600ms ease
```

### Toast Notification
```
Position: fixed, bottom-right, 24px from edges
Min-width: 300px
Padding: 16px
Border-radius: 8px
Shadow: dropdown shadow
Auto-dismiss: 3 seconds

Success: bg #D1E7DD, border-left 4px #198754
Error: bg #F8D7DA, border-left 4px #DC3545
Info: bg #E8F0FE, border-left 4px #0056D2
```

---

## 📱 Screen Layouts

### L1: Landing Page
```
[Navbar: Logo | [Login] [Sign Up]]
─────────────────────────────────────
HERO SECTION (bg: white, padding: 64px)
  Left 50%: Heading + Subtext + 2 CTA buttons
  Right 50%: Illustration/screenshot

VIDEO DEMO SECTION (bg: #F5F5F5, padding: 48px)
  Centered heading "See How It Works"
  Video player (max 800px, centered)

FEATURES SECTION (bg: white, padding: 48px)
  4 feature cards in a row (icon + title + description)

CTA SECTION (bg: #0056D2, padding: 48px, text: white)
  "Ready to get started?"
  [Teacher Sign Up] [Student Sign Up]

FOOTER (bg: #1F1F1F, text: white, padding: 32px)
```

### S2: Video Learning Page
```
[Navbar]
─────────────────────────────────────
LEFT 70%:                    RIGHT 30%:
┌─────────────────────┐    ┌──────────────────┐
│                     │    │ Lesson Info       │
│   VIDEO PLAYER      │    │ ──────────────── │
│   (16:9)            │    │ 📖 Title         │
│                     │    │ 👤 Teacher       │
│   ◆ Quiz markers    │    │                  │
│   on progress bar   │    │ Quiz Progress    │
│                     │    │ ✅ Quiz 1 (5:00) │
└─────────────────────┘    │ ⏳ Quiz 2 (10:00)│
                           │ ○ Quiz 3 (15:00) │
                           └──────────────────┘
```

### T4: Quiz Editor (Teacher)
```
[Navbar]
─────────────────────────────────────
LEFT 65%:                    RIGHT 35%:
┌─────────────────────┐    ┌──────────────────┐
│                     │    │ Quiz List        │
│   VIDEO PLAYER      │    │ ──────────────── │
│   (click timeline   │    │ 📝 Quiz @ 5:00  │
│    to add quiz)     │    │ 📝 Quiz @ 10:00 │
│                     │    │                  │
│   Timeline with     │    │ [+ Add Quiz]     │
│   quiz markers      │    │                  │
└─────────────────────┘    │ ──────────────── │
                           │ Quiz Edit Form   │
                           │ Question: [____] │
                           │ Option A: [____] │
                           │ Option B: [____] │
                           │ Option C: [____] │
                           │ Option D: [____] │
                           │ Correct: ○A ●B   │
                           │ [Save] [Cancel]  │
                           └──────────────────┘
```

---

*Created by AWF - Visualize Phase | Coursera-inspired | 2026-02-10*
