/**
 * Authentication Service
 * Xử lý logic authentication, local storage cho token & user
 * Theo coding standards - service pattern
 */

import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "@/types";
import { STORAGE_KEYS } from "@/constants";
import { authApi } from "@/api/auth.api";

/**
 * Đăng nhập user
 * @param email - Email đăng nhập
 * @param password - Mật khẩu
 * @returns Object chứa user hoặc error message
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> => {
  try {
    const credentials: LoginRequest = {
      username: email,
      password,
    };

    const authResponse: AuthResponse = await authApi.login(credentials);

    // Lưu token vào localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.access_token);

    // Lấy thông tin user
    const user = await authApi.getCurrentUser();

    // Lưu user vào localStorage
    localStorage.setItem("agentfashion_user", JSON.stringify(user));

    return { user };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      error:
        error?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
    };
  }
};

/**
 * Đăng ký user mới
 * @deprecated Use authStore.register() instead
 * @param fullname - Tên đầy đủ
 * @param email - Email
 * @param password - Mật khẩu
 * @param phone - Số điện thoại (optional)
 * @returns Object chứa user hoặc error message
 */
export const register = async (
  fullname: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ user?: User; error?: string }> => {
  try {
    const registerData: RegisterRequest = {
      fullname,
      email,
      password,
      phone,
      is_admin: false, // Always false for regular user registration
    };

    const user = await authApi.register(registerData);

    return { user };
  } catch (error: any) {
    console.error("Register error:", error);
    return {
      error:
        error?.message || "Đăng ký thất bại. Email có thể đã được sử dụng.",
    };
  }
};

/**
 * Đăng xuất user
 */
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem("agentfashion_user");
  authApi.logout();
};

/**
 * Lấy thông tin user hiện tại từ localStorage
 * @returns User object hoặc null
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem("agentfashion_user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns true nếu đã đăng nhập
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const user = getCurrentUser();
  return Boolean(token && user);
};

/**
 * Lấy token hiện tại
 * @returns Token string hoặc null
 */
export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};
