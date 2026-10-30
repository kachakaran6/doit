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
import { LabelsService } from './labels.service';
import {
  CreateLabelDto,
  CreateLabelSchema,
  UpdateLabelDto,
  UpdateLabelSchema,
} from './labels.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Labels')
@Controller()
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('workspaces/:workspaceId/labels')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create label in workspace' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body(new ZodValidationPipe(CreateLabelSchema)) dto: CreateLabelDto,
  ) {
    return this.labelsService.create(workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/labels')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List all labels in workspace' })
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.labelsService.findAll(workspaceId);
  }

  @Get('labels/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get label by ID' })
  async findOne(@Param('id') id: string) {
    return this.labelsService.findOne(id);
  }

  @Patch('labels/:id')
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update label name or color' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateLabelSchema)) dto: UpdateLabelDto,
  ) {
    return this.labelsService.update(id, dto);
  }

  @Delete('labels/:id')
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete label (detaches from all tasks)' })
  async delete(@Param('id') id: string) {
    return this.labelsService.delete(id);
  }
}
