import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService, TokenPair } from './token.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './auth.dto';
export interface AuthSuccessResult extends TokenPair {
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        locale: string;
    };
}
export declare class AuthService {
    private readonly prisma;
    private readonly passwordService;
    private readonly tokenService;
    private readonly emailService;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, passwordService: PasswordService, tokenService: TokenService, emailService: EmailService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<AuthSuccessResult>;
    login(dto: LoginDto): Promise<AuthSuccessResult>;
    refresh(refreshToken: string): Promise<TokenPair>;
    logout(sessionId: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getSessions(userId: string): Promise<{
        id: string;
        deviceName: string | null;
        deviceId: string | null;
        platform: string | null;
        appVersion: string | null;
        lastSeenAt: Date;
        createdAt: Date;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<void>;
    forgotPassword(email: string): Promise<{
        sent: boolean;
        message: string;
    }>;
    resetPassword(email: string, newPassword: string, token?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
