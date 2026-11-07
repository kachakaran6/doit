import { Module } from '@nestjs/common';
import { ContextAiController } from './context-ai.controller';
import { ContextAiService } from './context-ai.service';

@Module({
  controllers: [ContextAiController],
  providers: [ContextAiService],
  exports: [ContextAiService],
})
export class ContextAiModule {}
