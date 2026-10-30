# P07 — Attachments & Uploads

**Lane** A · **Depends on** P04 · **Branch** `feat/p07-attachments`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.7
- `05-DATA-MODEL.md` §5.2 (`Attachment`)

## Goal
Three-step resumable uploads with thumbnails, so screenshots and recordings can be attached to
tasks, bugs and comments.

## Deliverables
- `modules/attachments/` — init, complete, delete, list
- `StorageService` presigned-URL path for S3 and the local driver for dev
- thumbnail worker (images via sharp, video via ffmpeg frame at 0.5 s)
- MIME/size validation + magic-byte sniffing
- tests: size rejection, mime spoofing rejection, thumbnail generation

## Requirements
- `POST /uploads/init` validates `contentType` against an allow-list
  (`image/jpeg|png|webp|heic`, `video/mp4|quicktime`, `audio/m4a|mp4|wav|aac`,
  `application/pdf`) and `sizeBytes` against the per-kind limit. Returns a presigned PUT valid
  for 15 min.
- `POST /uploads/:id/complete` verifies the object exists, sniffs magic bytes, rejects a
  mismatch with `422 UNPROCESSABLE`, writes the `Attachment` row, and queues the thumbnail job.
- Attachment rows attach to exactly one of `taskId | bugId | commentId` — enforce with a DB
  check constraint.
- Deleting a task deletes its storage objects via a queue job, not inline.
- Return URLs are signed and short-lived (1 h); the client caches nothing long-term.

## Do not
- Do not store files on the API's local disk in production config.
- Do not accept `image/svg+xml` (XSS vector).
- Do not process media synchronously in the request.

## Acceptance checks
- [ ] Init → PUT → complete produces an `Attachment` with `thumbUrl` for an image.
- [ ] Uploading 13 MB image → `413 PAYLOAD_TOO_LARGE` at init, before any bytes move.
- [ ] A `.png` that is actually a PDF → rejected at complete with `422`.
- [ ] Delete a task with 2 attachments → both storage objects removed by the worker.
- [ ] Interrupted PUT can be resumed (ranged PUT) — verified manually with curl.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
