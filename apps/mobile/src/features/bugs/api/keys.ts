export const bugKeys = {
  all: ['bugs'] as const,
  lists: () => [...bugKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...bugKeys.lists(), { filters }] as const,
  details: () => [...bugKeys.all, 'detail'] as const,
  detail: (id: string) => [...bugKeys.details(), id] as const,
};
