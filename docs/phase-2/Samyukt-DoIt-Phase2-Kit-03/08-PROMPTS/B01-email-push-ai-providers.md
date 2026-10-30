# B01 — Real Email, Push and AI Providers

**Lane** B · **Depends on** B00 · **Branch** `feat/b01-email-push-ai-providers`

## Load
- `09-PHASE2-RULES.md`
- `06-API-CONTRACT.md` (Phase 1) §6.2, §6.8
- `11-TECH-DECISIONS.md` (Phase 1) ADR-004
- `00-WHAT-REMAINS.md` §A5

## Goal
Replace three silent fallbacks with real providers, so invites arrive, pushes show and
transcripts come back.

## Deliverables
- `MailService` with a real transport (Resend / SES / Postmark — pick one) + HTML templates:
  invite, verify, password reset, workspace role change
- FCM + APNs wired, with `POST /devices` storing real tokens and a `PushService`
- transcription provider configured in production; queue worker with retry and dead-letter
- `prompts/structure-bug.v1.md` versioned, with the model call behind a flag
- `docs/PROVIDERS.md` — which provider, which env vars, cost per unit, how to swap
- a cost guard: per-workspace monthly transcription minutes, soft warning at 80%

## Requirements
- Email: transactional only, no marketing. SPF, DKIM and DMARC configured on the sending
  domain — without DMARC your invites land in spam and you will blame the code.
- Templates: plain, on-brand, one primary action, a visible plain-text URL fallback. Test them
  in Gmail, Outlook and Apple Mail.
- Push: token refresh on login and on `app_open`; prune tokens FCM reports as unregistered.
  Deep link in the payload; the app handles it in the background and foreground.
- Transcription: provider interface already exists — add the production implementation and
  remove the "console/local fallback" path from production config entirely. If no provider is
  configured, the API must return a clear `503 TRANSCRIPTION_UNAVAILABLE` instead of silently
  returning an empty transcript.
- Verify the current model name, endpoint and supported languages against the provider's own
  docs before wiring — do not copy a model id from a blog post.

## Do not
- Do not send email from a `gmail.com` address.
- Do not hardcode API keys — env only, and document them in `.env.example` with fake values.
- Do not let a transcription failure block the bug report; the audio is still saved.

## Acceptance checks
- [ ] An invite email lands in a real Gmail inbox (not spam) with a working link.
- [ ] Password reset completes end to end on both mobile and web.
- [ ] A push arrives on a physical Android device and a physical iPhone from a production build.
- [ ] Tapping the push opens the correct item.
- [ ] A 20 s Hindi clip transcribes with a non-empty result and `engine` set.
- [ ] With the provider env var removed, upload returns `503 TRANSCRIPTION_UNAVAILABLE` and the
      audio is still stored.
- [ ] `docs/PROVIDERS.md` lists cost per 100 bug reports for each option.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
