# 01 — Host the backend on Coolify (separate services)

## The services (each = its own Coolify resource)
| # | Service | Required? | Type in Coolify | Notes |
|---|---|---|---|---|
| 1 | **PostgreSQL 16** | Yes | Database resource | Internal only (no public port). Enable **scheduled backups to S3-compatible storage** |
| 2 | **API (NestJS)** | Yes | Application (Dockerfile) from Git | Port 3000, health `/api/v1/health`, runs migrations on start |
| 3 | **Object storage (MinIO)** | Recommended | One-click service | Screenshots + audio. Alternative: Cloudflare R2 / Backblaze B2 / AWS S3 (no server to maintain). API talks to it via S3 adapter; clients never get public bucket access |
| 4 | **Web app** | When built | Application (Dockerfile) | Static nginx; proxies `/api` and `/ws` to the API (same origin) |
| 5 | **ASR / Whisper** | Optional | Application (Docker image) | Heavy on RAM. On a small server use a hosted provider (OpenAI/Sarvam) instead, or give it its own bigger VPS |
| 6 | **Redis** | Only if background jobs use BullMQ | Database resource | Skip if jobs run in-process/Postgres |
| 7 | **Uptime Kuma** | Recommended | One-click service | Pings `/health`, alerts to Telegram/email/WhatsApp-bridge |
| 8 | **Sentry** | Recommended | Use Sentry cloud (free tier) | Self-hosting Sentry is heavy; don't |
| 9 | **Backup target** | Yes | S3 bucket (R2/B2/MinIO on *another* machine) | Backups on the same server aren't backups |

## Server
- **Size**: 2 vCPU / 4 GB RAM minimum for API + Postgres + MinIO + Kuma. Add 4–8 GB more if you run Whisper locally (or use a second server).
- **Location** (you're in India): choose a Mumbai/Bangalore/Singapore region for low latency (e.g. DigitalOcean Bangalore, AWS Mumbai, Hetzner Singapore, Vultr). Ubuntu 22.04/24.04 LTS.
- **Disk**: 80 GB+ SSD; screenshots grow. Add alert at 80% usage.

## Step 1 — Prepare server
1. Create the VPS, add your SSH key, disable password SSH login.
2. Firewall: allow 22 (your IP if possible), 80, 443. Port 8000 (Coolify UI) only until you give Coolify its own domain, then close it.
3. Install Coolify with the **official install command from the Coolify docs** (verify the current command at coolify.io/docs; it's a one-line script run as root).
4. Open `http://SERVER_IP:8000`, create the admin account, and **turn on 2FA**.
5. Settings → set the Coolify instance domain (e.g. `coolify.example.com`) with HTTPS.

## Step 2 — Domains (Cloudflare or any DNS)
Create A records to the server IP:
- `api.example.com` → API
- `app.example.com` → web (later)
- `status.example.com` → Uptime Kuma
Use "DNS only" (grey cloud) at first so Let's Encrypt issuance is simple; turn on proxying later if you want.

## Step 3 — Connect Git
Coolify → Sources → add **GitHub App** (private repo) → grant the DoIt repo. This enables auto-deploy on push.

## Step 4 — Create Postgres
Project `doit` → Environment `production` → **+ New → Database → PostgreSQL 16**.
- Name `doit-db`, DB `doit`, user `doit`, **strong generated password**.
- Do **not** make it public.
- Copy the **internal connection URL** (looks like `postgresql://doit:PASS@<internal-host>:5432/doit`).
- Backups tab: add your S3 destination, schedule daily, retention 14–30 days. Run "Backup now" and confirm the file appears in the bucket.

## Step 5 — Object storage
Option A (simplest ops): **Cloudflare R2 or Backblaze B2** → create bucket `doit-uploads` (private) + API key → note endpoint, access key, secret.
Option B: **MinIO** one-click service in Coolify → create bucket `doit-uploads` (private), create an access key limited to that bucket. Keep MinIO console off the public internet (or behind its own domain + strong password).
The API must use an **S3 storage adapter** (`STORAGE_DRIVER=s3`). Files are streamed by the API after authorization or via short-lived signed URLs. Never make the bucket public.

## Step 6 — Deploy the API
+ New → **Application** → your repo → Build pack **Dockerfile**:
- Base directory `/`
- Dockerfile location `docker/api.Dockerfile`
- Port exposed `3000`
- Domain `https://api.example.com`
- Health check: path `/api/v1/health`, port 3000 (enable)
- Environment variables: paste from `templates/.env.production.example` (mark secrets). Use the **internal** DB URL.
- Persistent storage: only needed if `STORAGE_DRIVER=local` (mount `/app/uploads`). With S3 you don't need it.
- Deploy. Watch logs: migrations should run, then "listening".
- Test: `curl https://api.example.com/api/v1/health` → `{"status":"ok","db":"up"}`.
- Turn on **Auto Deploy** (push to `main` → deploy). Better: deploy `staging` branch to a staging resource first.

Generate secrets locally: `openssl rand -base64 48` for each `JWT_*` secret.

## Step 7 — Seed the first admin (production)
Run once from Coolify's terminal on the API container: the production seed command defined by the repo (admin only, no demo data). Then register from the app.

## Step 8 — Optional services
- **Web**: Application → Dockerfile `docker/web.Dockerfile` → domain `app.example.com`. Container serves the static build and proxies `/api` + `/ws` to the API's **internal** hostname.
- **ASR**: separate application/container exposing an internal HTTP endpoint; set `ASR_PROVIDER=local` and `ASR_URL=http://<internal-host>:PORT`. If RAM is tight, set `ASR_PROVIDER=openai` (or `sarvam`) and the API key instead.
- **Uptime Kuma**: one-click, add HTTPS monitor on `https://api.example.com/api/v1/health` (1-min interval) + notification channel.

## Step 9 — Staging (strongly recommended)
Duplicate the setup in an `staging` environment: separate DB, bucket, secrets, domain `staging-api.example.com`. Testers' preview APK points to staging; the Play build points to production.

## Step 10 — Hardening & operations checklist
- [ ] DB and MinIO not reachable from the internet
- [ ] HTTPS valid, HTTP redirects to HTTPS
- [ ] `CORS_ORIGINS` limited to your web origin (native app doesn't need CORS)
- [ ] Backups run, **restore tested once** into a throwaway instance
- [ ] Disk/RAM alerts; Uptime Kuma alert tested
- [ ] OS auto-security-updates on; reboot window decided
- [ ] Coolify admin 2FA on; Coolify UI not on raw IP:8000
- [ ] `pnpm smoke` (from the repo) run against the production URL once after deploy

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| Deploy fails at build | Dockerfile path/context wrong (must be monorepo root) or lockfile mismatch |
| API restarts in a loop | Bad `DATABASE_URL` (use internal URL), or env validation rejecting weak secrets |
| 502/Bad Gateway | Container port ≠ 3000, or health check failing |
| App says "Request failed" | App built with wrong `EXPO_PUBLIC_API_URL`, or HTTP instead of HTTPS |
| Uploads fail | Missing S3 env, bucket name/region wrong, request size limit (proxy/body limit < 25 MB) |
| Cert not issued | DNS not pointing yet, or Cloudflare proxy on during issuance |
