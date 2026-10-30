export const xKeys = {
  all: ['x'] as const,
  lists: () => [...xKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...xKeys.lists(), { filters }] as const,
  details: () => [...xKeys.all, 'detail'] as const,
  detail: (id: string) => [...xKeys.details(), id] as const,
};
