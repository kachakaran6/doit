import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import {
  InviteMemberDto,
  InviteMemberSchema,
  UpdateMemberRoleDto,
  UpdateMemberRoleSchema,
  AcceptInviteDto,
  AcceptInviteSchema,
} from './members.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Members & Invitations')
@Controller()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('workspaces/:workspaceId/members')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List workspace members' })
  async getMembers(@Param('workspaceId') workspaceId: string) {
    return this.membersService.getMembers(workspaceId);
  }

  @Get('workspaces/:workspaceId/invitations')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List pending and active workspace invitations (OWNER, ADMIN)' })
  async getInvitations(@Param('workspaceId') workspaceId: string) {
    return this.membersService.getInvitations(workspaceId);
  }

  @Post('workspaces/:workspaceId/members/invite')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Invite new member or generate shareable link (OWNER, ADMIN)' })
  async invite(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(InviteMemberSchema)) dto: InviteMemberDto,
  ) {
    return this.membersService.inviteMember(workspaceId, user.sub, dto);
  }

  @Post('workspaces/:workspaceId/invitations')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create invitation / shareable link (alias)' })
  async createInvitation(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(InviteMemberSchema)) dto: InviteMemberDto,
  ) {
    return this.membersService.inviteMember(workspaceId, user.sub, dto);
  }

  @Delete('workspaces/:workspaceId/invitations/:id')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Revoke pending workspace invitation (OWNER, ADMIN)' })
  async revokeInvitation(
    @Param('workspaceId') workspaceId: string,
    @Param('id') invitationId: string,
  ) {
    return this.membersService.revokeInvitation(workspaceId, invitationId);
  }

  @Post('workspaces/:workspaceId/invitations/:id/resend')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Resend invitation email (OWNER, ADMIN)' })
  async resendInvitation(
    @Param('workspaceId') workspaceId: string,
    @Param('id') invitationId: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.membersService.resendInvitation(workspaceId, invitationId, user.sub);
  }

  /**
   * Public validation endpoint — can be called by web or mobile before auth.
   */
  @Get('invitations/validate/:token')
  @ApiOperation({ summary: 'Publicly validate invitation token without authentication' })
  async validateToken(@Param('token') token: string) {
    return this.membersService.validateToken(token);
  }

  @Post('invitations/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Accept workspace invitation token' })
  async acceptInvitation(
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(AcceptInviteSchema)) dto: AcceptInviteDto,
  ) {
    return this.membersService.acceptInvite(user.sub, dto.token);
  }

  @Post('members/accept-invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Accept workspace invitation token (backward compatible alias)' })
  async acceptInvite(
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(AcceptInviteSchema)) dto: AcceptInviteDto,
  ) {
    return this.membersService.acceptInvite(user.sub, dto.token);
  }

  @Patch('workspaces/:workspaceId/members/:id')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update member role (OWNER only)' })
  async updateRole(
    @Param('workspaceId') workspaceId: string,
    @Param('id') memberId: string,
    @Body(new ZodValidationPipe(UpdateMemberRoleSchema)) dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateRole(workspaceId, memberId, dto);
  }

  @Delete('workspaces/:workspaceId/members/:id')
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Remove member from workspace (OWNER, ADMIN)' })
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('id') memberId: string,
  ) {
    return this.membersService.removeMember(workspaceId, memberId);
  }
}
