import { VoiceService } from './voice.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { LocalWhisperProvider } from '../../infra/ai/local-whisper.provider';
import { OpenAIWhisperProvider } from '../../infra/ai/openai-whisper.provider';
import { SarvamAsrProvider } from '../../infra/ai/sarvam-asr.provider';
import { AppError } from '../../common/errors/app.error';
import { CreateVoiceNoteSchema } from './voice.dto';
import { VoiceState } from '@prisma/client';

describe('VoiceService & Transcription Pipeline', () => {
  let service: VoiceService;
  let mockPrisma: any;
  let mockStorage: any;
  let localProvider: LocalWhisperProvider;
  let openaiProvider: OpenAIWhisperProvider;
  let sarvamProvider: SarvamAsrProvider;

  beforeEach(() => {
    mockPrisma = {
      voiceNote: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      comment: {
        update: jest.fn(),
      },
    };
    mockStorage = {
      putObject: jest.fn().mockResolvedValue('https://storage.mock/audio.m4a'),
      getObject: jest.fn().mockResolvedValue(Buffer.from('mock audio bytes')),
      getSignedUrl: jest.fn().mockResolvedValue('https://storage.mock/signed-audio.m4a'),
    };
    localProvider = new LocalWhisperProvider();
    openaiProvider = new OpenAIWhisperProvider();
    sarvamProvider = new SarvamAsrProvider();

    service = new VoiceService(
      mockPrisma as unknown as PrismaService,
      mockStorage as unknown as StorageService,
      localProvider,
      openaiProvider,
      sarvamProvider,
    );
  });

  describe('validation', () => {
    it('should reject 6-minute audio with 400 VALIDATION_FAILED (exceeds 300,000 ms cap)', async () => {
      const sixMinMs = 6 * 60 * 1000; // 360,000 ms

      const schemaCheck = CreateVoiceNoteSchema.safeParse({
        language: 'en-IN',
        durationMs: sixMinMs,
      });
      expect(schemaCheck.success).toBe(false);

      try {
        await service.create('user-1', Buffer.from('audio'), {
          language: 'en-IN',
          durationMs: sixMinMs,
        });
        fail('Expected 400 error');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppError);
        const appErr = err as AppError;
        expect(appErr.httpStatus).toBe(400);
        expect(appErr.code).toBe('VALIDATION_FAILED');
      }
    });
  });

  describe('transcription pipeline', () => {
    it('should upload 20s Hindi clip, transcribe to rawTranscript and set engine', async () => {
      mockPrisma.voiceNote.create.mockResolvedValue({
        id: 'voice-1',
        authorId: 'user-1',
        storageKey: 'audio/user-1/voice-1.m4a',
        durationMs: 20000,
        language: 'hi-IN',
        state: VoiceState.TRANSCRIBING,
      });

      mockPrisma.voiceNote.update.mockResolvedValue({
        id: 'voice-1',
        authorId: 'user-1',
        storageKey: 'audio/user-1/voice-1.m4a',
        durationMs: 20000,
        language: 'hi-IN',
        state: VoiceState.TRANSCRIBED,
        rawTranscript: 'Yeh login screen pe crash ho raha hai jab hum submit button click karte hain.',
        engine: 'local-whisper',
      });

      const res = await service.create('user-1', Buffer.from('audio data'), {
        language: 'hi-IN',
        durationMs: 20000,
      });

      expect(res.state).toBe(VoiceState.TRANSCRIBED);
      expect(res.rawTranscript).toContain('crash');
      expect(res.engine).toBe('local-whisper');
      expect(res.retryable).toBe(false);
    });

    it('should handle provider failure gracefully: state=FAILED, audio preserved, retryable=true', async () => {
      mockPrisma.voiceNote.create.mockResolvedValue({
        id: 'voice-fail',
        authorId: 'user-1',
        storageKey: 'audio/user-1/fail.m4a',
        durationMs: 15000,
        language: 'en-IN',
        state: VoiceState.TRANSCRIBING,
      });

      mockPrisma.voiceNote.update.mockResolvedValue({
        id: 'voice-fail',
        state: VoiceState.FAILED,
      });

      // Force provider to fail
      service.setProvider({
        engineName: 'failing-provider',
        transcribe: jest.fn().mockRejectedValue(new Error('ASR service timeout')),
      });

      const res = await service.create('user-1', Buffer.from('audio data'), {
        language: 'en-IN',
        durationMs: 15000,
      });

      expect(res.state).toBe(VoiceState.FAILED);
      expect(res.retryable).toBe(true);

      // Verify audio remains retrievable in storage
      expect(mockStorage.putObject).toHaveBeenCalled();
    });

    it('should support retrying a failed voice note', async () => {
      mockPrisma.voiceNote.findUnique.mockResolvedValue({
        id: 'voice-fail',
        storageKey: 'audio/user-1/fail.m4a',
        language: 'en-IN',
        state: VoiceState.FAILED,
      });

      // Recovered provider
      service.setProvider(localProvider);

      mockPrisma.voiceNote.update
        .mockResolvedValueOnce({ id: 'voice-fail', state: VoiceState.TRANSCRIBING })
        .mockResolvedValueOnce({
          id: 'voice-fail',
          state: VoiceState.TRANSCRIBED,
          rawTranscript: 'Recovered transcript',
          engine: 'local-whisper',
        });

      const retryRes = await service.retry('voice-fail');
      expect(retryRes.state).toBe(VoiceState.TRANSCRIBED);
      expect(retryRes.retryable).toBe(false);
    });
  });

  describe('editing transcript text', () => {
    it('should save user-edited text and leave rawTranscript untouched', async () => {
      mockPrisma.voiceNote.findUnique.mockResolvedValue({
        id: 'voice-1',
        rawTranscript: 'Original engine transcript with slight typo',
        text: null,
      });

      mockPrisma.voiceNote.update.mockResolvedValue({
        id: 'voice-1',
        rawTranscript: 'Original engine transcript with slight typo',
        text: 'Corrected text by user',
      });

      const updated = await service.updateText('voice-1', {
        text: 'Corrected text by user',
      });

      expect(updated.text).toBe('Corrected text by user');
      expect(updated.rawTranscript).toBe('Original engine transcript with slight typo');
    });
  });

  describe('structuring bug from voice note', () => {
    it('should structure transcript into title <= 80 chars, 1-6 steps, and severity', async () => {
      mockPrisma.voiceNote.findUnique.mockResolvedValue({
        id: 'voice-struct',
        rawTranscript:
          'When we tap the login button then the app crashes completely and then we are back on the home screen.',
        text: null,
      });

      const structured = await service.structure('voice-struct');

      expect(structured.title.length).toBeLessThanOrEqual(80);
      expect(structured.steps.length).toBeGreaterThanOrEqual(1);
      expect(structured.steps.length).toBeLessThanOrEqual(6);
      expect(structured.severity).toBe('CRITICAL');
      expect(structured.description).toBe(
        'When we tap the login button then the app crashes completely and then we are back on the home screen.',
      );
    });
  });
});
