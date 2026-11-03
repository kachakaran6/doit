import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Headers,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import {
  InitUploadDto,
  InitUploadSchema,
  CompleteUploadDto,
  CompleteUploadSchema,
} from './attachments.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Uploads & Attachments')
@Controller()
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('uploads/init')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Initiate 3-step resumable upload (returns presigned PUT URL valid 15m)' })
  async initUpload(
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(InitUploadSchema)) dto: InitUploadDto,
  ) {
    return this.attachmentsService.initUpload(user.sub, dto);
  }

  @Public()
  @Put('uploads/raw/:key')
  @ApiOperation({ summary: 'Direct PUT endpoint for local dev driver' })
  async directPut(
    @Param('key') key: string,
    @Headers('content-type') contentType: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    let rawBuffer: Buffer;
    if (req.rawBody && req.rawBody.length > 0) {
      rawBuffer = req.rawBody;
    } else if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      rawBuffer = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBuffer = req.body;
    } else {
      rawBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
    }
    return this.attachmentsService.directPut(decodeURIComponent(key), rawBuffer, contentType || 'application/octet-stream');
  }

  @Post('uploads/:id/complete')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Complete upload: sniff magic bytes, verify existence, write row, queue thumbnail' })
  async completeUpload(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') uploadId: string,
    @Body(new ZodValidationPipe(CompleteUploadSchema)) dto: CompleteUploadDto,
  ) {
    return this.attachmentsService.completeUpload(uploadId, user.sub, dto);
  }

  @Get('attachments/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get attachment details and short-lived signed URLs' })
  async findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  @Delete('attachments/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete attachment and queue background storage deletion' })
  async delete(@Param('id') id: string) {
    return this.attachmentsService.delete(id);
  }
}
