# P-01 Primitives Review & Verification Report

**Date:** 2026-11-03  
**Branch:** `feat/p-01-01-primitives`  
**Target:** Physical Xiaomi/Poco (Android 14, `3086027538000H5`)  
**Package:** `com.samyukt.doit`  
**Build:** `v0.1.0-build11`  

---

## 1. Scope & Deliverables Audit

| Primitive | Spec / Requirements | Status | Notes |
|---|---|---|---|
| `ui/Button` | 4 variants (`primary`, `secondary`, `ghost`, `danger`) × 3 sizes (`sm` 36, `md` 44, `lg` 52) × 5 states (`rest`, `pressed` 0.97/90ms, `focused`, `disabled`, `loading`), radius 16 (`radius.md`). Callers cannot pass `style`. | ✅ PASS | Measured heights 36/44/52, radius 16. Caller `style` fails lint. |
| `ui/IconButton` | 40×40, radius 12 (`radius.sm`), 3 variants (`ghost`, `secondary`, `primary`) × 5 states. | ✅ PASS | 40×40 dimensions, 12 radius, press scale 0.97. |
| `ui/Field` / `Input` | 48 tall, radius 12 (`radius.sm`), label above (8px gap), error state (semantics.danger), `selectionColor=accent`, `keyboardAppearance="dark"`. | ✅ PASS | Measured height 48, radius 12, dark keyboard. |
| `ui/Chip` | 32 tall, pill radius (999). Selected = filled L3 (`surfaceOverlay`) + accent text (**no border**). Unselected = filled L2 (`surfaceRaised`) + textSecondary. | ✅ PASS | 32 height, pill radius, L3 fill without border. |
| `ui/AccentChip` | 32 tall, pill. 12px colour swatch + label. Selected = filled L3. | ✅ PASS | 12px swatch, all 5 WCAG accents supported. |
| `ui/Checkbox` | 28 visual (radius 8), 44 hit area. Checked = accent fill with white checkmark. Unchecked = 1.5px border with L2 background. | ✅ PASS | 28 visual, 44 hit area, scale 0.92 on press. |
| `ui/PriorityDot` | 6px dot + optional 12px label in semantic priority color (Low `#8B919E`, Medium `#60A5FA`, High `#FBBF24`, Urgent `#F87171`). | ✅ PASS | 6px dot, semantic priority colors. |
| `ui/DueText` | Semantic due date colors: Overdue (`#F87171`), Due today (`#FBBF24`), Tomorrow/this week (`textSecondary`). | ✅ PASS | Verified date diff logic. |
| `ui/SeverityBadge` | 20 tall, radius 10 pill. Blocker (solid `#DC2626`, white text), Critical/Major/Minor/Cosmetic (12% tints). | ✅ PASS | 20 tall, 10 radius, solid blocker, 12% tints. |
| `ui/LabelPill` | 20px pill, radius 10, deterministic `accentFor(labelId)` tint background + text. | ✅ PASS | 20 tall, radius 10, deterministic mapping. |
| `ui/Avatar` | 28px standard (and sm 24, lg 36, xl 44), circular (`radius.pill`), `accentFor(id).primary` with white initials. | ✅ PASS | White initials, 5-accent hash mapping. |
| `ui/WorkspaceTile` | 36x36 or 44x44, radius 12 (`radius.sm`), `accentFor(workspaceId).primary` with white monogram. | ✅ PASS | 36/44 size, radius 12, white monogram. |
| `ui/Row` | §6.3 anatomy: 44 checkbox column, meta row, title (h3, max 2 lines), labels, trailing avatar. Surface L1 (radius 20, no border, top highlight). Min height 96/124. | ✅ PASS | Min height 96 (meta + title), 124 with labels. 16 padding. |
| `ui/SectionHeader` | Eyebrow (uppercase, tracking) + count pill (20 tall, L2 background) + optional action link in accent text. | ✅ PASS | Eyebrow + count pill + accent link. |
| `ui/EmptyState` | Bare 64 icon in `textMuted` (**no rounded container**), title (h3), body (textSecondary), optional CTA button. | ✅ PASS | Bare 64 icon, no rounded grey box. |
| `ui/Skeleton` & `RowSkeleton` | Shimmering block placeholders + RowSkeleton matching §6.3 real row anatomy. | ✅ PASS | RowSkeleton with 44 checkbox, meta, title, labels, avatar. |

---

## 2. Gate G-P1 Review Rubric (12-Point System)

| # | Check | Score (0-2) | Finding / Evidence |
|---|---|---|---|
| 1 | **Ladder** | 2 | 4 distinct surface levels (L0 Canvas `#08090A`, L1 Cards `#0F1012`, L2 Inputs/Chips `#16181B`, L3 Pressed/Selected `#1D2024`). |
| 2 | **No card borders** | 2 | Zero static borders on L1 cards and list rows; 1px inner top highlight (`rgba(255,255,255,0.08)`) gives edge definition. |
| 3 | **One accent** | 2 | Single accent per screen region (primary CTA, active nav, selected chip text). |
| 4 | **Colour means something** | 2 | Semantic scales for priority, severity, and due date. No random decorative colors. |
| 5 | **One weight jump** | 2 | Titles 600 (`h1`, `h2`, `h3`, `bodyStrong`), content 400 (`body`, `bodySmall`). No intermediate bold clutter. |
| 6 | **Tracking** | 2 | Optical tracking scale: large titles -0.6 to -0.2; small caps +0.8 to +1.2. |
| 7 | **Rhythm** | 2 | Strict 4pt rhythm (4, 8, 12, 16, 20, 24). Zero one-off margins. |
| 8 | **Density** | 2 | §6.3 Row anatomy carries 5 distinct information elements (checkbox, humanId, priority, due date, title, labels, avatar). |
| 9 | **The bottom resolves** | 2 | Clear list endings, paddingBottom 100 clears floating navbar. |
| 10 | **States** | 2 | Rest, pressed (0.97 scale/90ms), focused (accent ring), disabled (0.45 opacity), loading (ActivityIndicator) implemented on every interactive primitive. |
| 11 | **Optics** | 2 | Left alignment shared across headers, rows, and inputs. 44px hit targets on checkboxes and icon buttons. |
| 12 | **Platform** | 2 | Android dark status bar, dark keyboard appearance (`keyboardAppearance="dark"`), edge-to-edge safe area handling. |

**Total Score:** **24 / 24** (Pass threshold ≥ 20/24)  
**Gate G-P1 Status:** **PASSED**

