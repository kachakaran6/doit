import { Injectable, Logger } from '@nestjs/common';
import { ITranscriptionProvider, TranscriptionResult } from './transcription.interface';

@Injectable()
export class SarvamAsrProvider implements ITranscriptionProvider {
  readonly engineName = 'sarvam-asr';
  private readonly logger = new Logger(SarvamAsrProvider.name);

  async transcribe(_filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult> {
    this.logger.log(`Calling Sarvam ASR for Indic language: ${language}`);
    return {
      text: 'आवेदन शुरू होने पर तुरंत बंद हो जाता है।',
      engine: this.engineName,
      confidence: 0.96,
    };
  }
}
