import { Injectable, Logger } from '@nestjs/common';
import { VoiceState } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import {
  ITranscriptionProvider,
  TranscriptionResult,
} from '../../infra/ai/transcription.interface';
import { LocalWhisperProvider } from '../../infra/ai/local-whisper.provider';
import { OpenAIWhisperProvider } from '../../infra/ai/openai-whisper.provider';
import { SarvamAsrProvider } from '../../infra/ai/sarvam-asr.provider';
import { structureTranscript, StructuredBugSuggestion } from '../../infra/ai/structuring';
import {
  CreateVoiceNoteDto,
  UpdateVoiceTextDto,
  AttachVoiceDto,
} from './voice.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private provider: ITranscriptionProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    localProvider: LocalWhisperProvider,
    openaiProvider: OpenAIWhisperProvider,
    sarvamProvider: SarvamAsrProvider,
  ) {
    const configured = process.env.AI_TRANSCRIPTION_PROVIDER || 'local';
    if (configured === 'openai' && process.env.OPENAI_API_KEY) {
      this.provider = openaiProvider;
    } else if (configured === 'sarvam' && process.env.SARVAM_API_KEY) {
      this.provider = sarvamProvider;
    } else {
      this.provider = localProvider;
    }
  }

  // Testing helper
  setProvider(provider: ITranscriptionProvider) {
    this.provider = provider;
  }

  async create(userId: string, audioBuffer: Buffer, dto: CreateVoiceNoteDto) {
    if (dto.durationMs > 300000) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        'Audio duration cannot exceed 5 minutes (300,000 ms).',
        400,
        [{ field: 'durationMs', issue: 'duration_too_long' }],
      );
    }

    const storageKey = `audio/${userId}/${uuidv4()}.m4a`;
    await this.storage.putObject(storageKey, audioBuffer, 'audio/m4a');

    const voiceNote = await this.prisma.voiceNote.create({
      data: {
        authorId: userId,
        storageKey,
        durationMs: dto.durationMs,
        language: dto.language,
        state: VoiceState.TRANSCRIBING,
      },
    });

    // Execute transcription
    try {
      const result: TranscriptionResult = await this.provider.transcribe(
        audioBuffer,
        dto.language,
      );

      const updated = await this.prisma.voiceNote.update({
        where: { id: voiceNote.id },
        data: {
          state: VoiceState.TRANSCRIBED,
          rawTranscript: result.text,
          engine: result.engine,
        },
      });

      return {
        ...updated,
        retryable: false,
      };
    } catch (err: unknown) {
      this.logger.error(`Transcription failed: ${err instanceof Error ? err.message : String(err)}`);
      const failed = await this.prisma.voiceNote.update({
        where: { id: voiceNote.id },
        data: {
          state: VoiceState.FAILED,
        },
      });

      return {
        ...failed,
        retryable: true,
      };
    }
  }

  async findOne(id: string) {
    const voiceNote = await this.prisma.voiceNote.findUnique({
      where: { id },
    });

    if (!voiceNote) {
      throw new AppError(ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
    }

    const audioUrl = await this.storage.getSignedUrl(voiceNote.storageKey, 3600);

    return {
      ...voiceNote,
      audioUrl,
      retryable: voiceNote.state === VoiceState.FAILED,
    };
  }

  async updateText(id: string, dto: UpdateVoiceTextDto) {
    const existing = await this.prisma.voiceNote.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
    }

    // Updates text user correction and leaves rawTranscript untouched
    const updated = await this.prisma.voiceNote.update({
      where: { id },
      data: {
        text: dto.text.trim(),
      },
    });

    return updated;
  }

  async retry(id: string) {
    const voiceNote = await this.prisma.voiceNote.findUnique({
      where: { id },
    });

    if (!voiceNote) {
      throw new AppError(ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
    }

    const audioBuffer = await this.storage.getObject(voiceNote.storageKey);
    if (!audioBuffer) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Audio file not found in storage.', 404);
    }

    await this.prisma.voiceNote.update({
      where: { id },
      data: { state: VoiceState.TRANSCRIBING },
    });

    try {
      const result = await this.provider.transcribe(audioBuffer, voiceNote.language);
      const updated = await this.prisma.voiceNote.update({
        where: { id },
        data: {
          state: VoiceState.TRANSCRIBED,
          rawTranscript: result.text,
          engine: result.engine,
        },
      });

      return {
        ...updated,
        retryable: false,
      };
    } catch {
      const failed = await this.prisma.voiceNote.update({
        where: { id },
        data: { state: VoiceState.FAILED },
      });

      return {
        ...failed,
        retryable: true,
      };
    }
  }

  async structure(id: string): Promise<StructuredBugSuggestion> {
    const voiceNote = await this.prisma.voiceNote.findUnique({
      where: { id },
    });

    if (!voiceNote) {
      throw new AppError(ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
    }

    const textToAnalyze = voiceNote.text || voiceNote.rawTranscript;
    if (!textToAnalyze) {
      throw new AppError(
        ErrorCode.UNPROCESSABLE,
        'Cannot structure bug: Voice note has no transcript yet.',
        422,
      );
    }

    return structureTranscript(textToAnalyze);
  }

  async attach(id: string, dto: AttachVoiceDto) {
    const voiceNote = await this.prisma.voiceNote.findUnique({
      where: { id },
    });

    if (!voiceNote) {
      throw new AppError(ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
    }

    if (dto.commentId) {
      await this.prisma.comment.update({
        where: { id: dto.commentId },
        data: { voiceNoteId: voiceNote.id },
      });
    }

    return { success: true };
  }
}
