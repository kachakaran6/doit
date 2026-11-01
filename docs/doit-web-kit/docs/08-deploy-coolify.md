# 08 — Deploy on Coolify

## Shape
One container `doit-web`: nginx serving the static build and **reverse-proxying `/api` and `/ws` to the API's internal hostname**. Browser sees a single origin (`https://app.example.com`) → cookies work simply, no CORS in production.

## Build & container
- `docker/web.Dockerfile` multi-stage: pnpm install → build `@doit/web` → nginx:alpine with `docker/nginx.conf`.
- nginx: `client_max_body_size 25m`; gzip/brotli; **hashed assets** `Cache-Control: public, max-age=31536000, immutable`; `index.html` and `config.json` `no-cache`; SPA fallback `try_files $uri /index.html`; WS upgrade headers on `/ws`; `proxy_set_header X-Forwarded-*`; do **not** forward arbitrary client `Host`/`X-Forwarded-For` blindly (set from nginx).
- Security headers: CSP (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: <storage/signed-url origin if different>; media-src 'self' blob: <storage origin>; connect-src 'self' wss:; frame-ancestors 'none'; base-uri 'none'; object-src 'none'`), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, COOP same-origin, minimal `Permissions-Policy`. Adjust `img-src/media-src` if signed URLs point to R2/MinIO domain.
- Non-root nginx, healthcheck `GET /healthz` (static 200).

## Coolify steps
1. New resource → Application → Git repo → Build pack **Dockerfile** → path `docker/web.Dockerfile`, base dir `/`.
2. Domain `https://app.example.com`; port 80.
3. Env: `API_INTERNAL_URL=http://<api-internal-host>:3000` (substituted into nginx at container start via envsubst template).
4. Auto-deploy on push to `main` (production) / `staging` branch → staging resource with its own domain.
5. API settings: `CORS_ORIGINS` includes the web origin only if you ever bypass the proxy; `TRUST_PROXY=1`; cookie domain host-only; allowed Origin list includes `https://app.example.com` (CSRF check).
6. Verify after deploy: login works, refresh cookie attributes, `/ws` connects, uploads ≥ 10 MB succeed, headers test, Lighthouse.

## CI (GitHub Actions)
lint (incl. token/raw-color lint) → typecheck → unit → build → Playwright (against docker-compose API+DB) → axe → Lighthouse CI → `pnpm audit` → image build → deploy webhook to staging → smoke → manual promote.

## Monitoring
Sentry (release, source maps uploaded in CI, not served), Uptime Kuma on `/healthz` and a login-page check, web-vitals to your analytics/Sentry.

## Rollback
Keep previous 3 image tags; one-click redeploy in Coolify; the SPA is stateless so rollback is safe provided API changes are backward-compatible (additive).
