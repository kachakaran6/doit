# DoIt — Full-Stack Task, Bug & Workspace Management Platform

<div align="center">

<img src="assets/DoIt-Icon-Mono/png/app/icon-512-solid.png" alt="DoIt Logo" width="120" height="120" style="border-radius: 26px;" />

### *High-performance, offline-first productivity platform engineered for focus and velocity.*

[![Release](https://img.shields.io/badge/Release-v0.3.5-3B82F6?style=for-the-badge&logo=github)](https://github.com/kachakaran6/doit/releases)
[![Mobile](https://img.shields.io/badge/React_Native-Expo_SDK_52-000000?style=for-the-badge&logo=expo)](apps/mobile)
[![Backend](https://img.shields.io/badge/NestJS-10.4-E0234E?style=for-the-badge&logo=nestjs)](apps/api)
[![Web](https://img.shields.io/badge/React_18-Vite_6-61DAFB?style=for-the-badge&logo=react)](apps/web)
[![Live_API](https://img.shields.io/badge/API_Status-Live-10B981?style=for-the-badge&logo=docker)](https://doit.kachakaran.tech/api/v1/health)
[![License](https://img.shields.io/badge/License-MIT-A1A1AA?style=for-the-badge)](LICENSE)

[**System Architecture**](docs/architecture/SYSTEM-ARCHITECTURE.md) • [**Local Setup Guide**](docs/development/LOCAL-SETUP.md) • [**Codebase Structure**](docs/development/PROJECT-STRUCTURE.md) • [**Coolify Deployment**](docs/deployment/COOLIFY-DEPLOYMENT.md) • [**Mobile Release Guide**](docs/deployment/MOBILE-RELEASE.md) • [**Changelog**](CHANGELOG.md)

</div>

---

## 1. Project Introduction

**DoIt** is an enterprise-grade productivity suite that unites task tracking, bug queue triage, quick scratchpad stickies, and team workspace collaboration. Designed for high information density, fluid micro-interactions, and instant multi-platform capture, DoIt provides:

- An **offline-first mobile client** (Android & iOS) with native quick-capture overlays, shake-to-report detection, and voice notes.
- A **production-grade NestJS backend** with PostgreSQL, Prisma ORM, S3/MinIO storage, and JWT/RBAC security.
- A **responsive web workspace** featuring native HTML5 drag-and-drop Kanban boards, row density controls, and a unified **All Work** triage hub.

---

## 2. Product Overview & Key Features

| Domain | Key Capabilities |
|---|---|
| **Tasks & Projects** | Multi-workspace scoping, project keys, custom color labels, priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), due dates, and sequential task human IDs (e.g. `GEN-5`). |
| **Kanban Boards** | Native HTML5 drag-and-drop board supporting `To do`, `In progress`, and `Done` columns with optimistic client updates and automatic network rollback. |
| **Bug Queue & Telemetry** | Triage queue for mobile and web issues with captured screenshots (click-to-expand lightbox), voice notes, and hardware/OS device telemetry. |
| **Unified All Work Hub** | Consolidated stream at `/work` unifying tasks and bugs into a single triage view with multi-criteria filtering and dual List/Table views. |
| **Sticky Notes Board** | Interactive spatial notes canvas with an inline Quick Compose card, color tags, pinboard controls, and one-click sticky-to-task conversion. |
| **Native Mobile Capture** | System-wide floating capture bubble, accelerometer-driven shake-to-report, and accessibility-assisted screenshot capture. |
| **Context AI Engine** | Project architecture context ingestion and automated AI solution prompt generation with AES-256-GCM encrypted provider credentials. |
| **Offline Reliability** | Optimistic local mutations with an encrypted offline outbox queue and automated background sync. |

---

## 3. Technology Stack

```
DoIt Monorepo (pnpm workspaces + Turborepo)
├── Apps
│   ├── Mobile:  React Native 0.76.9, Expo SDK 52, Reanimated 3, React Navigation 7, Zustand, TanStack Query 5
│   ├── Backend: NestJS 10.4, Express, TypeScript 5.8, Prisma ORM 5.22, PostgreSQL 16, Argon2id, Passport JWT
│   └── Web:     React 18.3, Vite 6, Tailwind CSS, TanStack Query 5, Lucide Icons
└── Shared Packages
    ├── @doit/contracts:     Canonical Zod validation schemas and DTO interfaces
    ├── @doit/tokens:        Design token system, typography scales, light/dark themes
    └── @doit/config:        Shared TypeScript base configurations
```

---

## 4. System Architecture

```mermaid
graph TD
    subgraph Clients["Clients"]
        Mobile["📱 Mobile App (React Native / Expo SDK 52)"]
        Web["💻 Web Workspace (React 18 / Vite / Tailwind)"]
    end

    subgraph Shared["Shared Workspace Packages"]
        Contracts["@doit/contracts (DTOs & Zod Schemas)"]
        Tokens["@doit/tokens (Design Tokens & Color Scales)"]
    end

    subgraph Edge["Reverse Proxy & Routing"]
        Proxy["Reverse Proxy (Coolify / Traefik / Nginx)"]
    end

    subgraph Backend["NestJS 10 API Server (:3000)"]
        Gateway["REST Controllers & WebSocket Gateway"]
        Auth["Auth & RBAC Guards (Argon2id + JWT)"]
        TaskEngine["Tasks & Kanban State Engine"]
        BugEngine["Bug Queue & Telemetry Processing"]
        StickiesEngine["Sticky Notes & Conversion"]
        AiEngine["Context AI & AES-256-GCM Secret Store"]
        StorageAdapter["S3 / MinIO Storage Driver"]
    end

    subgraph Persistence["Storage & Database"]
        DB[(PostgreSQL 16 Database)]
        Prisma[(Prisma ORM)]
        S3[(MinIO / AWS S3 Object Storage)]
    end

    Mobile --> Contracts
    Mobile --> Tokens
    Web --> Contracts
    Web --> Tokens

    Mobile -- "HTTPS / WSS" --> Proxy
    Web -- "HTTPS" --> Proxy

    Proxy --> Gateway
    Gateway --> Auth
    Gateway --> TaskEngine
    Gateway --> BugEngine
    Gateway --> StickiesEngine
    Gateway --> AiEngine

    TaskEngine --> Prisma
    BugEngine --> Prisma
    BugEngine --> StorageAdapter
    StorageAdapter --> S3
    Prisma --> DB
```

For complete technical specifications, see [System Architecture Specification](docs/architecture/SYSTEM-ARCHITECTURE.md).

---

## 5. Repository Structure

```
DoIt/
├── apps/
│   ├── api/                  # NestJS production backend
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
├── assets/                   # Vector and raster brand identity icons
├── playstore-assets/         # Google Play Store graphic assets & disclosure video
├── scripts/                  # Monorepo build and package sync scripts
├── docker-compose.coolify.yml# Production & local Docker Compose stack
├── package.json              # Monorepo root manifest
├── pnpm-workspace.yaml       # Workspace definition for pnpm
├── turbo.json                # Turborepo task pipeline configuration
├── CHANGELOG.md              # Historical version changelog
└── LICENSE                   # MIT License
```

For a comprehensive breakdown, see [Project Structure Guide](docs/development/PROJECT-STRUCTURE.md).

---

## 6. Quick Start & Local Setup

### Prerequisites
* **Node.js**: `>= 20.12.0` (LTS)
* **pnpm**: `>= 9.0.0` (`npm install -g pnpm`)
* **Docker & Docker Compose** (for PostgreSQL and MinIO)
* **Java 17 JDK & Android SDK** (for local Android builds)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kachakaran6/doit.git
cd doit
pnpm install
```

### 2. Start Local Infrastructure
```bash
docker compose -f docker-compose.coolify.yml up -d db minio minio-init
```
* **PostgreSQL**: `localhost:5432` (`doit` / `doit_secure_pass_2026`)
* **MinIO Console**: `http://localhost:9001` (`minioadmin` / `minioadmin_secure_pass`)

### 3. Run the Backend API
```bash
# Configure environment variables
cp apps/api/.env.example apps/api/.env

# Run database migrations and seed default workspace
pnpm --filter @doit/api prisma:migrate
pnpm --filter @doit/api db:seed

# Start NestJS in watch mode
pnpm --filter @doit/api dev
```
* Health Endpoint: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
* Swagger Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### 4. Run the Web Workspace
```bash
pnpm --filter @doit/web dev
```
* Web Dashboard: [http://localhost:5173](http://localhost:5173)

### 5. Run the Mobile App
```bash
pnpm --filter @doit/mobile start
```
* Press `a` to launch in the Android Emulator.

For detailed configuration steps, see [Local Development Guide](docs/development/LOCAL-SETUP.md).

---

## 7. Environment Variables Reference

A summary of essential production environment variables:

| Variable | Scope | Description |
|---|---|---|
| `PORT` | API | HTTP listener port (default: `3000`). |
| `DATABASE_URL` | API | PostgreSQL connection string (`postgresql://user:pass@host:5432/doit`). |
| `JWT_SECRET` | API | Secret for signing short-lived (15m) access tokens. |
| `JWT_REFRESH_SECRET` | API | Secret for signing rotating (7d) refresh tokens. |
| `AI_CREDENTIALS_KEY` | API | **Required** (16+ chars). AES-256-GCM encryption key for AI provider keys. |
| `STORAGE_DRIVER` | API | `s3` for production S3/MinIO; `local` for disk storage. |
| `S3_ENDPOINT` | API | S3 endpoint URL (`http://minio:9000` or AWS endpoint). |
| `S3_BUCKET` | API | Upload bucket name (default: `doit-uploads`). |
| `VITE_API_BASE_URL` | Web | Public API base URL (`https://api.yourdomain.com/api/v1`). |
| `EXPO_PUBLIC_API_URL` | Mobile | Public or local API URL reachable by device/emulator. |

---

## 8. Deployment Overview

### Coolify Production Deployment
The backend and web applications deploy via Docker Compose using [`docker-compose.coolify.yml`](docker-compose.coolify.yml):
1. Create a **Docker Compose** service in Coolify pointing to this repository (`main` branch).
2. Set the Compose file path to `docker-compose.coolify.yml`.
3. Add the required environment variables.
4. Coolify handles reverse proxy routing, Let's Encrypt SSL/TLS certificates, and automated health checks (`/api/v1/health`).

For the complete guide, see [Coolify Deployment Guide](docs/deployment/COOLIFY-DEPLOYMENT.md).

### Mobile Release Pipeline (EAS Build)
The mobile application uses Expo Application Services (EAS):
```bash
# Build preview APK for QA and internal sideload testing
pnpm --filter @doit/mobile build:apk

# Build production Android App Bundle (AAB) for Google Play Store
pnpm --filter @doit/mobile build:aab
```
For Google Play submission requirements and permission disclosures, see [Mobile Release Guide](docs/deployment/MOBILE-RELEASE.md).

---

## 9. Verification & Testing Commands

Execute verification checks across all packages:

```bash
# Backend Test Suite (Jest, 20 test suites, 76 tests)
pnpm --filter @doit/api test

# Backend TypeScript Build
pnpm --filter @doit/api build

# Mobile TypeScript Check
pnpm --filter @doit/mobile typecheck

# Web Production Build (Vite)
pnpm --filter @doit/web build

# Shared Contracts & Design Token Tests
pnpm --filter @doit/contracts test
pnpm --filter @doit/tokens test

# Monorepo Orchestrated Build (Turborepo)
pnpm run build

# Monorepo Linter (ESLint)
pnpm run lint
```

---

## 10. Security & Compliance

* **Authenticated Secrets**: Personal AI credentials (OpenRouter, OpenAI, Anthropic, Gemini) are never stored in plaintext; they are AES-256-GCM encrypted at rest using `AI_CREDENTIALS_KEY`.
* **Database Protection**: Passwords use salted Argon2id hashing. Prisma migrations run through deterministic versioning. Sensitive fields are stripped in response mappers.
* **Google Play Compliance**: Native Android accessibility and foreground services implement strict runtime permissions with user consent and prominent disclosure modals. A verification walkthrough is archived in `playstore-assets/accessibility_disclosure.mp4`.

---

## 11. Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/amazing-feature`).
2. Adhere to TypeScript strict mode and existing ESLint rules.
3. Verify all tests pass (`pnpm run test` and `pnpm run typecheck`).
4. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat(tasks): add priority filter shortcut'`).
5. Push to your branch and open a Pull Request.

---

## 12. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
