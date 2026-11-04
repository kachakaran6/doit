import { VoiceService } from './voice.service';
import { CreateVoiceNoteDto, UpdateVoiceTextDto, AttachVoiceDto } from './voice.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export interface UploadedAudioFile {
    fieldname?: string;
    originalname?: string;
    encoding?: string;
    mimetype?: string;
    size?: number;
    buffer: Buffer;
}
export declare class VoiceController {
    private readonly voiceService;
    constructor(voiceService: VoiceService);
    create(user: AuthUserPayload, file: UploadedAudioFile | undefined, dto: CreateVoiceNoteDto): Promise<{
        retryable: boolean;
        id: string;
        createdAt: Date;
        text: string | null;
        storageKey: string;
        durationMs: number;
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
        text: string | null;
        storageKey: string;
        durationMs: number;
        authorId: string;
        language: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
    }>;
    updateText(id: string, dto: UpdateVoiceTextDto): Promise<{
        id: string;
        createdAt: Date;
        text: string | null;
        storageKey: string;
        durationMs: number;
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
        text: string | null;
        storageKey: string;
        durationMs: number;
        authorId: string;
        language: string;
        state: import(".prisma/client").$Enums.VoiceState;
        rawTranscript: string | null;
        engine: string | null;
    }>;
    structure(id: string): Promise<import("../../infra/ai/structuring").StructuredBugSuggestion>;
    attach(id: string, dto: AttachVoiceDto): Promise<{
        success: boolean;
    }>;
}
