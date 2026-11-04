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
        language: string;
        durationMs: number;
        text: string | null;
        id: string;
        authorId: string;
        storageKey: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
        createdAt: Date;
    }>;
    findOne(id: string): Promise<{
        audioUrl: string;
        retryable: boolean;
        language: string;
        durationMs: number;
        text: string | null;
        id: string;
        authorId: string;
        storageKey: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
        createdAt: Date;
    }>;
    updateText(id: string, dto: UpdateVoiceTextDto): Promise<{
        language: string;
        durationMs: number;
        text: string | null;
        id: string;
        authorId: string;
        storageKey: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
        createdAt: Date;
    }>;
    retry(id: string): Promise<{
        retryable: boolean;
        language: string;
        durationMs: number;
        text: string | null;
        id: string;
        authorId: string;
        storageKey: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
        createdAt: Date;
    }>;
    structure(id: string): Promise<StructuredBugSuggestion>;
    attach(id: string, dto: AttachVoiceDto): Promise<{
        success: boolean;
    }>;
}
