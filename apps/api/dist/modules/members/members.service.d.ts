import { PrismaService } from '../../infra/prisma/prisma.service';
import { InviteMemberDto, UpdateMemberRoleDto } from './members.dto';
export declare class MembersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getMembers(workspaceId: string): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string;
        role: import(".prisma/client").$Enums.Role;
        invitedEmail: string | null;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
        acceptedAt: Date | null;
    })[]>;
    inviteMember(workspaceId: string, dto: InviteMemberDto): Promise<{
        id: string;
        email: string;
        token: string;
        expiresAt: Date;
    }>;
    acceptInvite(userId: string, token: string): Promise<{
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
        userId: string;
        createdAt: Date;
        workspaceId: string;
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
