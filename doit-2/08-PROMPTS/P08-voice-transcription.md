# P08 — Voice Capture & Transcription

**Lane** A · **Depends on** P07 · **Branch** `feat/p08-voice`

## Load
- `09-AGENT-RULES.md`
- `06-API-CONTRACT.md` §6.8
- `05-DATA-MODEL.md` §5.2 (`VoiceNote`)
- `11-TECH-DECISIONS.md` ADR-004

## Goal
Server half of the voice pipeline: accept audio, normalise it, transcribe it with the configured
provider, and hand back structured text. Also the LLM step that turns a transcript into a
suggested bug title / severity / steps.

## Deliverables
- `modules/voice/` — upload, get, patch text, attach
- `infra/ai/TranscriptionProvider` interface with three implementations: `LocalWhisper`,
  `OpenAIWhisper`, `SarvamAsr`; selected by `AI_TRANSCRIPTION_PROVIDER`
- BullMQ worker `transcribe` with ffmpeg normalisation (16 kHz mono wav)
- `infra/ai/structuring.ts` — transcript → `{title, severity, steps[], labels[]}` suggestion
- `POST /voice/:id/structure` returning the suggestion (never auto-applied)
- tests with a fixture audio file and a mocked provider

## Requirements
- Provider interface: `transcribe(filePath, language): Promise<{text, engine, confidence}>`.
  A provider failure must not lose the audio; it sets `state = FAILED` with `retryable: true`.
- Language codes: `en-IN`, `hi-IN`, `mr-IN`, `ta-IN`, `te-IN`; `auto` lets the provider detect.
- Structuring prompt must be a versioned file (`prompts/structure-bug.v1.md`) with the tester's
  raw words preserved verbatim in `description`; the model only proposes title/severity/steps.
- Timeouts: transcription 60 s, structuring 15 s; both fall back gracefully.
- Cost guard: reject audio > 5 min; cache by `sha256(file)` for 7 days.

## Do not
- Do not auto-create tasks from a transcript — the human confirms.
- Do not send audio to a third party unless the provider env var is explicitly configured.
- Do not log transcripts (PII).

## Acceptance checks
- [ ] Upload a 20 s Hindi clip → `state` goes `TRANSCRIBING` → `TRANSCRIBED` with non-empty
      `rawTranscript` and `engine` set.
- [ ] Provider forced to fail → `state = FAILED`, audio still retrievable, retry endpoint works.
- [ ] `PATCH /voice/:id {text}` sets the edited `text` and leaves `rawTranscript` untouched.
- [ ] Structuring returns a title ≤80 chars and 1–6 steps for a sample transcript.
- [ ] 6-minute audio → `400 VALIDATION_FAILED`.

## Output
Reply with: (1) a 5-line summary, (2) the list of files created/changed, (3) the pasted output
of the acceptance checks, (4) the `PROGRESS.md` diff. No essays, no restating this prompt.
