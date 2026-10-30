import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StickiesService } from './stickies.service';
import {
  CreateStickyDto,
  CreateStickySchema,
  UpdateStickyDto,
  UpdateStickySchema,
  ReorderStickyDto,
  ReorderStickySchema,
  ConvertStickyDto,
  ConvertStickySchema,
} from './stickies.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Stickies')
@Controller()
@UseGuards(JwtAuthGuard)
export class StickiesController {
  constructor(private readonly stickiesService: StickiesService) {}

  @Post('projects/:projectId/stickies')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Create a sticky in project' })
  async create(
    @CurrentUser() user: AuthUserPayload,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(CreateStickySchema)) dto: CreateStickyDto,
  ) {
    return this.stickiesService.create(projectId, user.sub, dto);
  }

  @Get('projects/:projectId/stickies')
  @UseGuards(WorkspaceMemberGuard)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List stickies in project (supports ?pinned=true)' })
  @ApiQuery({ name: 'pinned', required: false, type: Boolean })
  async findAll(
    @Param('projectId') projectId: string,
    @Query('pinned') pinned?: string,
  ) {
    const isPinned = pinned !== undefined ? pinned === 'true' : undefined;
    return this.stickiesService.findAll(projectId, isPinned);
  }

  @Get('stickies/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get sticky by ID' })
  async findOne(@Param('id') id: string) {
    return this.stickiesService.findOne(id);
  }

  @Patch('stickies/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Update sticky body, color, or pinned status' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateStickySchema)) dto: UpdateStickyDto,
  ) {
    return this.stickiesService.update(id, dto);
  }

  @Post('stickies/:id/reorder')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Reorder sticky with fractional indexing' })
  async reorder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ReorderStickySchema)) dto: ReorderStickyDto,
  ) {
    return this.stickiesService.reorder(id, dto);
  }

  @Post('stickies/:id/convert')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Convert sticky to task (atomic, links both ways)' })
  async convert(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ConvertStickySchema)) dto: ConvertStickyDto,
  ) {
    return this.stickiesService.convert(id, user.sub, dto);
  }

  @Delete('stickies/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Delete sticky (keeps converted task intact)' })
  async delete(@Param('id') id: string) {
    return this.stickiesService.delete(id);
  }
}
