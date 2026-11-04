import { ITranscriptionProvider, TranscriptionResult } from './transcription.interface';
export declare class OpenAIWhisperProvider implements ITranscriptionProvider {
    readonly engineName = "openai-whisper";
    private readonly logger;
    transcribe(_filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult>;
}
