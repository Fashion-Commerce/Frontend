import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { authApi, type User } from "../api/auth.api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    fullname: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<boolean>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: {
    fullname?: string;
    phone?: string;
  }) => Promise<boolean>;
  clearError: () => void;
  initializeAuth: () => void; // Load token from localStorage
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
            const authResponse = await authApi.login({
              account: email,
              password,
            });

            // Extract fullname from message: "User signed in successfully: FULLNAME"
            const fullnameMatch = authResponse.info.message.match(/:\s*(.+)$/);
            const fullname = fullnameMatch
              ? fullnameMatch[1]
              : email.split("@")[0];

            // Create user object from login response
            const user = {
              user_id: authResponse.info.user_id,
              email,
              fullname, // Extracted from info.message
              user_type: authResponse.info.user_type, // Use user_type from API response
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            toast.success(`Chào mừng ${user.fullname}! Đăng nhập thành công.`);
            return true;
          } catch (error: any) {
            const errorMessage = error.message || "Đăng nhập thất bại";
            set({
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
            });
            toast.error(errorMessage);
            return false;
          }
        },

        register: async (
          fullname: string,
          email: string,
          password: string,
          phone?: string
        ) => {
          set({ isLoading: true, error: null });
          try {
            const registerData = {
              fullname,
              email,
              password,
              phone,
              is_admin: false,
            };

            const registerResult = await authApi.register(registerData);

            // Auto login after registration
            const authResponse = await authApi.login({
              account: email,
              password,
            });

            // Create user object from both responses
            const user = {
              user_id: authResponse.info.user_id,
              fullname,
              email,
              phone,
              user_type: authResponse.info.user_type, // Use user_type from API response
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            toast.success(`Chào mừng ${fullname}! Đăng ký thành công.`);
            return true;
          } catch (error: any) {
            // Extract error message from server response
            let errorMessage = "Đăng ký thất bại";

            if (error.response?.data?.detail) {
              const detail = error.response.data.detail;
              if (detail.includes("already exists")) {
                errorMessage =
                  "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.";
              } else {
                errorMessage = detail;
              }
            } else if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            set({
              error: errorMessage,
              isLoading: false,
            });

            toast.error(errorMessage);
            return false;
          }
        },

        logout: () => {
          authApi.logout(); // This clears token from both http1 and http2
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
          toast.info("Đã đăng xuất thành công");
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
              isLoading: false,
            });
          } catch (error: any) {
            set({
              error: error.message || "Failed to fetch user",
              isLoading: false,
              isAuthenticated: false,
              user: null,
            });
            authApi.logout();
          }
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const currentUser = get().user;
            if (!currentUser?.user_id) {
              throw new Error("User not found");
            }

            await authApi.updateProfile(currentUser.user_id, data);

            // Fetch updated user data
            const userDetails = await authApi.getUserDetails(
              currentUser.user_id
            );

            set({
              user: userDetails.info.user,
              isLoading: false,
            });

            toast.success("Cập nhật thông tin thành công!");
            return true;
          } catch (error: any) {
            const errorMessage = error.message || "Cập nhật thất bại";
            set({
              error: errorMessage,
              isLoading: false,
            });
            toast.error(errorMessage);
            return false;
          }
        },

        clearError: () => {
          set({ error: null });
        },

        initializeAuth: () => {
          console.log("🔧 [AuthStore] Initializing auth...");

          // Load token from localStorage and set it to both http clients
          authApi.initializeToken();

          const token = authApi.getToken();
          console.log("🔑 [AuthStore] Token found:", !!token);

          if (token) {
            // Token exists, user is authenticated
            // User data will be loaded from zustand persist
            const state = get();
            console.log("👤 [AuthStore] User from persist:", state.user?.email);
            console.log(
              "✅ [AuthStore] isAuthenticated from persist:",
              state.isAuthenticated
            );

            if (state.user && state.isAuthenticated) {
              // Already have user data from persist, just verify we're authenticated
              set({ isAuthenticated: true });
              console.log("✅ [AuthStore] Auth restored from persist");
            } else {
              // Have token but no user data, fetch current user
              console.log("🔄 [AuthStore] Fetching current user...");
              get().fetchCurrentUser();
            }
          } else {
            // No token, clear everything
            console.log("❌ [AuthStore] No token found, clearing auth");
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);
