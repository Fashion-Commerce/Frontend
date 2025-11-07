import { apiClient } from '@/lib/api-client';

export interface LoginRequest {
  username: string; // email or phone
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
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
}

export interface UpdateProfileRequest {
  fullname?: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export const authApi = {
  // Login with form data
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(
      `${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/v1'}/token`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    
    // Set token in API client
    apiClient.setToken(data.access_token);
    
    return data;
  },

  async register(data: RegisterRequest): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>('/users/profile', data);
  },

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    return apiClient.put<void>('/users/password', data);
  },

  logout() {
    apiClient.clearToken();
  },

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },

  getToken(): string | null {
    return apiClient.getToken();
  },
};
