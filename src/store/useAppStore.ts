import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeName } from '../theme/tokens';

const THEME_CYCLE: ThemeName[] = ['command', 'daywatch', 'field'];

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
      theme: 'command',
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
        // Pre-theme-picker installs only ever persisted 'light' | 'dark'.
        if (state?.theme === 'dark') return { theme: 'command' };
        if (state?.theme === 'light') return { theme: 'daywatch' };
        return persisted as { theme: ThemeName };
      },
      version: 1,
    }
  )
);
