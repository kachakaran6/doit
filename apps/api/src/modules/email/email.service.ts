import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { encryptSecret, decryptSecret } from '../../common/utils/crypto.util';
import { SmtpConfigDto } from './email.dto';
import {
  InvitationEmailData,
  generateInvitationEmailHtml,
  generateInvitationEmailText,
} from './email-templates';

export interface PublicSmtpConfig {
  configured: boolean;
  host: string | null;
  port: number;
  username: string | null;
  hasPassword: boolean;
  fromEmail: string | null;
  fromName: string;
  secure: boolean;
  enabled: boolean;
  source: 'database' | 'environment' | 'none';
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves active SMTP configuration from database or env variables.
   */
  async getResolvedSmtpConfig(): Promise<{
    host: string;
    port: number;
    username?: string;
    password?: string;
    fromEmail: string;
    fromName: string;
    secure: boolean;
    enabled: boolean;
    source: 'database' | 'environment';
  } | null> {
    try {
      const dbConfig = await this.prisma.smtpConfig.findUnique({
        where: { id: 'default' },
      });

      if (dbConfig && dbConfig.host && dbConfig.fromEmail) {
        let password: string | undefined;
        if (dbConfig.passwordEncrypted) {
          try {
            password = decryptSecret(dbConfig.passwordEncrypted);
          } catch (err: any) {
            this.logger.error(`Failed to decrypt SMTP password: ${err.message}`);
          }
        }

        return {
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username || undefined,
          password,
          fromEmail: dbConfig.fromEmail,
          fromName: dbConfig.fromName,
          secure: dbConfig.secure,
          enabled: dbConfig.enabled,
          source: 'database',
        };
      }
    } catch (e: any) {
      this.logger.warn(`Could not read SmtpConfig from database: ${e.message}`);
    }

    // Fallback to environment variables
    const host = process.env.SMTP_HOST;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM;
    if (host && fromEmail) {
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;
      const username = process.env.SMTP_USERNAME || process.env.SMTP_USER;
      const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      const fromName = process.env.SMTP_FROM_NAME || 'DoIt';

      return {
        host,
        port,
        username,
        password,
        fromEmail,
        fromName,
        secure,
        enabled: true,
        source: 'environment',
      };
    }

    return null;
  }

  /**
   * Returns sanitized SMTP settings for frontend administration (no passwords).
   */
  async getPublicConfig(): Promise<PublicSmtpConfig> {
    const resolved = await this.getResolvedSmtpConfig();
    if (!resolved) {
      return {
        configured: false,
        host: null,
        port: 587,
        username: null,
        hasPassword: false,
        fromEmail: null,
        fromName: 'DoIt',
        secure: false,
        enabled: false,
        source: 'none',
      };
    }

    return {
      configured: true,
      host: resolved.host,
      port: resolved.port,
      username: resolved.username || null,
      hasPassword: Boolean(resolved.password),
      fromEmail: resolved.fromEmail,
      fromName: resolved.fromName,
      secure: resolved.secure,
      enabled: resolved.enabled,
      source: resolved.source,
    };
  }

  /**
   * Saves or updates SMTP configuration in the database.
   */
  async saveConfig(dto: SmtpConfigDto): Promise<PublicSmtpConfig> {
    let passwordEncrypted: string | undefined | null = undefined;

    if (dto.password && dto.password.trim() !== '') {
      passwordEncrypted = encryptSecret(dto.password.trim());
    } else {
      // Keep existing password if not provided
      const existing = await this.prisma.smtpConfig.findUnique({
        where: { id: 'default' },
      });
      if (existing) {
        passwordEncrypted = existing.passwordEncrypted;
      }
    }

    await this.prisma.smtpConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        host: dto.host.trim(),
        port: dto.port,
        username: dto.username?.trim() || null,
        passwordEncrypted,
        fromEmail: dto.fromEmail.trim(),
        fromName: dto.fromName?.trim() || 'DoIt',
        secure: dto.secure ?? (dto.port === 465),
        enabled: dto.enabled ?? true,
      },
      update: {
        host: dto.host.trim(),
        port: dto.port,
        username: dto.username?.trim() || null,
        ...(passwordEncrypted !== undefined ? { passwordEncrypted } : {}),
        fromEmail: dto.fromEmail.trim(),
        fromName: dto.fromName?.trim() || 'DoIt',
        secure: dto.secure ?? (dto.port === 465),
        enabled: dto.enabled ?? true,
      },
    });

    this.logger.log(`SMTP configuration saved by admin for host: ${dto.host}`);
    return this.getPublicConfig();
  }

  /**
   * Creates a Nodemailer transporter instance.
   */
  private createTransporter(config: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    secure: boolean;
  }) {
    const auth =
      config.username && config.password
        ? {
            user: config.username,
            pass: config.password,
          }
        : undefined;

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth,
      tls: {
        // Reject unauthorized by default, but allow valid STARTTLS upgrades
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
  }

  /**
   * Tests connection to SMTP server.
   */
  async testConnection(customConfig?: SmtpConfigDto): Promise<{ success: boolean; message: string }> {
    let host: string;
    let port: number;
    let username: string | undefined;
    let password: string | undefined;
    let secure: boolean;

    if (customConfig && customConfig.host) {
      host = customConfig.host;
      port = customConfig.port;
      username = customConfig.username || undefined;
      password = customConfig.password || undefined;
      secure = customConfig.secure;

      // If no password provided in test payload, try existing password
      if (!password) {
        const existing = await this.getResolvedSmtpConfig();
        if (existing?.password) password = existing.password;
      }
    } else {
      const active = await this.getResolvedSmtpConfig();
      if (!active) {
        return { success: false, message: 'No SMTP configuration found' };
      }
      host = active.host;
      port = active.port;
      username = active.username;
      password = active.password;
      secure = active.secure;
    }

    try {
      const transporter = this.createTransporter({ host, port, username, password, secure });
      await transporter.verify();
      return { success: true, message: `Successfully connected to ${host}:${port}` };
    } catch (err: any) {
      this.logger.error(`SMTP test connection failed: ${err.message}`);
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  }

  /**
   * Sends a test email to verify actual delivery.
   */
  async sendTestEmail(
    to: string,
    customConfig?: SmtpConfigDto,
  ): Promise<{ success: boolean; message: string }> {
    let resolved: any;

    if (customConfig && customConfig.host) {
      let password = customConfig.password;
      if (!password) {
        const existing = await this.getResolvedSmtpConfig();
        if (existing?.password) password = existing.password;
      }
      resolved = {
        host: customConfig.host,
        port: customConfig.port,
        username: customConfig.username,
        password,
        fromEmail: customConfig.fromEmail,
        fromName: customConfig.fromName || 'DoIt',
        secure: customConfig.secure,
      };
    } else {
      resolved = await this.getResolvedSmtpConfig();
    }

    if (!resolved) {
      return { success: false, message: 'SMTP is not configured' };
    }

    try {
      const transporter = this.createTransporter(resolved);
      const info = await transporter.sendMail({
        from: `"${resolved.fromName}" <${resolved.fromEmail}>`,
        to,
        subject: 'DoIt — SMTP Test Email',
        text: 'Hello from DoIt! Your SMTP email configuration is active and working properly.',
        html: `
          <div style="font-family: sans-serif; background-color: #0b0b0e; color: #f3f4f6; padding: 32px; border-radius: 8px;">
            <h2 style="color: #6366f1; margin: 0 0 12px 0;">DoIt — SMTP Configuration Verified</h2>
            <p style="color: #9ca3af; line-height: 1.5;">This is a test email sent from DoIt to verify your SMTP server connection.</p>
            <div style="margin: 16px 0; padding: 12px; background: #181920; border-radius: 6px; font-size: 13px; color: #a5b4fc;">
              Host: ${resolved.host}:${resolved.port} &bull; Sender: ${resolved.fromEmail}
            </div>
            <p style="color: #6b7280; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      });

      this.logger.log(`Test email sent successfully to ${to}, messageId: ${info.messageId}`);
      return { success: true, message: `Test email successfully sent to ${to}` };
    } catch (err: any) {
      this.logger.error(`Failed to send test email to ${to}: ${err.message}`);
      return { success: false, message: `Failed to send email: ${err.message}` };
    }
  }

  /**
   * Sends workspace invitation email.
   * If SMTP is unconfigured or disabled, returns gracefully without throwing.
   */
  async sendInvitationEmail(
    to: string,
    data: InvitationEmailData,
  ): Promise<{ delivered: boolean; reason?: string }> {
    const config = await this.getResolvedSmtpConfig();

    if (!config) {
      this.logger.log(`SMTP not configured; skipping email delivery for invitation to ${to}`);
      return { delivered: false, reason: 'SMTP is not configured' };
    }

    if (!config.enabled) {
      this.logger.log(`SMTP delivery is disabled; skipping email to ${to}`);
      return { delivered: false, reason: 'SMTP delivery is disabled' };
    }

    try {
      const transporter = this.createTransporter(config);
      const subject = `You're invited to join ${data.workspaceName} on DoIt`;
      const html = generateInvitationEmailHtml(data);
      const text = generateInvitationEmailText(data);

      const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Invitation email successfully sent to ${to}, messageId: ${info.messageId}`);
      return { delivered: true };
    } catch (err: any) {
      this.logger.error(`Failed to deliver invitation email to ${to}: ${err.message}`);
      return { delivered: false, reason: err.message };
    }
  }
}

