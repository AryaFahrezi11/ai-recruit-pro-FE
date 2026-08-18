import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type Language = 'en' | 'id';

interface AppState {
  theme: Theme;
  language: Language;
  isMobileSidebarOpen: boolean;
  token: string | null;
  user: any | null;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (isOpen: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'id', // Default to Indonesian
      isMobileSidebarOpen: false,
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setMobileSidebar: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      setLanguage: (language) => set({ language }),
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (typeof window !== 'undefined') {
            if (newTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { theme: newTheme };
        }),
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          state.language = 'id';
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
