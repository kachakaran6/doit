import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, SearchQuerySchema } from './search.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({
    summary:
      'Global full-text search with operators (#label, @assignee, is:bug, is:done, due:today, project:KEY)',
  })
  async search(
    @CurrentUser() user: AuthUserPayload,
    @Query(new ZodValidationPipe(SearchQuerySchema)) query: SearchQueryDto,
  ) {
    return this.searchService.search(user.sub, query, query.workspaceId);
  }
}
