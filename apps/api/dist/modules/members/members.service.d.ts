import { PrismaService } from '../../infra/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { InviteMemberDto, UpdateMemberRoleDto } from './members.dto';
export declare class MembersService {
    private readonly prisma;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    private getAppBaseUrl;
    getMembers(workspaceId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.Role;
        invitedEmail: string | null;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
        acceptedAt: Date | null;
        createdAt: Date;
    })[]>;
    getInvitations(workspaceId: string): Promise<{
        id: string;
        workspaceId: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.InvitationStatus;
        maxUses: number;
        usesCount: number;
        expiresAt: Date;
        acceptedAt: Date | null;
        revokedAt: Date | null;
        createdAt: Date;
        invitedBy: {
            id: string;
            email: string;
            name: string;
        };
    }[]>;
    inviteMember(workspaceId: string, invitedById: string, dto: InviteMemberDto): Promise<{
        id: string;
        workspaceId: string;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.InvitationStatus;
        maxUses: number;
        usesCount: number;
        expiresAt: Date;
        token: string;
        inviteUrl: string;
        emailSent: boolean;
        emailError: string | undefined;
    }>;
    revokeInvitation(workspaceId: string, invitationId: string): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message?: undefined;
    }>;
    resendInvitation(workspaceId: string, invitationId: string, actorId: string): Promise<{
        success: boolean;
        emailSent: boolean;
        emailError: string | undefined;
        inviteUrl: string;
        token: string;
    }>;
    validateToken(token: string): Promise<{
        valid: boolean;
        reason: string;
        workspaceName?: undefined;
        workspace?: undefined;
        role?: undefined;
        invitedBy?: undefined;
        emailRestricted?: undefined;
        allowedEmail?: undefined;
        expiresAt?: undefined;
    } | {
        valid: boolean;
        reason: string;
        workspaceName: string;
        workspace?: undefined;
        role?: undefined;
        invitedBy?: undefined;
        emailRestricted?: undefined;
        allowedEmail?: undefined;
        expiresAt?: undefined;
    } | {
        valid: boolean;
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
        role: import(".prisma/client").$Enums.Role;
        invitedBy: string;
        emailRestricted: boolean;
        allowedEmail: string | null;
        expiresAt: Date;
        reason?: undefined;
        workspaceName?: undefined;
    }>;
    acceptInvite(userId: string, token: string): Promise<{
        success: boolean;
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateRole(workspaceId: string, memberId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.Role;
        invitedEmail: string | null;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
        acceptedAt: Date | null;
        createdAt: Date;
    }>;
    removeMember(workspaceId: string, memberId: string): Promise<{
        success: boolean;
    }>;
}
