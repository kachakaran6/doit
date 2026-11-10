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
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  CreateProjectSchema,
  UpdateProjectDto,
  UpdateProjectSchema,
} from './projects.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Projects')
@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create project in workspace (OWNER, ADMIN)' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto,
  ) {
    return this.projectsService.create(workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List projects in workspace' })
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get('projects/:id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('projects/:id/members')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List members and default assignee for project' })
  async getProjectMembers(@Param('id') id: string) {
    return this.projectsService.getProjectMembers(id);
  }

  @Patch('projects/:id')
  @UseGuards(WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update project (OWNER, ADMIN)' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete('projects/:id')
  @UseGuards(WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete project (OWNER, ADMIN)' })
  async delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
