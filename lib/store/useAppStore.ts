import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'id';

interface AppState {
  language: Language;
  isMobileSidebarOpen: boolean;
  token: string | null;
  user: any | null;
  setLanguage: (lang: Language) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebar: (isOpen: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'id', // Default to Indonesian
      isMobileSidebarOpen: false,
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setMobileSidebar: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          state.language = 'id';
          document.documentElement.classList.remove('dark'); // Force remove dark mode on load just in case
        }
      },
    }
  )
);
