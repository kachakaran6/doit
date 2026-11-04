"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const storage_service_1 = require("../../infra/storage/storage.service");
const local_whisper_provider_1 = require("../../infra/ai/local-whisper.provider");
const openai_whisper_provider_1 = require("../../infra/ai/openai-whisper.provider");
const sarvam_asr_provider_1 = require("../../infra/ai/sarvam-asr.provider");
const structuring_1 = require("../../infra/ai/structuring");
const app_error_1 = require("../../common/errors/app.error");
const error_code_enum_1 = require("../../common/errors/error-code.enum");
let VoiceService = VoiceService_1 = class VoiceService {
    constructor(prisma, storage, localProvider, openaiProvider, sarvamProvider) {
        this.prisma = prisma;
        this.storage = storage;
        this.logger = new common_1.Logger(VoiceService_1.name);
        const configured = process.env.AI_TRANSCRIPTION_PROVIDER || 'local';
        if (configured === 'openai' && process.env.OPENAI_API_KEY) {
            this.provider = openaiProvider;
        }
        else if (configured === 'sarvam' && process.env.SARVAM_API_KEY) {
            this.provider = sarvamProvider;
        }
        else {
            this.provider = localProvider;
        }
    }
    setProvider(provider) {
        this.provider = provider;
    }
    async create(userId, audioBuffer, dto) {
        if (dto.durationMs > 300000) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VALIDATION_FAILED, 'Audio duration cannot exceed 5 minutes (300,000 ms).', 400, [{ field: 'durationMs', issue: 'duration_too_long' }]);
        }
        const storageKey = `audio/${userId}/${(0, uuid_1.v4)()}.m4a`;
        await this.storage.putObject(storageKey, audioBuffer, 'audio/m4a');
        const voiceNote = await this.prisma.voiceNote.create({
            data: {
                authorId: userId,
                storageKey,
                durationMs: dto.durationMs,
                language: dto.language,
                state: client_1.VoiceState.TRANSCRIBING,
            },
        });
        try {
            const result = await this.provider.transcribe(audioBuffer, dto.language);
            const updated = await this.prisma.voiceNote.update({
                where: { id: voiceNote.id },
                data: {
                    state: client_1.VoiceState.TRANSCRIBED,
                    rawTranscript: result.text,
                    engine: result.engine,
                },
            });
            return {
                ...updated,
                retryable: false,
            };
        }
        catch (err) {
            this.logger.error(`Transcription failed: ${err instanceof Error ? err.message : String(err)}`);
            const failed = await this.prisma.voiceNote.update({
                where: { id: voiceNote.id },
                data: {
                    state: client_1.VoiceState.FAILED,
                },
            });
            return {
                ...failed,
                retryable: true,
            };
        }
    }
    async findOne(id) {
        const voiceNote = await this.prisma.voiceNote.findUnique({
            where: { id },
        });
        if (!voiceNote) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
        }
        const audioUrl = await this.storage.getSignedUrl(voiceNote.storageKey, 3600);
        return {
            ...voiceNote,
            audioUrl,
            retryable: voiceNote.state === client_1.VoiceState.FAILED,
        };
    }
    async updateText(id, dto) {
        const existing = await this.prisma.voiceNote.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
        }
        const updated = await this.prisma.voiceNote.update({
            where: { id },
            data: {
                text: dto.text.trim(),
            },
        });
        return updated;
    }
    async retry(id) {
        const voiceNote = await this.prisma.voiceNote.findUnique({
            where: { id },
        });
        if (!voiceNote) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
        }
        const audioBuffer = await this.storage.getObject(voiceNote.storageKey);
        if (!audioBuffer) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.NOT_FOUND, 'Audio file not found in storage.', 404);
        }
        await this.prisma.voiceNote.update({
            where: { id },
            data: { state: client_1.VoiceState.TRANSCRIBING },
        });
        try {
            const result = await this.provider.transcribe(audioBuffer, voiceNote.language);
            const updated = await this.prisma.voiceNote.update({
                where: { id },
                data: {
                    state: client_1.VoiceState.TRANSCRIBED,
                    rawTranscript: result.text,
                    engine: result.engine,
                },
            });
            return {
                ...updated,
                retryable: false,
            };
        }
        catch {
            const failed = await this.prisma.voiceNote.update({
                where: { id },
                data: { state: client_1.VoiceState.FAILED },
            });
            return {
                ...failed,
                retryable: true,
            };
        }
    }
    async structure(id) {
        const voiceNote = await this.prisma.voiceNote.findUnique({
            where: { id },
        });
        if (!voiceNote) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
        }
        const textToAnalyze = voiceNote.text || voiceNote.rawTranscript;
        if (!textToAnalyze) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.UNPROCESSABLE, 'Cannot structure bug: Voice note has no transcript yet.', 422);
        }
        return (0, structuring_1.structureTranscript)(textToAnalyze);
    }
    async attach(id, dto) {
        const voiceNote = await this.prisma.voiceNote.findUnique({
            where: { id },
        });
        if (!voiceNote) {
            throw new app_error_1.AppError(error_code_enum_1.ErrorCode.VOICE_NOTE_NOT_FOUND, 'Voice note not found.', 404);
        }
        if (dto.commentId) {
            await this.prisma.comment.update({
                where: { id: dto.commentId },
                data: { voiceNoteId: voiceNote.id },
            });
        }
        return { success: true };
    }
};
exports.VoiceService = VoiceService;
exports.VoiceService = VoiceService = VoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        local_whisper_provider_1.LocalWhisperProvider,
        openai_whisper_provider_1.OpenAIWhisperProvider,
        sarvam_asr_provider_1.SarvamAsrProvider])
], VoiceService);
//# sourceMappingURL=voice.service.js.map