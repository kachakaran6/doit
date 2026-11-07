import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { ContextAiService } from './context-ai.service';
import { ALLOWED_MODELS } from './prompt-builder';

const ContextSchema = z.object({
  markdown: z.string(),
  version: z.number().int().nonnegative().optional(),
});

const PrefsSchema = z.object({
  workspaceId: z.string().uuid(),
  defaultProjectId: z.string().uuid().nullable().optional(),
  defaultLabelIds: z.array(z.string().uuid()).optional(),
  rememberLastProject: z.boolean().optional(),
  showProjectSelector: z.boolean().optional(),
  labelsExpanded: z.boolean().optional(),
  lastProjectId: z.string().uuid().nullable().optional(),
});

const CredentialSchema = z.object({
  apiKey: z.string().min(8).optional(),
  model: z.enum(ALLOWED_MODELS),
  enabled: z.boolean().optional(),
});

const GenerateSchema = z.object({
  selectedAttachmentIds: z.array(z.string().uuid()).max(6).optional(),
  force: z.boolean().optional(),
  useTemplate: z.boolean().optional(),
  idempotencyKey: z.string().min(8).max(80).optional(),
});

const UpdatePromptSchema = z.object({
  promptMarkdown: z.string().min(1),
});

@ApiTags('Context and AI')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer-auth')
export class ContextAiController {
  constructor(private readonly service: ContextAiService) {}

  @Get('projects/:projectId/context')
  @ApiOperation({ summary: 'Get Markdown project context' })
  getContext(@CurrentUser() user: AuthUserPayload, @Param('projectId') projectId: string) {
    return this.service.getContext(user.sub, projectId);
  }

  @Put('projects/:projectId/context')
  @ApiOperation({ summary: 'Save Markdown project context' })
  putContext(
    @CurrentUser() user: AuthUserPayload,
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(ContextSchema)) body: z.infer<typeof ContextSchema>,
  ) {
    return this.service.putContext(user.sub, projectId, body.markdown, body.version);
  }

  @Get('me/quick-capture-preferences')
  @ApiOperation({ summary: 'Get quick capture defaults for a workspace' })
  getPrefs(@CurrentUser() user: AuthUserPayload, @Query('workspaceId') workspaceId: string) {
    return this.service.getCapturePrefs(user.sub, workspaceId);
  }

  @Put('me/quick-capture-preferences')
  @ApiOperation({ summary: 'Save quick capture defaults' })
  putPrefs(
    @CurrentUser() user: AuthUserPayload,
    @Body(new ZodValidationPipe(PrefsSchema)) body: z.infer<typeof PrefsSchema>,
  ) {
    return this.service.putCapturePrefs(user.sub, body);
  }

  @Get('me/ai-providers')
  @ApiOperation({ summary: 'List personal AI providers without secrets' })
  listProviders(@CurrentUser() user: AuthUserPayload) {
    return this.service.listCredentials(user.sub);
  }

  @Put('me/ai-providers/:provider')
  @ApiOperation({ summary: 'Save a personal AI provider key' })
  saveProvider(
    @CurrentUser() user: AuthUserPayload,
    @Param('provider') provider: string,
    @Body(new ZodValidationPipe(CredentialSchema)) body: z.infer<typeof CredentialSchema>,
  ) {
    return this.service.saveCredential(user.sub, provider, body);
  }

  @Post('me/ai-providers/:provider/test')
  @ApiOperation({ summary: 'Test a saved AI provider key' })
  testProvider(@CurrentUser() user: AuthUserPayload, @Param('provider') provider: string) {
    return this.service.testCredential(user.sub, provider);
  }

  @Delete('me/ai-providers/:provider')
  @ApiOperation({ summary: 'Delete a personal AI provider key' })
  deleteProvider(@CurrentUser() user: AuthUserPayload, @Param('provider') provider: string) {
    return this.service.deleteCredential(user.sub, provider);
  }

  @Get('tasks/:taskId/solution-prompts')
  @ApiOperation({ summary: 'List solution prompts for a task' })
  listPrompts(@CurrentUser() user: AuthUserPayload, @Param('taskId') taskId: string) {
    return this.service.listPrompts(user.sub, taskId);
  }

  @Post('tasks/:taskId/solution-prompts/generate')
  @ApiOperation({ summary: 'Assemble or generate a solution prompt' })
  generate(
    @CurrentUser() user: AuthUserPayload,
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(GenerateSchema)) body: z.infer<typeof GenerateSchema>,
  ) {
    return this.service.generate(user.sub, taskId, body);
  }

  @Patch('solution-prompts/:promptId')
  @ApiOperation({ summary: 'Save a manual edit of a solution prompt' })
  updatePrompt(
    @CurrentUser() user: AuthUserPayload,
    @Param('promptId') promptId: string,
    @Body(new ZodValidationPipe(UpdatePromptSchema)) body: z.infer<typeof UpdatePromptSchema>,
  ) {
    return this.service.updatePrompt(user.sub, promptId, body.promptMarkdown);
  }

  @Post('solution-prompts/:promptId/regenerate')
  @ApiOperation({ summary: 'Regenerate a solution prompt from the current task' })
  regenerate(
    @CurrentUser() user: AuthUserPayload,
    @Param('promptId') promptId: string,
    @Body(new ZodValidationPipe(GenerateSchema)) body: z.infer<typeof GenerateSchema>,
  ) {
    return this.service.regenerate(user.sub, promptId, body);
  }
}
