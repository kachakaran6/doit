# Samyukt (Doit) — Mobile Task Manager & Instant Bug Capture

Samyukt is a lightweight, high-speed mobile task management and instant mobile QA/bug capture system.

- **Package Name (Android / Play Store):** `com.samyukt.doit` (also compatible with `samyukt.doit.app`)
- **Monorepo structure:** Turborepo + pnpm workspaces
- **API:** NestJS 10+, PostgreSQL 16, Prisma
- **Mobile:** React Native (Expo prebuild / bare), TypeScript strict

## Repository Structure

```
.
├── apps/
│   ├── api/                  # NestJS REST backend
│   └── mobile/               # React Native (Expo) mobile client
├── packages/
│   ├── config/               # Shared tsconfig, eslint, prettier presets
│   ├── contracts/            # Zod schemas & shared API contract types
│   └── design-tokens/        # Shared tokens (colors, space, radius, typography)
├── docs/                     # Specifications and agent orchestration kits
├── turbo.json                # Turborepo task pipelines
├── pnpm-workspace.yaml       # Workspace configuration
└── PROGRESS.md               # Continuous project progress log
```

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Typecheck & Lint
```bash
pnpm typecheck
pnpm lint
```

### 3. Run Backend API
```bash
pnpm --filter api dev
# Health check available at: http://localhost:3000/api/v1/health
```

### 4. Run Mobile App
```bash
pnpm --filter mobile start
```

