import { apiClient } from '@/lib/api-client';
import type { Product, ProductVariant } from '@/types';

export interface CartItem {
  cart_item_id: string;
  id?: string;
  user_id: string;
  product_variant_id: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product_variant_id: string;
  quantity: number;
}

export interface UpdateCartRequest {
  quantity: number;
}

export const cartApi = {
  async getCartItems(): Promise<CartItem[]> {
    return apiClient.get<CartItem[]>('/cart-items');
  },

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    return apiClient.post<CartItem>('/cart-items', data);
  },

  async updateCartItem(cartItemId: string, data: UpdateCartRequest): Promise<CartItem> {
    return apiClient.put<CartItem>(`/cart-items/${cartItemId}`, data);
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    return apiClient.delete<void>(`/cart-items/${cartItemId}`);
  },
};
