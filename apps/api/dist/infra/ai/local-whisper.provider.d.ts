import { ITranscriptionProvider, TranscriptionResult } from './transcription.interface';
export declare class LocalWhisperProvider implements ITranscriptionProvider {
    readonly engineName = "local-whisper";
    private readonly logger;
    transcribe(_filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult>;
}
