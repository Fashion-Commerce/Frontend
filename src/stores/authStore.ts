import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi, type User } from '../api/auth.api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullname: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: { fullname?: string; phone?: string }) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const authResponse = await authApi.login({ username: email, password });
            
            // Fetch user data after successful login
            const user = await authApi.getCurrentUser();
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            
            return true;
          } catch (error: any) {
            set({ 
              error: error.message || 'Login failed', 
              isLoading: false,
              isAuthenticated: false
            });
            return false;
          }
        },

        register: async (fullname: string, email: string, password: string, phone?: string) => {
          set({ isLoading: true, error: null });
          try {
            await authApi.register({ fullname, email, password, phone });
            
            // Auto login after registration
            const success = await get().login(email, password);
            
            return success;
          } catch (error: any) {
            set({ 
              error: error.message || 'Registration failed', 
              isLoading: false 
            });
            return false;
          }
        },

        logout: () => {
          authApi.logout();
          set({ 
            user: null, 
            isAuthenticated: false,
            error: null
          });
        },

        fetchCurrentUser: async () => {
          if (!authApi.isAuthenticated()) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          set({ isLoading: true });
          try {
            const user = await authApi.getCurrentUser();
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to fetch user', 
              isLoading: false,
              isAuthenticated: false,
              user: null
            });
            authApi.logout();
          }
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const updatedUser = await authApi.updateProfile(data);
            set({ 
              user: updatedUser, 
              isLoading: false 
            });
            return true;
          } catch (error: any) {
            set({ 
              error: error.message || 'Update failed', 
              isLoading: false 
            });
            return false;
          }
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
