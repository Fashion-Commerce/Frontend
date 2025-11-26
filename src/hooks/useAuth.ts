/**
 * useAuth Hook
 * Custom hook quản lý authentication logic
 * Theo coding standards - hooks pattern
 */

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/types";
import * as authService from "@/services/authService";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    fullname: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Hook xử lý authentication logic
 * @returns {Object} { user, isAuthenticated, loading, error, login, register, logout, clearError }
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load user từ localStorage khi mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  /**
   * Đăng nhập
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await authService.login(email, password);

        if (result.user) {
          setUser(result.user);
          return true;
        } else {
          setError(result.error || "Đăng nhập thất bại");
          return false;
        }
      } catch (err: any) {
        setError(err?.message || "Đã có lỗi xảy ra");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Đăng ký
   */
  const register = useCallback(
    async (
      fullname: string,
      email: string,
      password: string,
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await authService.register(fullname, email, password);

        if (result.user) {
          // Auto login after register
          return await login(email, password);
        } else {
          setError(result.error || "Đăng ký thất bại");
          return false;
        }
      } catch (err: any) {
        setError(err?.message || "Đã có lỗi xảy ra");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [login],
  );

  /**
   * Đăng xuất
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };
};
