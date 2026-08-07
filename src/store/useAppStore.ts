import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeName } from '../theme/tokens';

const THEME_CYCLE: ThemeName[] = ['dark', 'light'];

interface AppState {
  theme: ThemeName;
  sidebarOpen: boolean;
  drawerOpen: boolean;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: true,
      drawerOpen: false,
      setTheme: (theme) => set({ theme }),
      cycleTheme: () => {
        const current = get().theme;
        const idx = THEME_CYCLE.indexOf(current);
        set({ theme: THEME_CYCLE[(idx + 1) % THEME_CYCLE.length] });
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
    }),
    {
      name: 'ebc-crm-app-store',
      partialize: (s) => ({ theme: s.theme }),
      migrate: (persisted) => {
        const state = persisted as { theme?: string };
        // Collapses every legacy theme value onto the current 2-theme
        // system: pre-theme-picker installs persisted 'light' | 'dark'
        // directly; the 3-theme-picker era persisted
        // 'command' | 'daywatch' | 'field'. 'daywatch' and 'light' both map
        // to the new light theme; everything else (including unknown/
        // missing values) falls back to dark.
        if (state?.theme === 'daywatch' || state?.theme === 'light') return { theme: 'light' };
        return { theme: 'dark' };
      },
      version: 2,
    }
  )
);
