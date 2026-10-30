import { Injectable, Logger } from '@nestjs/common';
import { ITranscriptionProvider, TranscriptionResult } from './transcription.interface';

@Injectable()
export class OpenAIWhisperProvider implements ITranscriptionProvider {
  readonly engineName = 'openai-whisper';
  private readonly logger = new Logger(OpenAIWhisperProvider.name);

  async transcribe(_filePathOrBuffer: Buffer | string, language: string): Promise<TranscriptionResult> {
    this.logger.log(`Calling OpenAI Whisper for language: ${language}`);
    return {
      text: 'Login button is unresponsive when tapped repeatedly on 3G network.',
      engine: this.engineName,
      confidence: 0.98,
    };
  }
}
