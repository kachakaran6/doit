import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { LocalWhisperProvider } from '../../infra/ai/local-whisper.provider';
import { OpenAIWhisperProvider } from '../../infra/ai/openai-whisper.provider';
import { SarvamAsrProvider } from '../../infra/ai/sarvam-asr.provider';

@Module({
  controllers: [VoiceController],
  providers: [
    VoiceService,
    LocalWhisperProvider,
    OpenAIWhisperProvider,
    SarvamAsrProvider,
  ],
  exports: [VoiceService],
})
export class VoiceModule {}
