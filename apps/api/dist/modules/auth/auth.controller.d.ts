import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto } from './auth.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto): Promise<import("./auth.service").AuthSuccessResult>;
    login(dto: LoginDto): Promise<import("./auth.service").AuthSuccessResult>;
    refresh(dto: RefreshTokenDto): Promise<import("./token.service").TokenPair>;
    logout(user: AuthUserPayload): Promise<{
        success: boolean;
    }>;
    logoutAll(user: AuthUserPayload): Promise<{
        success: boolean;
    }>;
    getSessions(user: AuthUserPayload): Promise<{
        id: string;
        createdAt: Date;
        deviceName: string | null;
        deviceId: string | null;
        platform: string | null;
        appVersion: string | null;
        lastSeenAt: Date;
    }[]>;
    revokeSession(user: AuthUserPayload, sessionId: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        sent: boolean;
    }>;
    getMe(user: AuthUserPayload): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
            locale: string;
            prefs: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        };
        memberships: {
            id: string;
            workspaceId: string;
            workspaceName: string;
            workspaceSlug: string;
            role: import(".prisma/client").$Enums.Role;
        }[];
    }>;
}
