import { create } from 'zustand';
import { CreateType } from '@/components/layout/CreateModal';

interface CreateStoreState {
  open: boolean;
  type: CreateType;
  openCreate: (type?: CreateType) => void;
  closeCreate: () => void;
}

export const useCreateStore = create<CreateStoreState>((set) => ({
  open: false,
  type: 'task',
  openCreate: (type = 'task') => set({ open: true, type }),
  closeCreate: () => set({ open: false }),
}));

