import { PrismaService } from '../../infra/prisma/prisma.service';
import { StorageService } from '../../infra/storage/storage.service';
import { ITranscriptionProvider } from '../../infra/ai/transcription.interface';
import { LocalWhisperProvider } from '../../infra/ai/local-whisper.provider';
import { OpenAIWhisperProvider } from '../../infra/ai/openai-whisper.provider';
import { SarvamAsrProvider } from '../../infra/ai/sarvam-asr.provider';
import { StructuredBugSuggestion } from '../../infra/ai/structuring';
import { CreateVoiceNoteDto, UpdateVoiceTextDto, AttachVoiceDto } from './voice.dto';
export declare class VoiceService {
    private readonly prisma;
    private readonly storage;
    private readonly logger;
    private provider;
    constructor(prisma: PrismaService, storage: StorageService, localProvider: LocalWhisperProvider, openaiProvider: OpenAIWhisperProvider, sarvamProvider: SarvamAsrProvider);
    setProvider(provider: ITranscriptionProvider): void;
    create(userId: string, audioBuffer: Buffer, dto: CreateVoiceNoteDto): Promise<{
        retryable: boolean;
        id: string;
        createdAt: Date;
        storageKey: string;
        durationMs: number;
        text: string | null;
        authorId: string;
        language: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
    }>;
    findOne(id: string): Promise<{
        audioUrl: string;
        retryable: boolean;
        id: string;
        createdAt: Date;
        storageKey: string;
        durationMs: number;
        text: string | null;
        authorId: string;
        language: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
    }>;
    updateText(id: string, dto: UpdateVoiceTextDto): Promise<{
        id: string;
        createdAt: Date;
        storageKey: string;
        durationMs: number;
        text: string | null;
        authorId: string;
        language: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
    }>;
    retry(id: string): Promise<{
        retryable: boolean;
        id: string;
        createdAt: Date;
        storageKey: string;
        durationMs: number;
        text: string | null;
        authorId: string;
        language: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
    }>;
    structure(id: string): Promise<StructuredBugSuggestion>;
    attach(id: string, dto: AttachVoiceDto): Promise<{
        success: boolean;
    }>;
}
