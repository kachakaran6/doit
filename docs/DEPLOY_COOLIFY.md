# Hosting DoIt Backend on Coolify

This guide details how to deploy the **DoIt** production stack on your VPS using Coolify, including PostgreSQL, S3-compatible object storage, NestJS API, and optional Web frontend.

---

## 1. Stack Topology & Resources

In Coolify, create a project named `doit` with environment `production` (and optionally `staging`). Create the following separate resources:

| Resource | Coolify Type | Configuration Details |
|---|---|---|
| **doit-db** | Database -> PostgreSQL 16 | Internal only (no public port exposure). S3-compatible automated backup enabled. |
| **doit-storage** | Cloudflare R2 / Backblaze B2 / MinIO | Bucket `doit-uploads` (private). API communicates via `@aws-sdk/client-s3`. |
| **doit-api** | Application -> Dockerfile from Git | Dockerfile: `docker/api.Dockerfile`, Port: `3000`, Health Check: `/api/v1/health`. |
| **doit-web** | Application -> Dockerfile from Git | Dockerfile: `docker/web.Dockerfile`, Port: `80`, Same-origin reverse proxy. |

---

## 2. Server Sizing & VPS Setup

- **Recommended Specs**: 2 vCPU, 4 GB RAM, 80 GB NVMe SSD (Ubuntu 22.04 or 24.04 LTS).
- **Recommended Regions** (India / APAC): DigitalOcean Bangalore, AWS Mumbai (`ap-south-1`), Hetzner Singapore.
- **Firewall Rules**:
  - `22/tcp`: SSH access (key-based auth only; disable password login).
  - `80/tcp`, `443/tcp`: Public HTTP/HTTPS.
  - `8000/tcp`: Coolify dashboard (assign a custom domain e.g. `https://coolify.yourdomain.com` then restrict port 8000).

---

## 3. Step-by-Step Deployment

### Step 3.1: Create PostgreSQL Database (`doit-db`)
1. In Coolify, navigate to Project `doit` -> `+ New` -> **Database** -> **PostgreSQL**.
2. Configure:
   - **Name**: `doit-db`
   - **Database Name**: `doit`
   - **User**: `doit`
   - **Password**: Generate a high-entropy secret (e.g., `openssl rand -base64 32`).
3. Under **Backups**, connect an external S3 bucket (Cloudflare R2 or Backblaze B2) and set a daily schedule with 30-day retention.
4. Copy the **Internal Database URL**:
   ```
   postgresql://doit:<PASSWORD>@<INTERNAL_POSTGRES_HOST>:5432/doit
   ```

### Step 3.2: Configure S3 Object Storage
- **Option A (Recommended: Cloudflare R2)**:
  - Create private bucket: `doit-uploads`.
  - Create API Token with Admin Read & Write permissions.
  - Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
  - Region: `auto`
- **Option B (MinIO on Coolify)**:
  - Add Service -> MinIO.
  - Create bucket: `doit-uploads` with private access.
  - Internal endpoint: `http://minio:9000`

### Step 3.3: Deploy the API (`doit-api`)
1. In Coolify, click **+ New** -> **Application** -> **GitHub / Git Repository**.
2. Select repository `samyukt/doit` (or your repo URL) and branch `main`.
3. Set **Build Pack**: `Dockerfile`.
   - **Base Directory**: `/`
   - **Dockerfile Location**: `docker/api.Dockerfile`
   - **Ports Exposed**: `3000`
   - **Domains**: `https://api.yourdomain.com`
4. Configure **Health Check**:
   - **Path**: `/api/v1/health`
   - **Port**: `3000`
5. Paste environment variables into Coolify (refer to `.env.production.example`):
   ```env
   NODE_ENV=production
   PORT=3000
   PUBLIC_BASE_URL=https://api.yourdomain.com
   DATABASE_URL=postgresql://doit:<PASSWORD>@<INTERNAL_POSTGRES_HOST>:5432/doit
   JWT_SECRET=<MINIMUM_32_CHAR_RANDOM_SECRET>
   JWT_REFRESH_SECRET=<MINIMUM_32_CHAR_RANDOM_SECRET>
   STORAGE_DRIVER=s3
   S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_BUCKET=doit-uploads
   S3_ACCESS_KEY_ID=<YOUR_R2_ACCESS_KEY>
   S3_SECRET_ACCESS_KEY=<YOUR_R2_SECRET_KEY>
   S3_FORCE_PATH_STYLE=false
   TRUST_PROXY=1
   CORS_ORIGINS=https://app.yourdomain.com
   MIN_APP_VERSION=0.1.0
   ```
6. Click **Deploy**. The Docker container runs `npx prisma migrate deploy` followed by `node dist/main.js`.
7. Verify deployment:
   ```bash
   curl -i https://api.yourdomain.com/api/v1/health
   # Expected response: {"status":"ok","db":"up","version":"0.1.0",...}
   ```

### Step 3.4: Seed Initial Admin User
From Coolify's terminal on the `doit-api` container (or via SSH into the host):
```bash
npx ts-node prisma/seed.prod.ts
# or: pnpm db:seed:prod
```
This creates the initial administrative user without generating dummy tasks, fake users, or mock stickies.

### Step 3.5: Deploy Web Frontend (`doit-web`)
1. Click **+ New** -> **Application** -> Git Repository.
2. Build pack: `Dockerfile`
   - **Base Directory**: `/`
   - **Dockerfile Location**: `docker/web.Dockerfile`
   - **Ports Exposed**: `80`
   - **Domains**: `https://app.yourdomain.com`
3. Click **Deploy**.

---

## 4. Verification & Smoke Testing

Run the automated smoke test suite directly against your deployed HTTPS endpoint:

```bash
API_BASE_URL=https://api.yourdomain.com/api/v1 pnpm smoke
```

All 20 end-to-end flows (authentication, workspace management, task creation, stickies, JWT rotation, IDOR prevention, and ready probes) will run against the live server.

