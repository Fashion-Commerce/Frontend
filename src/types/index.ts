/**
 * Tất cả type definitions cho ứng dụng
 * Theo chuẩn TypeScript pattern - centralized types
 */

// ========== PRODUCT TYPES ==========
export interface Product {
  product_id?: string;
  id?: string;
  name: string;
  description: string;
  base_price?: number;
  price?: number;
  sku?: string;
  is_active?: boolean;
  category_id: string;
  brand_id: string;
  category?: Category;
  brand?: Brand;
  category_name?: string;
  brand_name?: string;
  image_urls?: string[];
  imageUrls?: string[];
  images?: string[];
  variants?: ProductVariant[];
  average_rating?: number;
  averageRating?: number;
  review_count?: number;
  reviewCount?: number;
  basePrice?: number;
  created_at?: string;
  updated_at?: string | null;
}

export interface Category {
  category_id?: string;
  id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  brand_id?: string;
  id?: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  product_variant_id?: string;
  variant_id?: string;
  id?: string;
  product_id: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
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

// ========== RESOURCE TYPES ==========
export interface Resource {
  created_at: string;
  updated_at: string;
  id: string;
  resource_name: string;
  resource_type: "document" | "link";
  description?: string | null;
  resource_path: string;
  file_type?: string | null;
  file_size?: number | null;
  processing_status:
    | "draft"
    | "pending"
    | "processing"
    | "completed"
    | "failed";
  progress: number;
  current_step: string;
  error_message?: string | null;
  processing_type?:
    | "document_structured_llm"
    | "sentence_based"
    | "excel"
    | null;
  effective_from?: string | null;
  effective_to?: string | null;
  status: boolean;
  issuing_unit?: string | null;
  access_scope?: string | null;
  version?: string | null;
  completed_at?: string | null;
  resource_metadata?: any | null;
  user_id: string;
}

export interface ResourcesParams {
  page?: number;
  page_size?: number;
  resource_type?: "document" | "link" | null;
  resource_name_search?: string | null;
  user_id?: string | null;
  processing_status?:
    | "draft"
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | null;
  processing_type?:
    | "document_structured_llm"
    | "sentence_based"
    | "excel"
    | null;
  sort_by?: "created_at" | "updated_at" | "resource_name";
  sort_order?: "asc" | "desc";
}

export interface ResourcesResponse {
  message: string;
  info: {
    resources: Resource[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface ResourceDetailResponse {
  message: string;
  info: {
    resource: Resource;
    success: boolean;
    message: string;
  };
}

export interface UploadedResourceFile {
  success: boolean;
  resource_id: string;
  file_name: string;
  resource_name: string;
  resource_path: string;
  file_size: number;
  status: string;
}

export interface BatchUploadResponse {
  message: string;
  info: {
    message: string;
    resources: UploadedResourceFile[];
    successful_count: number;
    failed_count: number;
    total_count: number;
  };
}

export interface BatchProcessRequest {
  resource_ids: string[];
  processing_type: "document_structured_llm" | "sentence_based" | "excel";
  effective_from?: string | null;
  effective_to?: string | null;
}

export interface BatchProcessResponse {
  message: string;
  info: {
    message: string;
    resource_ids: string[];
    processing_status: string;
    total_count: number;
  };
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
  id: string;
  product_variant_id: string;
  quantity: number;
  user_id: string;
  product?: Product;
  variant?: ProductVariant;
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

export enum PaymentMethod {
  COD = "cod",
  VNPAY = "vnpay",
}

// ========== PAYMENT TYPES ==========
export interface CreatePaymentRequest {
  order_id: string;
  payment_method: "cod" | "vnpay";
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  payment_id: string;
  payment_url?: string;
  amount: number;
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

// ========== ADDRESS TYPES ==========
export interface Address {
  id: string;
  user_id: string;
  address_label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}
