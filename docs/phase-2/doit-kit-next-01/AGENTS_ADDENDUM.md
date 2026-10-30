# AGENTS.md addendum

14. **Naming**: company = Samyukt, product = DoIt. Follow `docs/11`. `node scripts/check-naming.mjs` must pass.
15. **Mobile UI = gluestack-ui v5** using ONLY semantic tokens, component props over className, className over inline styles (see skill + `docs/12`). No numbered/raw colors anywhere.
16. **Web UI = shadcn/ui + Tailwind v4**, same semantic token names as mobile, generated from `@doit/tokens`.
17. **"Verified" means evidence.** In STATUS.md state *how* (test name, device model, screenshot/log). Unit tests do not verify overlay, voice, widgets, push, or haptics; those need real devices.
18. **Web security rules** in `docs/14` are non-negotiable (no tokens in localStorage, CSP, CSRF protection, same-origin or strict CORS).
19. **Shared contract**: web and mobile consume `@doit/contracts` only. No duplicated types.
