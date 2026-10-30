/**
 * Local view-models for the template feature.
 * Derived UI representations, separated from raw backend contract shapes.
 */

export interface XItemViewModel {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'ACTIVE' | 'ARCHIVED';
  updatedAt: string;
}

export interface XFilterState {
  status?: string;
  searchQuery?: string;
}
