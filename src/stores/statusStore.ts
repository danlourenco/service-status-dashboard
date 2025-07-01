import { create } from 'zustand';
import type { ConfigData } from '../types';

interface StatusStore {
  // UI State
  currentInstance: string;
  autoRefresh: boolean;
  
  // Config
  config: ConfigData | null;
  
  // Actions
  setCurrentInstance: (instance: string) => void;
  toggleAutoRefresh: () => void;
  setConfig: (config: ConfigData) => void;
}

export const useStatusStore = create<StatusStore>((set) => ({
  // Initial state
  currentInstance: 'primary',
  autoRefresh: false,
  config: null,
  
  // Actions
  setCurrentInstance: (instance) => set({ currentInstance: instance }),
  toggleAutoRefresh: () => set((state) => ({ autoRefresh: !state.autoRefresh })),
  setConfig: (config) => set({ config }),
}));