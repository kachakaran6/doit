# DoIt — Local Development & Setup Guide

This guide covers everything you need to run, test, and contribute to the DoIt monorepo on your local machine.

---

## 1. Prerequisites

Ensure your development machine has the following tools installed:

| Tool | Recommended Version | Purpose |
|---|---|---|
| **Node.js** | `>= 20.12.0` (LTS) | JavaScript / TypeScript runtime |
| **pnpm** | `>= 9.0.0` | Monorepo package manager (`npm install -g pnpm`) |
| **Docker & Compose** | Latest | Running local PostgreSQL and MinIO S3 services |
| **Git** | Latest | Version control |
| **Expo CLI** | Latest | Running React Native development client (`npx expo`) |
| **Java JDK** | JDK 17 (Temurin recommended) | Required for local Android builds |
| **Android Studio** | Latest | Android SDK & emulator for mobile development |

---

## 2. Initial Monorepo Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kachakaran6/doit.git
   cd doit
   ```

2. **Install all dependencies**:
   ```bash
   pnpm install
   ```

3. **Build shared packages**:
   ```bash
   pnpm run build
   ```
   This compiles `@doit/contracts`, `@doit/tokens`, and synchronizes packages across workspace projects.

---

## 3. Starting the Local Infrastructure (Docker)

To run the local database and S3 storage services:

```bash
docker compose -f docker-compose.coolify.yml up -d db minio minio-init
```

This starts:
* **PostgreSQL 16**: Port `5432` (User: `doit`, Password: `doit_secure_pass_2026`, DB: `doit`)
* **MinIO S3**: Port `9000` (API), Port `9001` (Web Console, User: `minioadmin`, Password: `minioadmin_secure_pass`)
* **Bucket Init**: Automatically creates the `doit-uploads` S3 bucket.

---

## 4. Backend Setup (`apps/api`)

1. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Key environment variables in `apps/api/.env`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://doit:doit_secure_pass_2026@localhost:5432/doit"
   JWT_SECRET="local_dev_jwt_secret_min_32_chars_long_12345"
   JWT_REFRESH_SECRET="local_dev_jwt_refresh_secret_min_32_chars_12345"
   AI_CREDENTIALS_KEY="local_dev_ai_credentials_key_at_least_16_chars"
   STORAGE_DRIVER="s3"
   S3_ENDPOINT="http://localhost:9000"
   S3_REGION="auto"
   S3_BUCKET="doit-uploads"
   S3_ACCESS_KEY_ID="minioadmin"
   S3_SECRET_ACCESS_KEY="minioadmin_secure_pass"
   S3_FORCE_PATH_STYLE="true"
   ```

2. **Run Prisma Migrations & Seed Data**:
   ```bash
   pnpm --filter @doit/api prisma:generate
   pnpm --filter @doit/api prisma:migrate
   pnpm --filter @doit/api db:seed
   ```

3. **Start the API Server**:
   ```bash
   pnpm --filter @doit/api dev
   ```
   * Health endpoint: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
   * Swagger OpenAPI Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 5. Web Workspace Setup (`apps/web`)

1. **Configure Environment Variables**:
   In `apps/web/.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:3000/api/v1"
   ```

2. **Start the Development Server**:
   ```bash
   pnpm --filter @doit/web dev
   ```
   Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 6. Mobile Application Setup (`apps/mobile`)

1. **Configure Environment Variables**:
   In `apps/mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL="http://10.0.2.2:3000/api/v1"
   ```
   *(Note: Use `http://10.0.2.2:3000/api/v1` when testing on the Android Emulator, or your machine's local LAN IP for physical device testing).*

2. **Start the Expo Development Server**:
   ```bash
   pnpm --filter @doit/mobile start
   ```

3. **Run on Android**:
   ```bash
   pnpm --filter @doit/mobile android
   ```

---

## 7. Testing Commands

Execute verification checks across the entire stack:

```bash
# Run all unit test suites in NestJS API
pnpm --filter @doit/api test

# Run TypeScript checks across mobile app
pnpm --filter @doit/mobile typecheck

# Run web production build check
pnpm --filter @doit/web build

# Run shared contracts & design token tests
pnpm --filter @doit/contracts test
pnpm --filter @doit/tokens test

# Full Monorepo Build Check
pnpm run build
```
