# 02 — Web Architecture

A Trello/Linear-class web client on the API you already have. Same tokens, same roles, same
data — a different surface.

---

## 2.1 The framework decision (read this before W00)

**Recommendation: Vite + React 19 + React Router v7, as a single-page app, talking directly to
`api.samyukt.com`.**

Why not Next.js:

| | Vite SPA | Next.js |
|---|---|---|
| Server to operate | none (static files on a CDN) | a Node server, plus its own auth/session layer |
| Auth complexity | cookie on the API domain, token in memory | cookie forwarding through the Next server, or a BFF you now maintain |
| Board interactivity | perfect fit — it's all client state | RSC buys little on a drag-and-drop board |
| SEO | irrelevant (authenticated tool) | irrelevant here |
| shadcn/ui | full support | full support |
| Cold-start infra cost | ~₹0 on a CDN | a container + memory |

Your API is already a complete REST service. Adding a Next server means two backends, two deploy
pipelines and a second place auth can go wrong, for a product that never needs to be indexed.
The one thing you lose is server-rendered first paint — mitigated by a static shell + skeleton
and prefetching the board on hover.

**If you want Next anyway**, decide now: it changes W01, W03 and every data-fetching pattern
after them. Say so before W00 starts. Add Next later for `samyukt.com` (marketing) only, where
SEO does matter — that is a separate app and does not conflict with this decision.

---

## 2.2 Stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite 6 | fastest HMR, zero-config static output |
| Framework | React 19 | |
| Routing | React Router v7 (data router) | typed loaders, nested layouts |
| Server state | TanStack Query v5 | **same query-key scheme as mobile** |
| Client state | Zustand | UI only, never server data |
| Components | shadcn/ui (Radix) | copy-in, own the code, accessible primitives |
| Styling | Tailwind CSS v4 | CSS-first tokens, shared with NativeWind v5 on mobile |
| Forms | react-hook-form + zod | zod schemas from `@doit/contracts` |
| Drag & drop | `@dnd-kit` | keyboard-accessible sorting (Trello's own choice) |
| Realtime | socket.io-client | same gateway the mobile app uses |
| Command palette | `cmdk` | |
| Toasts | `sonner` | |
| Charts | Recharts | session/severity analytics |
| Dates | `date-fns` | |
| Icons | `lucide-react` | same set as mobile's `lucide-react-native` |
| Testing | Vitest + Testing Library + Playwright | |

---

## 2.3 Layout — the three-pane professional shell

```
┌──────────┬──────────────────────────────────────────────┬──────────────────┐
│          │  Topbar: breadcrumb · filters · search · +   │                  │
│ Sidebar  ├──────────────────────────────────────────────┤  Detail drawer   │
│  240px   │                                              │      420px       │
│          │   BOARD  (columns, horizontal scroll)         │  task / bug      │
│ Workspace│   or LIST  (virtualised rows)                 │  comments        │
│ ▾ Acme   │   or STICKIES (masonry)                       │  attachments     │
│  My Day  │                                              │  activity        │
│  Inbox   │                                              │                  │
│  Upcoming│                                              │                  │
│  ─────── │                                              │                  │
│ Projects │                                              │                  │
│  SMP     │                                              │                  │
│  APP     │                                              │                  │
│  ─────── │                                              │                  │
│ Bugs     │                                              │                  │
│ Search   │                                              │                  │
│ Settings │                                              │                  │
└──────────┴──────────────────────────────────────────────┴──────────────────┘
```

- Density: 13 px base text, 32 px row height, 8 px grid. Denser than mobile — desktop users
  want more on screen, and the type scale in `03-WEB-DESIGN-SYSTEM.md` reflects that.
- The detail drawer is a **route**, not a modal: `/p/SMP/task/42` renders the board with the
  drawer open, so it is linkable, shareable and back-button-correct.
- Responsive: below 1024 px the sidebar collapses to icons; below 768 px the drawer becomes a
  full-screen sheet. It must never become a worse mobile app — web is the triage surface.

---

## 2.4 Routes

```
/                             → redirect to last workspace or /login
/login  /register  /forgot  /reset/:token  /verify/:token  /invite/:token
/w/:workspaceSlug             → dashboard (overview + recent)
/w/:workspaceSlug/my-day
/w/:workspaceSlug/inbox
/w/:workspaceSlug/upcoming
/w/:workspaceSlug/bugs
/w/:workspaceSlug/bugs/:bugId
/w/:workspaceSlug/sessions
/w/:workspaceSlug/sessions/:sessionId
/w/:workspaceSlug/search?q=
/w/:workspaceSlug/settings/{general,members,labels,projects,notifications,sessions}
/p/:projectKey                → board (default view)
/p/:projectKey/list
/p/:projectKey/stickies
/p/:projectKey/task/:number   → board + detail drawer
/p/:projectKey/settings
/me                           → profile, theme, security
```

Every list state (filters, sort, view) lives in the **URL query string**, so a filtered board is
a shareable link. This is the single biggest quality difference between a real web app and a
mobile app stretched to a browser.

---

## 2.5 Folder structure (mirrors mobile's feature-folder rule)

```
apps/web/src/
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/        QueryProvider, AuthProvider, ThemeProvider, RealtimeProvider, ToastProvider
├── routes/               thin route components, one per URL
├── features/
│   ├── _template/        ← copy for every new feature (same six-step ritual as mobile)
│   ├── auth/
│   ├── board/
│   ├── tasks/
│   ├── bugs/
│   ├── stickies/
│   ├── sessions/
│   ├── search/
│   ├── members/
│   └── settings/
├── components/
│   ├── ui/               shadcn primitives (owned, edited in place)
│   ├── patterns/         TaskRow, BugRow, StickyCard, SeverityBadge, FilterBar, CommandPalette
│   └── layout/           AppShell, Sidebar, Topbar, DetailDrawer
├── lib/                  api.ts, queryClient.ts, socket.ts, permissions.ts, dates.ts
└── styles/
    ├── index.css         imports @doit/tokens/theme.css + tailwind
    └── accents.css       [data-accent="teal"] { … } ×5
```

`src/lib/api.ts` is the **only** place that talks to the API. No component ever calls `fetch`.
It mirrors mobile's `lib/http.ts`: attaches the access token, refreshes on `TOKEN_EXPIRED`
once, validates the response with the shared zod schema, and throws typed `ApiError`.

---

## 2.6 Shared code between web and mobile

| Share via `@doit/contracts` | Share via `@doit/tokens` | Duplicate deliberately |
|---|---|---|
| zod schemas + inferred types | colour/space/radius/type scales as CSS vars | query-key factories (different cache shapes) |
| error-code enum | accent definitions | UI components (Radix vs RN primitives) |
| role → permission map | contrast metadata | navigation |
| date/number formatters | | |

The permission map is the important one: **one function, `can(role, action, resource)`,
exported from `@doit/contracts`, used by both clients and mirrored by the server guard.** That
is what stops the web app from showing a Delete button a TESTER cannot use.

---

## 2.7 Performance targets

| Metric | Target |
|---|---|
| First contentful paint (cold, 4G) | < 1.5 s |
| Board with 300 cards interactive | < 1 s |
| Drag frame rate | 60 fps |
| Route transition | < 150 ms (prefetched) |
| Initial JS bundle (gzip) | < 220 KB |
| Largest contentful paint | < 2 s |

Route-level code splitting is mandatory; the board, the drawer and settings each load on demand.
Virtualise any list over 100 rows (`@tanstack/react-virtual`).

---

## 2.8 Environments

```
apps/web/.env.example
  VITE_API_URL=https://api.samyukt.com/api/v1
  VITE_WS_URL=wss://api.samyukt.com/rt
  VITE_ENV=development
```

Dev against a local API: `VITE_API_URL=http://localhost:3000/api/v1` and the API's CORS
allowlist must include `http://localhost:5173` with credentials.
