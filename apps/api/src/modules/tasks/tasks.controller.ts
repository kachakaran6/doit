import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  CreateTaskSchema,
  UpdateTaskDto,
  UpdateTaskSchema,
  UpdateStatusDto,
  UpdateStatusSchema,
  ReorderTaskDto,
  ReorderTaskSchema,
  AssignTaskDto,
  AssignTaskSchema,
  SetLabelsDto,
  SetLabelsSchema,
  CreateChecklistItemDto,
  CreateChecklistItemSchema,
  UpdateChecklistItemDto,
  UpdateChecklistItemSchema,
  TaskListQueryDto,
  TaskListQuerySchema,
  CreateCommentDto,
  CreateCommentSchema,
} from './tasks.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post('projects/:projectId/bugs')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create a new bug in a project' })
  async createBug(
    @CurrentUser() user: AuthUserPayload,
    @Param('projectId') projectId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() dto: any,
  ) {
    return this.tasksService.create(
      user.sub,
      {
        title: dto.title || 'Untitled Bug',
        description: dto.description,
        priority: dto.severity === 'CRITICAL' ? 'URGENT' : dto.severity === 'MAJOR' ? 'HIGH' : 'MEDIUM',
        type: 'BUG',
        source: 'BUG',
        projectId,
        assigneeId: dto.assigneeId,
        dueHasTime: false,
        labelIds: Array.isArray(dto.labelIds) ? dto.labelIds : [],
        severity: dto.severity || 'MAJOR',
        steps: dto.steps || [],
        expected: dto.expected || null,
        actual: dto.actual || null,
        frequency: dto.frequency || 'often',
        deviceModel: dto.deviceModel || dto.telemetry?.deviceModel,
        osVersion: dto.osVersion || dto.telemetry?.osVersion,
        appVersion: dto.appVersion || dto.telemetry?.appVersion,
        telemetry: dto.telemetry || {},
      } as any,
      idempotencyKey,
    );
  }

  @Get('projects/:projectId/bugs')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List bugs in a project' })
  async listBugsByProject(
    @Param('projectId') projectId: string,
    @Query(new ZodValidationPipe(TaskListQuerySchema)) query: TaskListQueryDto,
  ) {
    return this.tasksService.findAll({ projectId }, { ...query, type: 'BUG' });
  }

  @Get('bugs/:id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get bug details' })
  async findOneBug(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch('bugs/:id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update bug status or details' })
  async updateBug(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    if (dto.status) {
      const taskStatus =
        dto.status === 'RESOLVED' || dto.status === 'VERIFIED'
          ? 'DONE'
          : dto.status === 'IN_PROGRESS'
            ? 'IN_PROGRESS'
            : 'TODO';
      return this.tasksService.updateStatus(id, user.sub, { status: taskStatus });
    }
    return this.tasksService.update(id, user.sub, dto);
  }

  @Post('projects/:projectId/tasks')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create a new task in a project (idempotent)' })
  @ApiHeader({ name: 'idempotency-key', required: false })
  async create(
    @CurrentUser() user: AuthUserPayload,
    @Param('projectId') projectId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.sub, { ...dto, projectId }, idempotencyKey);
  }

  @Get('projects/:projectId/tasks')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List tasks in a project with filtering & cursor pagination' })
  async listByProject(
    @Param('projectId') projectId: string,
    @Query(new ZodValidationPipe(TaskListQuerySchema)) query: TaskListQueryDto,
  ) {
    return this.tasksService.findAll({ projectId }, { ...query, type: query.type || 'TASK' });
  }

  @Get('workspaces/:workspaceId/tasks')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List all tasks in a workspace' })
  async listByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query(new ZodValidationPipe(TaskListQuerySchema)) query: TaskListQueryDto,
  ) {
    return this.tasksService.findAll({ workspaceId }, { ...query, type: query.type || 'TASK' });
  }

  @Get('workspaces/:workspaceId/tasks/my-day')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List My Day tasks for current user in workspace' })
  async findMyDay(
    @CurrentUser() user: AuthUserPayload,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.tasksService.findMyDay(user.sub, workspaceId);
  }

  @Get('tasks/my-day')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List My Day tasks by query param workspaceId' })
  async findMyDayQuery(
    @CurrentUser() user: AuthUserPayload,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.tasksService.findMyDay(user.sub, workspaceId);
  }

  @Get('workspaces/:workspaceId/tasks/inbox')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List Inbox unassigned tasks in workspace' })
  async findInbox(@Param('workspaceId') workspaceId: string) {
    return this.tasksService.findInbox(workspaceId);
  }

  @Get('tasks/inbox')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List Inbox tasks by query param workspaceId' })
  async findInboxQuery(@Query('workspaceId') workspaceId: string) {
    return this.tasksService.findInbox(workspaceId);
  }

  @Get('tasks/:id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get full task details' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch('tasks/:id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update task properties' })
  async update(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.sub, dto);
  }

  @Patch('tasks/:id/status')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update task status through validated state machine (PATCH)' })
  async updateStatusPatch(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
  ) {
    return this.tasksService.updateStatus(id, user.sub, dto);
  }

  @Post('tasks/:id/status')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update task status through validated state machine (POST)' })
  async updateStatus(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStatusSchema)) dto: UpdateStatusDto,
  ) {
    return this.tasksService.updateStatus(id, user.sub, dto);
  }

  @Post('tasks/:id/reorder')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Reorder task via fractional indexing' })
  async reorder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ReorderTaskSchema)) dto: ReorderTaskDto,
  ) {
    return this.tasksService.reorder(id, dto);
  }

  @Post('tasks/:id/assign')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Assign task to user or unassign (POST)' })
  async assign(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignTaskSchema)) dto: AssignTaskDto,
  ) {
    return this.tasksService.assign(id, user.sub, dto.assigneeId ?? null);
  }

  @Patch('tasks/:id/assign')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Assign task to user or unassign (PATCH)' })
  async assignPatch(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignTaskSchema)) dto: AssignTaskDto,
  ) {
    return this.tasksService.assign(id, user.sub, dto.assigneeId ?? null);
  }

  @Post('tasks/:id/labels')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Set task labels' })
  async setLabels(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SetLabelsSchema)) dto: SetLabelsDto,
  ) {
    return this.tasksService.setLabels(id, user.sub, dto.labelIds);
  }

  @Delete('tasks/:id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete task' })
  async delete(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
  ) {
    return this.tasksService.delete(id, user.sub);
  }

  @Post('tasks/:id/checklist')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Add an item to task checklist' })
  async addChecklistItem(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateChecklistItemSchema)) dto: CreateChecklistItemDto,
  ) {
    return this.tasksService.addChecklistItem(id, dto);
  }

  @Patch(['checklist/:itemId', 'tasks/checklist/:itemId'])
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update a checklist item text or completion status' })
  async updateChecklistItem(
    @Param('itemId') itemId: string,
    @Body(new ZodValidationPipe(UpdateChecklistItemSchema)) dto: UpdateChecklistItemDto,
  ) {
    return this.tasksService.updateChecklistItem(itemId, dto);
  }

  @Delete(['checklist/:itemId', 'tasks/checklist/:itemId'])
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete a checklist item' })
  async deleteChecklistItem(@Param('itemId') itemId: string) {
    return this.tasksService.deleteChecklistItem(itemId);
  }

  @Get('tasks/:id/comments')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get all comments for a task' })
  async getComments(@Param('id') id: string) {
    return this.tasksService.getComments(id);
  }

  @Post('tasks/:id/comments')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Add a comment to a task' })
  async addComment(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateCommentSchema)) dto: CreateCommentDto,
  ) {
    return this.tasksService.createComment(id, user.sub, dto);
  }

  @Delete('tasks/:id/comments/:commentId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete a task comment' })
  async deleteComment(
    @CurrentUser() user: AuthUserPayload,
    @Param('commentId') commentId: string,
  ) {
    return this.tasksService.deleteComment(commentId, user.sub);
  }
}
