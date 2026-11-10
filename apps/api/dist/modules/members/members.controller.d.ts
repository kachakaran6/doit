import { MembersService } from './members.service';
import { InviteMemberDto, UpdateMemberRoleDto, AcceptInviteDto } from './members.dto';
import { AuthUserPayload } from '../../common/decorators/current-user.decorator';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    getMembers(workspaceId: string): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.Role;
        invitedEmail: string | null;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
        acceptedAt: Date | null;
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
            name: string;
            id: string;
            email: string;
        };
    }[]>;
    invite(workspaceId: string, user: AuthUserPayload, dto: InviteMemberDto, origin?: string, referer?: string): Promise<{
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
    createInvitation(workspaceId: string, user: AuthUserPayload, dto: InviteMemberDto, origin?: string, referer?: string): Promise<{
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
    resendInvitation(workspaceId: string, invitationId: string, user: AuthUserPayload, origin?: string, referer?: string): Promise<{
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
            name: string;
            id: string;
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
    acceptInvitation(user: AuthUserPayload, dto: AcceptInviteDto): Promise<{
        success: boolean;
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        role: import(".prisma/client").$Enums.Role;
    }>;
    acceptInvite(user: AuthUserPayload, dto: AcceptInviteDto): Promise<{
        success: boolean;
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateRole(workspaceId: string, memberId: string, dto: UpdateMemberRoleDto): Promise<{
        id: string;
        createdAt: Date;
        workspaceId: string;
        userId: string;
        role: import(".prisma/client").$Enums.Role;
        invitedEmail: string | null;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
        acceptedAt: Date | null;
    }>;
    removeMember(workspaceId: string, memberId: string): Promise<{
        success: boolean;
    }>;
}
