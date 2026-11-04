import { ITranscriptionProvider, TranscriptionResult } from './transcription.interface';
export declare class SarvamAsrProvider implements ITranscriptionProvider {
    readonly engineName = "sarvam-asr";
    private readonly logger;
    transcribe(_filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult>;
}
