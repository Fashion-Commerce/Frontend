import http1 from "@/lib/http1";
import http2 from "@/lib/http2";

export interface LoginRequest {
  account: string; // email or phone
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
  is_admin: boolean; // Required field
}

export interface AuthResponse {
  message: string;
  info: {
    message: string;
    user_id: string;
    user_type: string; // Added user_type field
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface RegisterResponse {
  message: string;
  info: {
    message: string;
    user_id: string;
    success: boolean;
  };
}

export interface User {
  user_id?: string;
  id?: string;
  fullname: string;
  email: string;
  phone?: string;
  user_type: string;
  is_active?: boolean;
  deleted?: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

export interface UserDetailResponse {
  message: string;
  info: {
    user: User;
    success: boolean;
    message: string;
  };
}

export interface UpdateProfileRequest {
  fullname?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  message: string;
  info: {
    message: string;
    success: boolean;
  };
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdatePasswordResponse {
  message: string;
  info: {
    message: string;
    success: boolean;
  };
}

export const authApi = {
  // Login with JSON body
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const data = await http1.post<AuthResponse>("/signin", {
        account: credentials.account,
        password: credentials.password,
      });

      console.log("🔐 [AuthAPI] Login successful, setting token...");
      console.log(
        "🔑 [AuthAPI] Token:",
        data.info.access_token.substring(0, 20) + "..."
      );

      // Set token in BOTH http clients
      http1.setToken(data.info.access_token);
      http2.setToken(data.info.access_token);

      console.log("✅ [AuthAPI] Token set in both http1 and http2");

      return data;
    } catch (error: any) {
      console.error("❌ [AuthAPI] Login failed:", error.message);
      throw new Error(error?.response?.data?.detail || "Invalid credentials");
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Use http1 (API_URL_2) for register
      const result = await http1.post<RegisterResponse>("/v1/users", data);
      return result;
    } catch (error: any) {
      // Re-throw error with server message if available
      if (error.response?.data) {
        const serverError = new Error(
          error.response.data.detail ||
            error.response.data.message ||
            error.message
        );
        (serverError as any).response = error.response;
        throw serverError;
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    return http1.get<User>("/users/me");
  },

  // Get user details by user_id (http1 endpoint)
  async getUserDetails(userId: string): Promise<UserDetailResponse> {
    try {
      const data = await http1.get<UserDetailResponse>(`/v1/users/${userId}`);
      return data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to get user details"
      );
    }
  },

  // Update user profile (http1 endpoint)
  async updateProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    try {
      const result = await http1.patch<UpdateProfileResponse>(
        `/v1/users/${userId}/profile`,
        data
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to update profile"
      );
    }
  },

  // Update user password (http1 endpoint)
  async updatePassword(
    userId: string,
    data: UpdatePasswordRequest
  ): Promise<UpdatePasswordResponse> {
    try {
      const result = await http1.patch<UpdatePasswordResponse>(
        `/v1/users/${userId}/password`,
        data
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to update password"
      );
    }
  },

  logout() {
    http1.clearToken();
    http2.clearToken();
  },

  isAuthenticated(): boolean {
    return http1.isAuthenticated();
  },

  getToken(): string | null {
    return http1.getToken();
  },

  // Initialize both http clients with token from localStorage
  initializeToken(): void {
    const token = localStorage.getItem("auth_token");
    console.log("🔄 [AuthAPI] Initializing token from localStorage...");
    console.log("🔑 [AuthAPI] Token found in localStorage:", !!token);

    if (token) {
      console.log(
        "🔑 [AuthAPI] Token preview:",
        token.substring(0, 20) + "..."
      );
      // Set token to both clients - this will trigger the interceptor
      http1.setToken(token);
      http2.setToken(token);
      console.log("✅ [AuthAPI] Token set to both http1 and http2");
    } else {
      console.log("⚠️ [AuthAPI] No token in localStorage");
    }
  },
};
