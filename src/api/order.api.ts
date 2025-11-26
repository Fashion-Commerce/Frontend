import { http2 } from "@/lib/http2";
import type { ProductVariant } from "@/types";

export interface OrderItemDetail {
  id: string;
  product_variant_id: string;
  product_name: string;
  product_id: string;
  variant_sku: string;
  variant_color?: string;
  variant_size?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_image_url?: string;
}

export interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  shipping_fee?: number;
  status: string;
  shipping_address: string;
  shipping_phone: string;
  user_address_id?: string;
  notes?: string;
  order_date: string;
  created_at: string;
  updated_at: string | null;
  items?: OrderItemDetail[];
  items_count?: number;
  payment_status?: string;
  payment_method?: string;
  payment_transaction_id?: string | null;
}

export interface CreateOrderItem {
  product_variant_id: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  user_id: string;
  items: CreateOrderItem[];
  shipping_address: string;
  shipping_phone: string;
  user_address_id: string;
  notes?: string;
  shipping_fee?: number;
}

export interface OrdersParams {
  page?: number;
  page_size?: number;
  user_id_filter?: string;
  status_filter?: string;
  date_from?: string;
  date_to?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  success: boolean;
  message: string;
}

export interface OrderDetailResponse {
  order: Order;
  success: boolean;
  message: string;
}

export interface CreateOrderResponse {
  message: string;
  order_id: string;
  total_amount: number;
  success: boolean;
}

export const orderApi = {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await http2.post<any>("v1/orders", data);
    return response.info;
  },

  async getOrders(params?: OrdersParams): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();

    // Auto add user_id_filter from zustand persist storage (auth-storage)
    const authStorageStr = localStorage.getItem("auth-storage");
    if (authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        const user = authStorage?.state?.user;
        if (user?.user_id) {
          queryParams.set("user_id_filter", user.user_id);
        }
      } catch (e) {
        console.error("Failed to parse auth-storage from localStorage:", e);
      }
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }

    const url = `v1/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await http2.get<any>(url);
    return response.info;
  },

  async getOrderById(orderId: string): Promise<OrderDetailResponse> {
    const response = await http2.get<any>(`v1/orders/${orderId}`);
    return response.info;
  },

  async cancelOrder(
    orderId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await http2.post<any>(`v1/orders/${orderId}/cancel`, {});
    return response.info;
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await http2.patch<any>(`v1/orders/${orderId}/status`, {
      new_status: newStatus,
    });
    return response.info;
  },
};
