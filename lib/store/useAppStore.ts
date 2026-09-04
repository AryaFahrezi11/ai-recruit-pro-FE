import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isMobileSidebarOpen: boolean;
  token: string | null;
  user: any | null;

  toggleMobileSidebar: () => void;
  setMobileSidebar: (isOpen: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isMobileSidebarOpen: false,
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setMobileSidebar: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          document.documentElement.classList.remove('dark'); // Force remove dark mode on load just in case
        }
      },
    }
  )
);
