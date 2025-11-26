/**
 * Constants - Hằng số cho ứng dụng
 * Theo coding standards - tất cả constants tập trung
 */

// ========== ONBOARDING CATEGORIES ==========
export const CATEGORIES_ONBOARDING = [
  { name: "Thời trang nam", icon: "👔" },
  { name: "Thời trang nữ", icon: "👗" },
  { name: "Giày dép", icon: "👟" },
  { name: "Phụ kiện", icon: "👜" },
  { name: "Đồ thể thao", icon: "⚽" },
  { name: "Đồ công sở", icon: "💼" },
];

// ========== API CONFIGURATION ==========
export const API_URL_1 =
  (import.meta as any).env?.VITE_API_URL_1 || "http://localhost:8000/v1";
export const API_URL_2 =
  (import.meta as any).env?.VITE_API_URL_2 || "http://localhost:8000/v1";
export const API_BASE_URL = API_URL_1; // Default API
export const API_TIMEOUT = 10000;

// ========== LOCAL STORAGE KEYS ==========
export const STORAGE_KEYS = {
  AUTH_TOKEN: "agentfashion_token",
  THEME: "agentfashion_theme",
  HAS_COMPLETED_ONBOARDING: "agentfashion_hasCompletedOnboarding",
  HAS_COMPLETED_TOUR: "agentfashion_hasCompletedTour",
  PREFERRED_CATEGORIES: "agentfashion_preferredCategories",
  getCartKey: (userId: string) => `agentfashion_cart_${userId}`,
  getWishlistKey: (userId: string) => `agentfashion_wishlist_${userId}`,
};

// ========== THEME ==========
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// ========== AGENT KEYWORDS ==========
export const AGENT_KEYWORDS = {
  SEARCH: [
    "tìm",
    "search",
    "có",
    "giá",
    "bao nhiêu",
    "xem",
    "hiển thị",
    "show",
  ],
  ADVISOR: [
    "phối",
    "combo",
    "gợi ý",
    "phù hợp",
    "tư vấn",
    "đẹp",
    "outfit",
    "style",
  ],
  ORDER: [
    "mua",
    "đặt",
    "order",
    "giỏ hàng",
    "cart",
    "thanh toán",
    "checkout",
    "xác nhận",
  ],
};

// ========== TOUR STEPS ==========
export const TOUR_STEPS = [
  {
    target: '[data-tour="chatbot"]',
    title: "Chat với AI",
    description:
      "Trò chuyện với AI để tìm sản phẩm, được tư vấn, hoặc đặt hàng",
  },
  {
    target: '[data-tour="products"]',
    title: "Danh sách sản phẩm",
    description: "Xem và lọc sản phẩm theo danh mục",
  },
  {
    target: '[data-tour="cart"]',
    title: "Giỏ hàng",
    description: "Xem và quản lý các sản phẩm bạn muốn mua",
  },
  {
    target: '[data-tour="wishlist"]',
    title: "Wishlist",
    description: "Lưu các sản phẩm yêu thích để mua sau",
  },
  {
    target: '[data-tour="theme"]',
    title: "Chế độ sáng/tối",
    description: "Chuyển đổi giữa chế độ sáng và tối",
  },
];

// ========== APP MODES ==========
export const APP_MODES = {
  STORE: "store",
  ADMIN: "admin",
} as const;

// ========== VIEW MODES ==========
export const VIEW_MODES = {
  PRODUCTS: "products",
  CART: "cart",
  WISHLIST: "wishlist",
} as const;
