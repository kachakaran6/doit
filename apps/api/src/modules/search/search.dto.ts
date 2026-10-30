import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().default(''),
  types: z.string().optional(), // 'task,bug,sticky,comment'
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  workspaceId: z.string().uuid().optional(),
});

export type SearchQueryDto = z.infer<typeof SearchQuerySchema>;

export interface SearchResultItem {
  type: 'task' | 'bug' | 'sticky' | 'comment';
  id: string;
  title: string;
  snippet: string;
  score: number;
  projectKey?: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}
