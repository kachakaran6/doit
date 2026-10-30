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
import { WorkspacesService } from './workspaces.service';
import {
  CreateWorkspaceDto,
  CreateWorkspaceSchema,
  UpdateWorkspaceDto,
  UpdateWorkspaceSchema,
} from './workspaces.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create a new workspace' })
  async create(
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(CreateWorkspaceSchema)) dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.sub, dto);
  }

  @Get()
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List all workspaces the user belongs to' })
  async findAll(@CurrentUser() user: AuthUserPayload) {
    return this.workspacesService.findAll(user.sub);
  }

  @Get(':id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get workspace details' })
  async findOne(@Param('id') id: string) {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceMemberGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update workspace (OWNER, ADMIN)' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateWorkspaceSchema)) dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceMemberGuard)
  @Roles('OWNER')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete workspace (OWNER only)' })
  async delete(@Param('id') id: string) {
    return this.workspacesService.delete(id);
  }
}
