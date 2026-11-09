import { PrismaService } from '../../infra/prisma/prisma.service';
import { SmtpConfigDto } from './email.dto';
import { InvitationEmailData } from './email-templates';
export interface PublicSmtpConfig {
    configured: boolean;
    host: string | null;
    port: number;
    username: string | null;
    hasPassword: boolean;
    fromEmail: string | null;
    fromName: string;
    fromAddress?: string | null;
    senderName?: string;
    secure: boolean;
    enabled: boolean;
    source: 'database' | 'environment' | 'none';
}
export declare class EmailService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getResolvedSmtpConfig(): Promise<{
        host: string;
        port: number;
        username?: string;
        password?: string;
        fromEmail: string;
        fromName: string;
        secure: boolean;
        enabled: boolean;
        source: 'database' | 'environment';
    } | null>;
    getPublicConfig(): Promise<PublicSmtpConfig>;
    saveConfig(dto: SmtpConfigDto): Promise<PublicSmtpConfig>;
    private createTransporter;
    testConnection(customConfig?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTestEmail(to: string, customConfig?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    sendInvitationEmail(to: string, data: InvitationEmailData): Promise<{
        delivered: boolean;
        reason?: string;
    }>;
}
