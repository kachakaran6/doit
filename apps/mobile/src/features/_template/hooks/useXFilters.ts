import { useState, useMemo } from 'react';
import { XItemViewModel, XFilterState } from '../types';

export function useXFilters(items: XItemViewModel[] = []) {
  const [filters, setFilters] = useState<XFilterState>({});

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [items, filters]);

  return {
    filters,
    setFilters,
    filteredItems,
  };
}
