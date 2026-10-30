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

@ApiTags('Members')
@Controller()
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('workspaces/:workspaceId/members')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List workspace members' })
  async getMembers(@Param('workspaceId') workspaceId: string) {
    return this.membersService.getMembers(workspaceId);
  }

  @Post('workspaces/:workspaceId/members/invite')
  @UseGuards(WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Invite new member to workspace (OWNER, ADMIN)' })
  async invite(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(InviteMemberSchema)) dto: InviteMemberDto,
  ) {
    return this.membersService.inviteMember(workspaceId, dto);
  }

  @Post('members/accept-invite')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Accept workspace invitation token' })
  async acceptInvite(
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(AcceptInviteSchema)) dto: AcceptInviteDto,
  ) {
    return this.membersService.acceptInvite(user.sub, dto.token);
  }

  @Patch('workspaces/:workspaceId/members/:id')
  @UseGuards(WorkspaceMemberGuard)
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
  @UseGuards(WorkspaceMemberGuard)
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
