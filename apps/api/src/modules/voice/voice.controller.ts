import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import {
  CreateVoiceNoteDto,
  CreateVoiceNoteSchema,
  UpdateVoiceTextDto,
  UpdateVoiceTextSchema,
  AttachVoiceDto,
  AttachVoiceSchema,
} from './voice.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

export interface UploadedAudioFile {
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
  buffer: Buffer;
}

@ApiTags('Voice & Transcription')
@Controller('voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  @ApiBearerAuth('bearer-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload audio clip and begin async transcription' })
  async create(
    @CurrentUser() user: AuthUserPayload,
    @UploadedFile() file: UploadedAudioFile | undefined,
    @Body(new ZodValidationPipe(CreateVoiceNoteSchema)) dto: CreateVoiceNoteDto,
  ) {
    const audioBuffer = file ? file.buffer : Buffer.from('');
    return this.voiceService.create(user.sub, audioBuffer, dto);
  }

  @Get(':id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Poll transcription status and get transcript' })
  async findOne(@Param('id') id: string) {
    return this.voiceService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Save user-edited transcript text (preserves rawTranscript)' })
  async updateText(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateVoiceTextSchema)) dto: UpdateVoiceTextDto,
  ) {
    return this.voiceService.updateText(id, dto);
  }

  @Post(':id/retry')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Retry transcription on a failed voice note' })
  async retry(@Param('id') id: string) {
    return this.voiceService.retry(id);
  }

  @Post(':id/structure')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Structure voice note into bug report suggestion (never auto-applied)' })
  async structure(@Param('id') id: string) {
    return this.voiceService.structure(id);
  }

  @Post(':id/attach')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Attach voice note to a task or comment' })
  async attach(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AttachVoiceSchema)) dto: AttachVoiceDto,
  ) {
    return this.voiceService.attach(id, dto);
  }
}
