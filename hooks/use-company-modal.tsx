import { create } from 'zustand';

interface UseCompanyModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCompanyModal = create<UseCompanyModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
