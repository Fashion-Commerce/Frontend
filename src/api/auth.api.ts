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
      const data = await http2.post<AuthResponse>("/signin", {
        account: credentials.account,
        password: credentials.password,
      });

      // Set token in both http clients
      http1.setToken(data.info.access_token);
      http2.setToken(data.info.access_token);

      return data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || "Invalid credentials");
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Use http2 (API_URL_2) for register
      const result = await http2.post<RegisterResponse>("/v1/users", data);
      return result;
    } catch (error: any) {
      // Re-throw error with server message if available
      if (error.response?.data) {
        const serverError = new Error(
          error.response.data.detail ||
            error.response.data.message ||
            error.message,
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

  // Get user details by user_id (http2 endpoint)
  async getUserDetails(userId: string): Promise<UserDetailResponse> {
    try {
      const data = await http2.get<UserDetailResponse>(`/v1/users/${userId}`);
      return data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to get user details",
      );
    }
  },

  // Update user profile (http2 endpoint)
  async updateProfile(
    userId: string,
    data: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> {
    try {
      const result = await http2.patch<UpdateProfileResponse>(
        `/v1/users/${userId}/profile`,
        data,
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to update profile",
      );
    }
  },

  // Update user password (http2 endpoint)
  async updatePassword(
    userId: string,
    data: UpdatePasswordRequest,
  ): Promise<UpdatePasswordResponse> {
    try {
      const result = await http2.patch<UpdatePasswordResponse>(
        `/v1/users/${userId}/password`,
        data,
      );
      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.detail || "Failed to update password",
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
};
