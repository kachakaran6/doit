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
        userId: string;
        createdAt: Date;
        workspaceId: string;
        role: import(".prisma/client").$Enums.Role;
        invitedEmail: string | null;
        inviteToken: string | null;
        inviteExpiresAt: Date | null;
        acceptedAt: Date | null;
    })[]>;
    invite(workspaceId: string, dto: InviteMemberDto): Promise<{
        id: string;
        email: string;
        token: string;
        expiresAt: Date;
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
