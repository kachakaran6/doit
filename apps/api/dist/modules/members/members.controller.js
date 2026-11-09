"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const members_service_1 = require("./members.service");
const members_dto_1 = require("./members.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const workspace_member_guard_1 = require("../../common/guards/workspace-member.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let MembersController = class MembersController {
    constructor(membersService) {
        this.membersService = membersService;
    }
    async getMembers(workspaceId) {
        return this.membersService.getMembers(workspaceId);
    }
    async getInvitations(workspaceId) {
        return this.membersService.getInvitations(workspaceId);
    }
    async invite(workspaceId, user, dto, origin, referer) {
        return this.membersService.inviteMember(workspaceId, user.sub, dto, origin || referer);
    }
    async createInvitation(workspaceId, user, dto, origin, referer) {
        return this.membersService.inviteMember(workspaceId, user.sub, dto, origin || referer);
    }
    async revokeInvitation(workspaceId, invitationId) {
        return this.membersService.revokeInvitation(workspaceId, invitationId);
    }
    async resendInvitation(workspaceId, invitationId, user, origin, referer) {
        return this.membersService.resendInvitation(workspaceId, invitationId, user.sub, origin || referer);
    }
    async validateToken(token) {
        return this.membersService.validateToken(token);
    }
    async acceptInvitation(user, dto) {
        return this.membersService.acceptInvite(user.sub, dto.token);
    }
    async acceptInvite(user, dto) {
        return this.membersService.acceptInvite(user.sub, dto.token);
    }
    async updateRole(workspaceId, memberId, dto) {
        return this.membersService.updateRole(workspaceId, memberId, dto);
    }
    async removeMember(workspaceId, memberId) {
        return this.membersService.removeMember(workspaceId, memberId);
    }
};
exports.MembersController = MembersController;
__decorate([
    (0, common_1.Get)('workspaces/:workspaceId/members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List workspace members' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Get)('workspaces/:workspaceId/invitations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'List pending and active workspace invitations (OWNER, ADMIN)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "getInvitations", null);
__decorate([
    (0, common_1.Post)('workspaces/:workspaceId/members/invite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite new member or generate shareable link (OWNER, ADMIN)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(members_dto_1.InviteMemberSchema))),
    __param(3, (0, common_1.Headers)('origin')),
    __param(4, (0, common_1.Headers)('referer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)('workspaces/:workspaceId/invitations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create invitation / shareable link (alias)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(members_dto_1.InviteMemberSchema))),
    __param(3, (0, common_1.Headers)('origin')),
    __param(4, (0, common_1.Headers)('referer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Delete)('workspaces/:workspaceId/invitations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke pending workspace invitation (OWNER, ADMIN)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "revokeInvitation", null);
__decorate([
    (0, common_1.Post)('workspaces/:workspaceId/invitations/:id/resend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Resend invitation email (OWNER, ADMIN)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Headers)('origin')),
    __param(4, (0, common_1.Headers)('referer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "resendInvitation", null);
__decorate([
    (0, common_1.Get)('invitations/validate/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Publicly validate invitation token without authentication' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Post)('invitations/accept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept workspace invitation token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(members_dto_1.AcceptInviteSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Post)('members/accept-invite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept workspace invitation token (backward compatible alias)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(members_dto_1.AcceptInviteSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Patch)('workspaces/:workspaceId/members/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update member role (OWNER only)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(members_dto_1.UpdateMemberRoleSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('workspaces/:workspaceId/members/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, workspace_member_guard_1.WorkspaceMemberGuard),
    (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'),
    (0, swagger_1.ApiBearerAuth)('bearer-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from workspace (OWNER, ADMIN)' }),
    __param(0, (0, common_1.Param)('workspaceId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MembersController.prototype, "removeMember", null);
exports.MembersController = MembersController = __decorate([
    (0, swagger_1.ApiTags)('Members & Invitations'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [members_service_1.MembersService])
], MembersController);
//# sourceMappingURL=members.controller.js.map