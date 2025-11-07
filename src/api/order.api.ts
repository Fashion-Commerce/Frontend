import http1 from "@/lib/http1";
import type { ProductVariant } from "@/types";

export interface Order {
  order_id: string;
  id?: string;
  user_id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  delivery_note?: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  order_item_id: string;
  id?: string;
  order_id: string;
  product_variant_id: string;
  product_variant?: ProductVariant;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  delivery_address: string;
  delivery_phone: string;
  delivery_note?: string;
}

export interface OrdersParams {
  page?: number;
  page_size?: number;
  status_filter?: string;
}

export const orderApi = {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return http1.post<Order>("/orders", data);
  },

  async getOrders(params?: OrdersParams): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, value.toString());
        }
      });
    }

    const url = `/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return http1.get<Order[]>(url);
  },

  async getOrderById(orderId: string): Promise<Order> {
    return http1.get<Order>(`/orders/${orderId}`);
  },
};
