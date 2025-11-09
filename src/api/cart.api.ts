import http1 from "@/lib/http1";
import type { Product, ProductVariant } from "@/types";

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
    return http1.get<CartItem[]>("/cart-items");
  },

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    return http1.post<CartItem>("/cart-items", data);
  },

  async updateCartItem(
    cartItemId: string,
    data: { quantity: number },
  ): Promise<CartItem> {
    return http1.put<CartItem>(`/cart-items/${cartItemId}`, data);
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    return http1.delete<void>(`/cart-items/${cartItemId}`);
  },
};
