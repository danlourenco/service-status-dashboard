import { create } from 'zustand';
import type { ConfigData } from '../types';

interface StatusStore {
  // UI State
  currentInstance: string;
  autoRefresh: boolean;
  customRefreshInterval: number | null; // Override for config refresh interval
  
  // Config
  config: ConfigData | null;
  
  // Actions
  setCurrentInstance: (instance: string) => void;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (intervalMs: number) => void;
  setConfig: (config: ConfigData) => void;
}

export const useStatusStore = create<StatusStore>((set) => ({
  // Initial state
  currentInstance: 'primary',
  autoRefresh: false,
  customRefreshInterval: null,
  config: null,
  
  // Actions
  setCurrentInstance: (instance) => set({ currentInstance: instance }),
  toggleAutoRefresh: () => set((state) => ({ autoRefresh: !state.autoRefresh })),
  setRefreshInterval: (intervalMs) => set({ customRefreshInterval: intervalMs }),
  setConfig: (config) => set({ config }),
}));