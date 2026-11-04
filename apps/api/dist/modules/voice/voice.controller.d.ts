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
    structure(id: string): Promise<import("../../infra/ai/structuring").StructuredBugSuggestion>;
    attach(id: string, dto: AttachVoiceDto): Promise<{
        success: boolean;
    }>;
}
