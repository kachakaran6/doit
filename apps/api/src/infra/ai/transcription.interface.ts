export interface TranscriptionResult {
  text: string;
  engine: string;
  confidence: number;
}

export interface ITranscriptionProvider {
  readonly engineName: string;
  transcribe(filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult>;
}
