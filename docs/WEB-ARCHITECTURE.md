# DoIt Web Platform — Architecture Specification

## 1. Overview
The DoIt Web Platform (`@doit/web`) is a high-performance, Linear/Apple-grade single-page application built on React 18, Vite 6, Tailwind CSS v4, Zustand 5, and TanStack React Query v5. It is directly integrated with the unified DoIt NestJS production backend API (`https://doit.samyukt.pro/api/v1`).

---

## 2. Core Pillars & Principles

### A. One Backend, One Source of Truth
- **Single DB & Auth System**: Zero mock data. Web uses the exact same PostgreSQL database, JWT tokens, workspace memberships, and project records as the mobile application (`com.samyukt.doit`).
- **Token Rotation & Session Persistence**: Uses `localStorage` with silent `/auth/refresh` on 401 unauthenticated errors. If refresh fails, user is directed to `/login` without losing navigation state.
- **Header Scoping**: Every API request automatically attaches `x-workspace-id` based on the actively selected workspace.

### B. Tone-over-Lines Design Language
- **Borderless Elevation**: No 1px card outlines or KPI border boxes. Visual hierarchy is established via tonal surfaces (`--background`, `--card`, `--surface-raised`, `--sidebar`), soft layered shadows, and high contrast typography.
- **Accents**: 5 semantic accent palettes (`blue`, `violet`, `green`, `orange`, `rose`) selectable in Settings and synced to `data-accent` on `document.documentElement`.
- **Badge System**: Humanized status, priority, severity, and role badges mapping directly to `@doit/tokens` and unified badge mappings.
- **Official Brand Typography & Wordmark**: Uses vector SVGs (`/logo-horizontal-dark.svg`, `/logo-horizontal-light.svg`) to eliminate the "Dolt" capital-I/lowercase-l ambiguity defect.

---

## 3. Directory Layout

```
apps/web/
├── public/
│   ├── logo-horizontal-dark.svg
│   ├── logo-horizontal-light.svg
│   ├── app-icon-rounded.svg
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Responsive desktop sidebar + mobile drawer
│   │   │   ├── Sidebar.tsx           # Logo, workspace switcher, nav items, project items
│   │   │   ├── TopBar.tsx            # Breadcrumbs, ⌘K search trigger, + Create split button
│   │   │   ├── Breadcrumbs.tsx       # Dynamic segment breadcrumbs
│   │   │   ├── WorkspaceSwitcher.tsx # Workspace dropdown + creation modal
│   │   │   ├── UserMenu.tsx          # User details, Quick theme switcher, logout
│   │   │   ├── CommandPalette.tsx    # Global ⌘K / Ctrl+K spotlight launcher
│   │   │   ├── CreateModal.tsx       # Universal Task, Bug, Sticky create dialog
│   │   │   └── ProtectedRoute.tsx    # Auth guard & workspace pre-loader
│   │   └── ui/
│   │       ├── badge.tsx             # StatusBadge, PriorityBadge, SeverityBadge, RoleBadge
│   │       ├── button.tsx            # Button variants (primary, secondary, outline, danger)
│   │       ├── card.tsx              # Tonal card primitives
│   │       ├── input.tsx             # Sentence-case labeled inputs
│   │       ├── avatar.tsx            # Deterministic color initials avatar
│   │       ├── modal.tsx             # Modal and ConfirmDialog primitives
│   │       ├── toast.tsx             # Toast notification system
│   │       ├── skeleton.tsx          # Shimmer loading placeholders
│   │       └── empty-state.tsx       # Helpful zero-data empty states
│   ├── lib/
│   │   ├── api.ts                    # Centralized typed API client
│   │   ├── types.ts                  # Shared TypeScript contracts
│   │   ├── badge-map.ts              # Badges map & color definitions
│   │   ├── auth-store.ts             # Auth session Zustand store
│   │   ├── workspace-store.ts        # Workspaces & projects Zustand store
│   │   ├── theme-store.ts            # Theme mode, accent, density store
│   │   └── utils.ts                  # Tailwind clsx + twMerge utility
│   ├── pages/
│   │   ├── AuthPage.tsx              # Sign In & Account Registration with demo accounts
│   │   ├── DashboardPage.tsx         # Overview with real KPIs & recent bug thumbnails
│   │   ├── TasksPage.tsx             # List, Kanban Board, Table views & peek panel
│   │   ├── BugsPage.tsx              # Split triage view, screenshot inspector, audio player
│   │   ├── StickiesPage.tsx          # Pastel scratchpad grid with pin & task conversion
│   │   ├── TeamPage.tsx              # Member roster, roles, invite links & email dispatch
│   │   ├── SettingsPage.tsx          # Appearance, Profile, Workspace, Sessions & SMTP
│   │   └── InviteAcceptPage.tsx      # Public token acceptance & account linking
│   ├── styles/
│   │   └── index.css                 # Semantic CSS variables, themes, and utility styles
│   ├── App.tsx                       # React Router v7 routes with providers
│   └── main.tsx                      # Root mount & theme bootstrap
```
