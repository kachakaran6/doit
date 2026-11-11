"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const prisma_service_1 = require("../../infra/prisma/prisma.service");
const crypto_util_1 = require("../../common/utils/crypto.util");
const email_templates_1 = require("./email-templates");
let EmailService = EmailService_1 = class EmailService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    async getResolvedSmtpConfig() {
        try {
            const dbConfig = await this.prisma.smtpConfig.findUnique({
                where: { id: 'default' },
            });
            if (dbConfig && dbConfig.host && dbConfig.fromEmail) {
                let password;
                if (dbConfig.passwordEncrypted) {
                    try {
                        password = (0, crypto_util_1.decryptSecret)(dbConfig.passwordEncrypted);
                    }
                    catch (err) {
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
        }
        catch (e) {
            this.logger.warn(`Could not read SmtpConfig from database: ${e.message}`);
        }
        const host = process.env.SMTP_HOST;
        const rawFrom = process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM;
        if (host && rawFrom) {
            const port = parseInt(process.env.SMTP_PORT || '587', 10);
            const secure = process.env.SMTP_SECURE === 'true' || port === 465;
            const username = process.env.SMTP_USERNAME || process.env.SMTP_USER;
            const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
            let fromName = process.env.SMTP_FROM_NAME || 'DoIt';
            let fromEmail = rawFrom.trim();
            const match = fromEmail.match(/(?:["']?([^"']+)["']?\s+)?<([^>]+)>/);
            if (match) {
                if (match[1])
                    fromName = match[1].trim();
                fromEmail = match[2].trim();
            }
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
    async getPublicConfig() {
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
                fromAddress: null,
                senderName: 'DoIt',
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
            fromAddress: resolved.fromEmail,
            senderName: resolved.fromName,
            secure: resolved.secure,
            enabled: resolved.enabled,
            source: resolved.source,
        };
    }
    async saveConfig(dto) {
        let passwordEncrypted = undefined;
        if (dto.password && dto.password.trim() !== '') {
            passwordEncrypted = (0, crypto_util_1.encryptSecret)(dto.password.trim());
        }
        else {
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
    createTransporter(config) {
        const auth = config.username && config.password
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
                rejectUnauthorized: false,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
        });
    }
    async testConnection(customConfig) {
        let host;
        let port;
        let username;
        let password;
        let secure;
        if (customConfig && customConfig.host) {
            host = customConfig.host.trim();
            port = Number(customConfig.port) || 587;
            username = customConfig.username?.trim() || undefined;
            password = customConfig.password || undefined;
            secure = customConfig.secure ?? (port === 465);
            if (!password) {
                const existing = await this.getResolvedSmtpConfig();
                if (existing?.password)
                    password = existing.password;
            }
        }
        else {
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
        }
        catch (err) {
            this.logger.error(`SMTP test connection failed: ${err.message}`);
            return { success: false, message: `Connection failed: ${err.message}` };
        }
    }
    async sendTestEmail(to, customConfig) {
        let resolved;
        if (customConfig && customConfig.host) {
            const fromEmail = (customConfig.fromEmail || customConfig.fromAddress || '').trim();
            const fromName = (customConfig.fromName || customConfig.senderName || 'DoIt').trim();
            let password = customConfig.password;
            if (!password) {
                const existing = await this.getResolvedSmtpConfig();
                if (existing?.password)
                    password = existing.password;
            }
            resolved = {
                host: customConfig.host.trim(),
                port: Number(customConfig.port) || 587,
                username: customConfig.username?.trim() || undefined,
                password,
                fromEmail: fromEmail,
                fromName: fromName || 'DoIt',
                secure: customConfig.secure ?? (Number(customConfig.port) === 465),
            };
        }
        else {
            resolved = await this.getResolvedSmtpConfig();
        }
        if (!resolved || !resolved.host || !resolved.fromEmail) {
            return {
                success: false,
                message: 'SMTP is not configured. Please fill in Host and From email address.',
            };
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
        }
        catch (err) {
            this.logger.error(`Failed to send test email to ${to}: ${err.message}`);
            return { success: false, message: `Failed to send email: ${err.message}` };
        }
    }
    async sendInvitationEmail(to, data) {
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
            const html = (0, email_templates_1.generateInvitationEmailHtml)(data);
            const text = (0, email_templates_1.generateInvitationEmailText)(data);
            const info = await transporter.sendMail({
                from: `"${config.fromName}" <${config.fromEmail}>`,
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Invitation email successfully sent to ${to}, messageId: ${info.messageId}`);
            return { delivered: true };
        }
        catch (err) {
            this.logger.error(`Failed to deliver invitation email to ${to}: ${err.message}`);
            return { delivered: false, reason: err.message };
        }
    }
    async sendPasswordResetEmail(to, data) {
        const config = await this.getResolvedSmtpConfig();
        if (!config) {
            this.logger.warn(`SMTP not configured; cannot deliver password reset email to ${to}`);
            return { delivered: false, reason: 'SMTP is not configured' };
        }
        if (!config.enabled) {
            this.logger.warn(`SMTP delivery is disabled; cannot deliver password reset email to ${to}`);
            return { delivered: false, reason: 'SMTP delivery is disabled' };
        }
        try {
            const transporter = this.createTransporter(config);
            const subject = `Reset your DoIt password`;
            const html = (0, email_templates_1.generatePasswordResetEmailHtml)(data);
            const text = (0, email_templates_1.generatePasswordResetEmailText)(data);
            const info = await transporter.sendMail({
                from: `"${config.fromName}" <${config.fromEmail}>`,
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`Password reset email successfully sent to ${to}, messageId: ${info.messageId}`);
            return { delivered: true };
        }
        catch (err) {
            this.logger.error(`Failed to deliver password reset email to ${to}: ${err.message}`);
            return { delivered: false, reason: err.message };
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map