# UI Baseline Documentation — DoIt Mobile Application

**Version**: Baseline (Phase L0 Pre-Transformation)  
**Date**: November 2026  
**Status**: Wireframe-grade, functionally rich but visually unpolished  
**Target Standard**: Apple-feel on Android (Plane / Things 3 / Linear inspired)  
**Target Score**: >= 43/50 (Exit requirement across all screens)

---

## 1. Executive Summary & Baseline Verdict

The current mobile client for DoIt (`com.samyukt.doit`) is functionally mature with comprehensive support for offline-first synchronization, local SQLite storage, bug capture overlays, hardware sensor triggers, and workspace management. However, its visual execution is **wireframe-grade** due to systemic architectural issues:
1. **Outlines Over Tone**: Nearly every element is wrapped in a 1px solid border. Surfaces differ by only 1–2% luminance, making the interface look cluttered, flat, and dated.
2. **Weak Typography Scale**: Large titles use regular font weights; ALL-CAPS wide-tracked labels shout at users; no tabular numbers for metadata.
3. **Low Contrast & Periwinkle Accent**: Accent is an unsystematic washed periwinkle (`#7B79DD`) that fails WCAG AA against white text on buttons and looks weak on dark backgrounds.
4. **Layout Defects**: Critical screen title edge-flush bugs (0px margin in Settings), text overflowing bordered pills in Home, and clipped links.
5. **Developer Jargon in User Surfaces**: Server URLs, local IP addresses, and hardware test triggers exposed in consumer-facing sheets.

**Initial Aggregate Rubric Score**: **21.7 / 50** across 9 baseline screens.

---

## 2. Technical Stack Specification

| Layer | Technology | Version | Location / Package |
|---|---|---|---|
| **Platform** | React Native (Expo Bare Workflow) | RN 0.76.9 / Expo SDK 52.0.37 | `apps/mobile` |
| **Language** | TypeScript (Strict Mode) | 5.8.2 | Monorepo root & packages |
| **Monorepo** | pnpm workspace + Turborepo | pnpm 11.9.0 / Turbo 2.4.4 | Root workspace |
| **Design Tokens** | Shared TypeScript/CSS Token Package | 0.1.0 | `packages/design-tokens` (`@doit/tokens`) |
| **Navigation** | React Navigation (Native Stack + Bottom Tabs) | 7.5.1 / 7.21.0 | `apps/mobile/src/navigation` |
| **State Management** | Zustand Stores | 5.0.16 | `apps/mobile/src/store`, `src/features/*/store.ts` |
| **Server State** | TanStack React Query | 5.105.0 | `apps/mobile/src/api` |
| **Animation & Physics**| React Native Reanimated + Gesture Handler | Reanimated 3.16.1 / RNGH 2.20.2 | `apps/mobile` |
| **Iconography** | Lucide React Native | 1.64.0 | `lucide-react-native` |
| **Safe Areas & System**| React Native Safe Area Context | 4.12.0 | `react-native-safe-area-context` |

---

## 3. Baseline Screens Catalog (9 Core Screens)

All baseline screenshots are captured from physical device runs and cataloged in `docs/new-kit/doit-ui-premium-loop-kit/doit-ui-premium-loop-kit/reference/current/`:

| Screen # | Screen Name | Reference Image | Source File Path | Key Observed Flaws |
|---|---|---|---|---|
| **01** | Home | `01-home.jpg` | `apps/mobile/src/features/home/screens/HomeScreen.tsx` | Workspace pill overflows (A3); rotated stickies card (A6); large dead space; no hero progress ring (B5). |
| **02** | Tasks (Board View) | `02-tasks-board.jpg` | `apps/mobile/src/features/tasks/screens/TaskListScreen.tsx` | Tall empty board column; second column cut off horizontally without affordance (A4); 3 duplicate create triggers (A7). |
| **03** | Tasks (List View) | `03-tasks-list.jpg` | `apps/mobile/src/features/tasks/screens/TaskListScreen.tsx` | Rows show only ID + title; missing priority, due date, labels, assignee (B4); square checkboxes (E1); 1px borders everywhere (C2). |
| **04** | Bugs Queue | `04-bugs.jpg` | `apps/mobile/src/features/bugs/screens/BugQueueScreen.tsx` | Severity filter chips lack color coding (C4); bug icon visually cluttered (E2); washed lavender buttons (C1). |
| **05** | Search | `05-search.jpg` | `apps/mobile/src/screens/SearchScreen.tsx` | Plain search input; lacks structured suggestions and recent searches; bordered container aesthetics (B1). |
| **06** | New Task (with Keyboard) | `06-new-task-keyboard.jpg` | `apps/mobile/src/screens/CaptureModal.tsx` | Keyboard accessory bar duplicates form fields (A5); crowded view; lack of progressive disclosure (B6). |
| **07** | New Task (Full Form) | `07-new-task.jpg` | `apps/mobile/src/screens/CaptureModal.tsx` | Long full-screen form with all fields visible simultaneously; multiple cancel/create button rows (B6, E4). |
| **08** | Account Sheet | `08-account-sheet.jpg` | `apps/mobile/src/features/account/AccountMenuSheet.tsx` | Generic "Active User" label (F1); developer server URLs and Wi-Fi IP addresses visible (F2); duplicate theme/accent pickers (F4). |
| **09** | Settings | `09-settings.jpg` | `apps/mobile/src/features/settings/screens/SettingsScreen.tsx` | "Settings" title flush against left edge (0px margin) (A1); section title "Quick Capture & Hardware Integration" overflows; "How…" link clipped (A2). |

---

## 4. Complete Mapping of Defects A1–F5

Every defect documented during the audit is mapped below with its category, description, root cause, and remediation plan:

### Category A: Layout Bugs (Objectively Broken — Must Fix First)
- **A1 — Settings Title Edge Flush**: Title "Settings" has 0px horizontal padding, flush against the screen edge. Inconsistent padding across the entire settings view.  
  *Root Cause*: Hardcoded 0 margin / missing `Screen` wrapper.  
  *Remedy*: Wrap with universal `Screen` primitive enforcing 20pt padding. Fixed in M2/M5.
- **A2 — Settings Section & Link Overflow**: Section title "Quick Capture & Hardware Integration" overflows its container; the trailing "How…" link is clipped off the right edge.  
  *Root Cause*: Unconstrained `flexDirection: 'row'` without wrapping or flexible shrink.  
  *Remedy*: Use `GroupedList` / `GroupedRow` with `numberOfLines={1}` and flexible flex hierarchy. Fixed in M2/M5.
- **A3 — Workspace Name Overflow**: Workspace pill on Home ("Alice Sharmay's Workspace") overflows its bordered container with text running past the pill border.  
  *Root Cause*: No `maxWidth` or `numberOfLines={1}` with `ellipsizeMode="tail"`.  
  *Remedy*: Top bar workspace switcher with max width (60%) and clean truncation. Fixed in M3/M4.
- **A4 — Tasks Board Mobile Usability**: Board column displays as a tall empty box with the second column clipped at the right edge without swipe affordance.  
  *Root Cause*: Wide desktop board layout forced onto mobile viewport.  
  *Remedy*: Single-column segmented board view (To Do / In Progress / Done) with List view as default. Fixed in M4.
- **A5 — New Task Duplicate Controls**: When keyboard opens, the contextual accessory bar sits over form content and duplicates the Due/Priority chips already present in the form body.  
  *Root Cause*: Two independent component controllers rendering the same state properties.  
  *Remedy*: Single unified keyboard accessory bar acting as the exclusive property controller in a bottom sheet. Fixed in M5.
- **A6 — Skewed Stickies Card**: "Recent stickies" card on Home is rotated/skewed with large empty space at the top and text pinned to bottom-left.  
  *Root Cause*: Experimental CSS rotate transform with broken flex alignment.  
  *Remedy*: Horizontal scroller of 148×148 square tonal sticky cards with soft pastel tints and 3-line clamp. Fixed in M4.
- **A7 — Triplicate Create Actions**: Tasks screen contains three separate ways to create tasks: header "New", center empty state "+", and "Add Task" button.  
  *Root Cause*: Ad-hoc button additions across iterations without a unified action hierarchy.  
  *Remedy*: Detached 56px circular floating action button (`+`) as the single global create path. Fixed in M3/M4.

### Category B: Hierarchy & Structure
- **B1 — Bordered Rectangle Uniformity**: Every element is a bordered rounded rectangle of identical visual weight, resulting in zero focal point.  
  *Remedy*: Depth via 8% luminance ladder (`canvas` -> `surface1` -> `surface2` -> `surface3`); zero borders.
- **B2 — Regular Weight Oversized Titles**: Headings rely strictly on font size rather than weight and tone contrast.  
  *Remedy*: Inter typography scale with bold/semibold weights (700 largeTitle, 600 title/headline) and tight tracking.
- **B3 — ALL-CAPS Shouting Labels**: Wide-tracked uppercase labels (`ACTIVE PROJECT`, `GENERAL`, `THEME MODE`) create visual noise.  
  *Remedy*: Strict sentence case across all labels, headers, and metadata.
- **B4 — Anemic Task Rows**: Rows display only ID and title, omitting due date, priority, labels, assignee, and status.  
  *Remedy*: Rich secondary metadata line with priority flag, due date, label chips, and assignee avatar in tabular typography.
- **B5 — Dead Space on Home**: More than 40% of the Home screen is empty space beneath content without a focal hero.  
  *Remedy*: "Today" hero card with circular animated SVG progress ring and quick stat summary.
- **B6 — Overwhelming Creation Form**: New Task is a long full-screen form with every field visible at once.  
  *Remedy*: 2-detent bottom sheet (45% / 92%) with progressive disclosure driven by the keyboard bar.

### Category C: Color & Surfaces
- **C1 — Washed Periwinkle Accent**: Accent is `#7B79DD`, offering low saturation and poor contrast against white button text.  
  *Remedy*: Brand Blue (`#2F5BEA` light / `#3A66F2` dark) with verified contrast >= 4.5:1.
- **C2 — 1px Wireframe Borders**: Surfaces differ by only 1–2% luminance and rely on 1px borders.  
  *Remedy*: Tonal depth ladder with 8% luminance steps; hairlines used only as list row separators.
- **C3 — Low-Contrast Lavender Links**: "View All" and "Add Task" text links use washed lavender on dark surfaces.  
  *Remedy*: Verified `textDark` accent tokens (`#8FAEFF` for blue) guaranteeing >= 4.5:1 contrast.
- **C4 — Inconsistent Semantic Colors**: Unsystematic use of green banners, red outlined logout buttons, and uncolored bug filters.  
  *Remedy*: Unified semantic color tokens (`success`, `warning`, `danger`) with paired fill, text, and soft tokens.
- **C5 — Neglected Light Mode**: Dark mode was treated as primary, leaving light mode unrefined.  
  *Remedy*: Complete dark/light parity with pure white cards (`#FFFFFF`) on `#F4F4F7` canvas with soft ambient shadows.

### Category D: Typography & Spacing
- **D1 — Inconsistent Scale**: Heading sizes are arbitrary; small text is disproportionate to row containers.  
  *Remedy*: Standardized 8-level Inter type scale (30, 22, 16, 15, 14, 12.5, 12, 11).
- **D2 — Irregular Spacing Grid**: Gaps range randomly between 12, 24, and 40 without rhythm.  
  *Remedy*: Strict 4-pt grid (4, 8, 12, 16, 20, 24, 32, 40, 48) and unified 20pt horizontal screen margin.
- **D3 — Outlined Filter Pills**: Filter chips are outlined pills of identical weight with barely distinguishable active states.  
  *Remedy*: Tonal chips with `surface2` default and `accentSoft` + `accentText` active state.

### Category E: Components & Consistency
- **E1 — Heavy Square Checkboxes**: Checkboxes are clunky squares that feel like web forms.  
  *Remedy*: 22px circular animated completion control with 180ms bounce, stroke draw, and haptic feedback.
- **E2 — Mixed Icon Weights & Complex Bug Glyph**: Mixed iconography stroke weights and visually cluttered bug icon.  
  *Remedy*: Unified Lucide icon set with consistent 1.75 stroke and 22–24px sizing in 44px touch targets.
- **E3 — Lifeless Empty States**: Empty states consist of a plain icon in a box with a single sentence.  
  *Remedy*: Designed empty states with gentle line art, empathetic microcopy, and a clear primary action button.
- **E4 — Button Fragmentation**: Four divergent button styles (lavender fill, dark outline, red outline, text links).  
  *Remedy*: Unified `Button` component with 5 variants (`primary`, `secondary`, `subtle`, `danger`, `ghost`) and zero borders.

### Category F: Content & Product Hygiene
- **F1 — "Active User" Placeholder**: Account menu displays literal text "Active User" instead of user's display name.  
  *Remedy*: Real authenticated user profile details with deterministic avatar initial fallback.
- **F2 — Exposed Developer Infrastructure**: Server URLs, local IP addresses ("192.168.1.67"), and USB connection indicators visible in customer UI.  
  *Remedy*: Remove developer section from customer UI; gate behind 7 taps on version number in dev builds.
- **F3 — Technical Jargon Microcopy**: Labels like "Hardware Integration", "Test Slack", "Verified Account".  
  *Remedy*: Clean, human, sentence-case microcopy ("Bug capture", "Integrations", "Account verified").
- **F4 — Duplicate Appearance Controls**: Theme and accent pickers duplicated in both Account Sheet and Settings Screen.  
  *Remedy*: Consolidate theme/accent selection exclusively into Settings -> Appearance.
- **F5 — Test/Mock Data Artifacts**: Strings like "abc", "Test Task", and "Verify Task Screenshot" visible in baseline screens.  
  *Remedy*: Realistic seeded demo data (8–12 tasks with priorities/labels, 5 bugs with real screenshots, 4 stickies).

---

## 5. Baseline Rubric Scorecard (Aggregate: 21.7 / 50)

Each screen evaluated across the 10 rubric dimensions (0–5 scale) defined in `docs/04-loop-protocol-and-rubric.md`:

| Screen | D1 Hierarchy | D2 Spacing | D3 Typography | D4 Color | D5 Surfaces | D6 Icons | D7 Consistency | D8 Motion | D9 States | D10 Polish | Total |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **01 Home** | 2 | 2 | 2 | 3 | 2 | 3 | 2 | 2 | 3 | 3 | **24/50** |
| **02 Tasks Board** | 2 | 1 | 2 | 2 | 2 | 3 | 2 | 2 | 2 | 2 | **20/50** |
| **03 Tasks List** | 2 | 2 | 2 | 3 | 2 | 3 | 2 | 2 | 3 | 2 | **23/50** |
| **04 Bugs Queue** | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 3 | 3 | **22/50** |
| **05 Search** | 2 | 3 | 2 | 3 | 2 | 3 | 2 | 1 | 2 | 2 | **22/50** |
| **06 New Task (KB)** | 2 | 2 | 2 | 2 | 2 | 3 | 2 | 2 | 2 | 2 | **21/50** |
| **07 New Task (Form)**| 2 | 2 | 2 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | **20/50** |
| **08 Account Sheet** | 2 | 2 | 2 | 3 | 2 | 3 | 2 | 2 | 2 | 2 | **22/50** |
| **09 Settings** | 2 | 1 | 2 | 3 | 2 | 3 | 2 | 1 | 3 | 2 | **21/50** |
| **Average Baseline** | **2.0** | **1.9** | **2.0** | **2.6** | **2.0** | **2.9** | **2.0** | **1.7** | **2.4** | **2.2** | **21.7/50** |

---

## 6. Static Automated Audit Baseline

- **`scripts/check-tokens.mjs`**: **40 violations** currently found in the mobile codebase (`apps/mobile/src`).
  - Hardcoded hex literals in `FoundationGallery.tsx` (12), `AttachmentGallery.tsx` (11), `CaptureModal.tsx` (7), `BugDetailScreen.tsx` (1), `TaskDetailScreen.tsx` (1).
  - Hardcoded rgba literals in `SettingsScreen.tsx` (5), `QuickCaptureGuideSheet.tsx` (2), `ShakeTestModal.tsx` (1).
- **`contrast.py`**: **0 failures** across all 43 pairs in `templates/premium-tokens.json`. Legacy tokens in `@doit/tokens` (`neutrals.dark.bg = #08090A`, `accents.indigo`, etc.) are upgraded in Milestone M1 to guarantee contrast compliance.
