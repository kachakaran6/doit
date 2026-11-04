import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SmtpConfigDto, SmtpConfigSchema, SendTestEmailDto, SendTestEmailSchema } from './email.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Email & SMTP')
@Controller('admin/smtp')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get current public SMTP settings (passwords masked)' })
  async getSettings() {
    return this.emailService.getPublicConfig();
  }

  @Post()
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Save or update SMTP configuration' })
  async saveSettings(@Body(new ZodValidationPipe(SmtpConfigSchema)) dto: SmtpConfigDto) {
    return this.emailService.saveConfig(dto);
  }

  @Post('test-connection')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Test connection to SMTP server' })
  async testConnection(@Body() body: any) {
    const parsed = body && Object.keys(body).length > 0 ? SmtpConfigSchema.partial().parse(body) : undefined;
    return this.emailService.testConnection(parsed as any);
  }

  @Post('send-test')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Send test email via SMTP' })
  async sendTest(@Body(new ZodValidationPipe(SendTestEmailSchema)) dto: SendTestEmailDto) {
    return this.emailService.sendTestEmail(dto.to, dto.smtp);
  }
}
