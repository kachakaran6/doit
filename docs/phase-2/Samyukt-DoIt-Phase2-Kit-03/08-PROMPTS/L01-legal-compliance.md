# L01 — Legal, Privacy, DPDP Compliance, Deletion & Export

**Lane** L · **Depends on** nothing · **Branch** `feat/l01-legal-compliance`

## Load
- `09-PHASE2-RULES.md`
- `10-LAUNCH-CHECKLIST.md` §6
- `12-NATIVE-CAPABILITIES.md` (Phase 1) §3 (data collected)

## Goal
Put a legal floor under the product before anyone outside the team logs in. This is not a
lawyer's job — it is a build task that produces the artefacts a lawyer reviews.

## Deliverables
- Privacy policy page at `samyukt.com/privacy` and in-app links from both clients
- Terms of service at `samyukt.com/terms`
- `GET /me/export` (JSON, queued, emailed as a link) — wired in both clients
- `DELETE /me` (30-day grace, then hard delete) + an email confirmation with a cancel link
- sub-processor list published
- DPDP notice + consent screen for audio/screenshot capture, and a grievance officer contact
- `docs/PRIVACY-ENGINEERING.md` mapping every collected field to its purpose and retention

## Requirements
- The privacy policy must state, in plain language: what is collected (account data, tasks,
  audio recordings, screenshots, device identifiers), why, where it is stored, who else sees it
  (sub-processors: hosting, object storage, email, AI transcription), how long, and how to
  delete it.
- Consent for audio/screenshot capture is a separate, explicit, recorded act — not buried in the
  terms. Store `{userId, purpose, version, acceptedAt}`.
- Account deletion must actually delete: user row, sessions, memberships, and — critically —
  **attachments in object storage**, via a queue job with a verification step.
- Export must be complete: tasks, comments, stickies, bugs, attachments as signed URLs, audio.
- India DPDP Act 2023: publish a notice, name a grievance officer with a contact that a human
  answers, and write down the breach-notification process (72 hours is the practical bar).
- Retention: audio deleted after 12 months unless attached to a task; logs 30 days; backups 7.

## Do not
- Do not copy another company's privacy policy.
- Do not make deletion "soft" and call it done — verify the storage objects are gone.
- Do not treat consent as a checkbox in the signup form.
- Do not claim GDPR compliance if you have not done the DPA work — say what is true.

## Acceptance checks
- [ ] Privacy policy and terms are live at public URLs and linked from both apps' settings.
- [ ] Export produces a complete JSON bundle; a human can read it.
- [ ] Delete account → data gone from DB **and** storage after the grace period; verified.
- [ ] Capture consent is recorded with a version and timestamp; declining still lets the user
      type a bug manually.
- [ ] Grievance officer contact is published and monitored.
- [ ] `docs/PRIVACY-ENGINEERING.md` lists every field, purpose and retention period.

## Output
Reply with: (1) a 5-line summary, (2) files created/changed, (3) the pasted output of every
acceptance check including the device/emulator used, (4) the `PROGRESS.md` diff.
