# DoIt — Project & Codebase Structure

This document details the layout of the DoIt monorepo, its application roots, module boundaries, and conventions.

---

## 1. Top-Level Directory Layout

```
k:/Doit/
├── apps/
│   ├── api/                  # NestJS 10 production backend
│   ├── mobile/               # React Native Expo mobile application
│   └── web/                  # React 18 + Vite web workspace client
├── packages/
│   ├── config/               # Base tsconfig and linting standards
│   ├── contracts/            # Canonical Zod schemas and DTO interfaces
│   └── design-tokens/        # Shared colors, typography, radii, and elevations
├── infrastructure/
│   ├── docker/               # Containerfiles for backend & web
│   └── coolify/              # Coolify compose templates and guides
├── docs/
│   ├── architecture/         # High-level architecture and system design
│   ├── development/          # Setup, commands, and repository structure
│   ├── deployment/           # Coolify hosting and mobile release procedures
│   └── api/                  # OpenAPI spec and coverage reports
├── scripts/                  # Monorepo build and package sync scripts
├── .gitignore                # Git ignore rules for build artifacts and secrets
├── docker-compose.coolify.yml# Production & local Docker Compose stack
├── package.json              # Monorepo root manifest (scripts & dependencies)
├── pnpm-workspace.yaml       # Workspace definition for pnpm
├── turbo.json                # Turborepo task pipeline configuration
└── README.md                 # Primary product & developer documentation
```

---

## 2. Backend Layout (`apps/api`)

The NestJS backend lives in `apps/api/` and follows strict modular boundaries:

```
apps/api/
├── prisma/
│   ├── schema.prisma         # Database schema (PostgreSQL)
│   ├── migrations/           # Versioned SQL migration files
│   ├── seed.ts               # Local development seed script
│   └── seed.prod.ts          # Production initial workspace seed script
├── src/
│   ├── common/               # Shared cross-cutting concerns
│   │   ├── decorators/       # @CurrentUser(), @Roles(), @Public()
│   │   ├── errors/           # Standardized AppError and ErrorCode enums
│   │   ├── filters/          # AllExceptionsFilter (sanitized error output)
│   │   ├── guards/           # JwtAuthGuard, RolesGuard, WorkspaceMemberGuard
│   │   ├── interceptors/     # LoggingInterceptor, ResponseInterceptor
│   │   ├── pagination/       # Cursor-based pagination utilities
│   │   ├── pipes/            # ZodValidationPipe
│   │   └── utils/            # Crypto utilities, invite token generators
│   ├── config/               # Env variable schema validation (Zod)
│   ├── health/               # /api/v1/health endpoints for liveness/readiness
│   ├── infra/                # Third-party driver implementations
│   │   ├── ai/               # Local/OpenAI/Sarvam Whisper transcription
│   │   ├── prisma/           # Prisma client lifecycle service
│   │   ├── queue/            # Asynchronous background job processing
│   │   ├── realtime/         # WebSocket gateway for live updates
│   │   └── storage/          # Local / S3 MinIO storage adapters
│   ├── modules/              # Core business domain modules
│   │   ├── auth/             # Login, register, token refresh, passwords
│   │   ├── users/            # User profile management
│   │   ├── workspaces/       # Workspace creation, slug routing, billing
│   │   ├── projects/         # Projects within workspaces
│   │   ├── members/          # Team invitations and role assignment
│   │   ├── tasks/            # Tasks, priorities, state machine, ordering
│   │   ├── labels/           # Workspace-scoped color labels
│   │   ├── search/           # Multi-entity fast search index
│   │   ├── stickies/         # Fast-capture sticky notes and task conversion
│   │   ├── attachments/      # Uploads, presigned URLs, MIME verification
│   │   ├── voice/            # Audio transcription and structuring
│   │   ├── notifications/    # In-app notification dispatcher
│   │   ├── email/            # SMTP/Nodemailer notification dispatch
│   │   └── context-ai/       # AI project context & encrypted credential storage
│   ├── app.module.ts         # Root NestJS module importing all domains
│   └── main.ts               # Application entrypoint & global configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # NestJS dependencies & script definitions
```

---

## 3. Mobile Client Layout (`apps/mobile`)

The mobile client in `apps/mobile/` uses React Native and Expo SDK 52:

```
apps/mobile/
├── android/                  # Android native project and Gradle configuration
├── src/
│   ├── components/
│   │   └── ui/               # Reusable primitives (Buttons, Chips, Badges, Modals)
│   ├── core/                 # App-wide providers (Theme, Auth, QueryClient)
│   ├── features/             # Domain feature modules
│   │   ├── auth/             # Login, Signup, Reset Password screens & state
│   │   ├── bugs/             # Bug Queue, Bug Detail, triage actions
│   │   ├── capture/          # Quick capture overlay, screenshot tools
│   │   ├── home/             # Dashboard, summary metrics, quick actions
│   │   ├── labels/           # Label management & color chips
│   │   ├── notifications/    # Push notifications & in-app inbox
│   │   ├── outbox/           # Offline mutation persistence queue
│   │   ├── projects/         # Project selection & settings
│   │   ├── sessions/         # Testing sessions tracking
│   │   ├── settings/         # User profile, theme, device permissions
│   │   ├── stickies/         # Sticky note board and editing
│   │   ├── system/           # Network state listeners and update checks
│   │   ├── tasks/            # Task list, detail, filtering, and priority
│   │   ├── voice/            # Voice recording and playback
│   │   └── workspace/        # Workspace switcher and team membership
│   ├── lib/                  # HTTP client, device telemetry, realtime WS client
│   ├── native/               # Native Android bridges
│   │   ├── overlay/          # Floating window overlay service
│   │   ├── permissions/      # Native permissions manager
│   │   ├── screenshot/       # Accessibility-assisted screenshot capture
│   │   └── shake/            # Shake detection sensor bridge
│   ├── navigation/           # Root Stack & Bottom Tabs navigators
│   ├── screens/              # Navigation barrel exports
│   └── theme/                # Dynamic light/dark theme colors and scales
├── app.json                  # Expo app manifest and Android permissions
├── eas.json                  # EAS Build profiles (preview, production)
└── package.json              # Mobile package manifest
```

---

## 4. Web Client Layout (`apps/web`)

The web client in `apps/web/` is built with React 18, Vite, and Tailwind CSS:

```
apps/web/
├── public/                   # Static assets (favicons, logos, app marks)
├── src/
│   ├── components/
│   │   ├── layout/           # AppLayout, TopBar, Sidebar, UserMenu, Modals
│   │   ├── tasks/            # ProjectContextPanel, SolutionPromptPanel
│   │   └── ui/               # Badge, Button, Card, Modal, Select, Toast
│   ├── lib/                  # API client, Auth store, Theme store, Workspace store
│   ├── pages/                # Route pages
│   │   ├── AllWorkPage.tsx   # Unified Work triage hub (/work)
│   │   ├── TasksPage.tsx     # Tasks list, HTML5 Drag-and-Drop Kanban, Table (/tasks)
│   │   ├── BugsPage.tsx      # Balanced master-detail bug queue (/bugs)
│   │   ├── StickiesPage.tsx  # Sticky board with Quick Compose (/stickies)
│   │   ├── HomePage.tsx      # Overview dashboard (/)
│   │   ├── ProjectsPage.tsx  # Projects management (/projects)
│   │   ├── TeamPage.tsx      # Team members and roles (/team)
│   │   ├── SettingsPage.tsx  # User, workspace, and AI credential settings (/settings)
│   │   └── LoginPage.tsx     # Authentication and workspace onboarding
│   ├── App.tsx               # Root router and layout providers
│   ├── main.tsx              # React DOM mounting
│   └── index.css             # Tailwind CSS tokens and CSS variables
├── vite.config.ts            # Vite build configuration
└── package.json              # Web package manifest
```
