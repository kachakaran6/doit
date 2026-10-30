import { Module } from '@nestjs/common';
import { StickiesController } from './stickies.controller';
import { StickiesService } from './stickies.service';

@Module({
  controllers: [StickiesController],
  providers: [StickiesService],
  exports: [StickiesService],
})
export class StickiesModule {}
