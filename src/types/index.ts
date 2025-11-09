/**
 * Tất cả type definitions cho ứng dụng
 * Theo chuẩn TypeScript pattern - centralized types
 */

// ========== PRODUCT TYPES ==========
export interface Product {
  product_id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  is_active: boolean;
  category_id: string;
  brand_id: string;
  category: Category;
  brand: Brand;
  image_urls?: string[];
  images?: string[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: string;
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  brand_id: string;
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  product_variant_id: string;
  id: string;
  product_id: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// ========== USER & AUTH TYPES ==========
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

export interface LoginRequest {
  username: string; // email or phone
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  phone?: string;
  password: string;
  is_admin: boolean; // Required field, default to false
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UpdateProfileRequest {
  fullname?: string;
  phone?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ========== CART TYPES ==========
export interface CartItem {
  cart_item_id?: string;
  id: string;
  userId: string;
  user_id?: string;
  product: Product;
  variant: ProductVariant;
  product_variant_id?: string;
  quantity: number;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddToCartRequest {
  product_variant_id: string;
  quantity: number;
}

// ========== CHAT TYPES ==========
export interface ChatMessage {
  id: number | string;
  content: string;
  sender: MessageSender;
  agent?: AgentType;
  suggestedProducts?: Product[];
}

export enum MessageSender {
  USER = "user",
  BOT = "bot",
}

export enum AgentType {
  SYSTEM = "system",
  SEARCH = "search",
  ADVISOR = "advisor",
  ORDER = "order",
}

// ========== ORDER TYPES ==========
export interface Order {
  order_id: string;
  id?: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  order_item_id: string;
  id?: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
  variant?: ProductVariant;
  created_at: string;
  updated_at: string;
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// ========== API REQUEST PARAMS ==========
export interface ProductsParams {
  page?: number;
  page_size?: number;
  name_search?: string;
  category_id_filter?: string;
  brand_id_filter?: string;
  price_min?: number;
  price_max?: number;
  is_active_filter?: boolean;
  sku_search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CategoriesParams {
  page?: number;
  page_size?: number;
  name_search?: string;
  parent_id_filter?: string;
}

export interface BrandsParams {
  page?: number;
  page_size?: number;
  name_search?: string;
}

export interface OrdersParams {
  page?: number;
  page_size?: number;
  status_filter?: OrderStatus;
  payment_status_filter?: PaymentStatus;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
