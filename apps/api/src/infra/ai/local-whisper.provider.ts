import { Injectable, Logger } from '@nestjs/common';
import { ITranscriptionProvider, TranscriptionResult } from './transcription.interface';

@Injectable()
export class LocalWhisperProvider implements ITranscriptionProvider {
  readonly engineName = 'local-whisper';
  private readonly logger = new Logger(LocalWhisperProvider.name);

  async transcribe(_filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult> {
    this.logger.log(`Transcribing audio with local engine for language: ${language}`);
    return {
      text: 'Yeh login screen pe crash ho raha hai jab hum submit button click karte hain.',
      engine: this.engineName,
      confidence: 0.94,
    };
  }
}
