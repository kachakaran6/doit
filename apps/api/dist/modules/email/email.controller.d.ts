import { EmailService } from './email.service';
import { SmtpConfigDto, SendTestEmailDto } from './email.dto';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    getSettings(): Promise<import("./email.service").PublicSmtpConfig>;
    saveSettings(dto: SmtpConfigDto): Promise<import("./email.service").PublicSmtpConfig>;
    testConnection(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    sendTest(dto: SendTestEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
