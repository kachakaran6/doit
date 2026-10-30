export const stickyKeys = {
  all: ['stickies'] as const,
  lists: () => [...stickyKeys.all, 'list'] as const,
  list: (projectId: string) => [...stickyKeys.lists(), projectId] as const,
};
