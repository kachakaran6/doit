import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 3, // 3 minutes - screens render instantly with 0ms blank state
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory cache
      refetchOnWindowFocus: false,
      refetchOnMount: false, // instant render from cache if not stale
      refetchOnReconnect: true,
      networkMode: 'offlineFirst',
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});
