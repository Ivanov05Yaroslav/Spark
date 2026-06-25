import { create } from 'zustand';
import { User } from '@/types/auth.types.ts';

interface AppState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  theme: 'light' | 'dark';
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  toggleTheme: () => void;
}

const initialUser: User | null = JSON.parse(localStorage.getItem('user') || 'null');

export const useStore = create<AppState>((set) => ({
  user: initialUser,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isTeacher: !!initialUser?.roles?.includes('TEACHER'),
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isTeacher: user.roles.includes('TEACHER'),
    });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isTeacher: false,
    });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    });
  },
}));
