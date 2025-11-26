export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export const formatDateShort = (dateString: string): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+84|84|0)([3-9])([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("84")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+84${cleaned.substr(1)}`;
  }
  return `+84${cleaned}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "https://via.placeholder.com/400x400?text=No+Image";
  if (imagePath.startsWith("http")) return imagePath;

  const API_BASE_URL =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
  return `${API_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

export const handleApiError = (error: any): string => {
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  if (error?.detail) return error.detail;
  return "Đã xảy ra lỗi không xác định";
};
