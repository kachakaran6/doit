export interface StickyViewModel {
  id: string;
  body: string;
  color?: string;
  orderKey: string;
  isPinned: boolean;
  convertedTaskId?: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
