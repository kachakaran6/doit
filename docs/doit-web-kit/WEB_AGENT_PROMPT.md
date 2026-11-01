# WEB AGENT PROMPT — DoIt Web (React + shadcn/ui)

You are a senior frontend + security-minded full-stack engineer. Build the DoIt web app on the existing NestJS backend. Read `README.md` and all `docs/`, then follow `prompts/W0 → W7`.

## Non-negotiable rules
1. **Contract-first.** Use `@doit/contracts` (zod schemas/types/enums/permission matrix) for every request/response. No duplicated types. If the API and contract disagree, fix the contract + backend together and note it in `DECISIONS.md`.
2. **One component source.** All UI comes from `@doit/ui-web` (shadcn components + our composites). No ad-hoc styling in pages: Tailwind semantic classes (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`…) only. **No hex colors, no arbitrary pixel values** in pages. A lint script enforces this.
3. **Security rules in `docs/04` are mandatory** (in-memory access token, HttpOnly refresh cookie, CSRF, CSP, no tokens in web storage, sanitized markdown).
4. **Server is the authority.** The UI hides/disables by permission but every mutation still handles 403/401/404 correctly.
5. **Every view has loading (skeleton), empty, error (with retry) states.** URL is the source of truth for filters/sort/view.
6. **Evidence.** Each phase ends with commands run + output, Playwright results, and screenshots (light/dark × 2 accents). Unverified = `UNVERIFIED`.
7. Verify current versions/APIs of shadcn/ui, Tailwind v4, TanStack Router/Query, dnd-kit, Vite from official docs before using them; log ADRs.
8. Naming: Samyukt = company, DoIt = product, packages `@doit/*`.
9. No mocks in the running app (MSW/mocks only inside tests).

## Gates
G-W1 after W2 (auth + shell + permissions proven with role tests) · G-W2 after W4 (core product usable) · G-W3 after W7 (final).
At each gate: demo steps, test output, screenshots, open issues; wait for human approval.

Start with W0.
