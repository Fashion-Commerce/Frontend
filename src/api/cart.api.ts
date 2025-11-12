import http2 from "@/lib/http2";
import type { Product, ProductVariant } from "@/types";

export interface CartItem {
  cart_item_id: string;
  user_id: string;
  product_variant_id: string;
  quantity: number;
  product_name: string;
  product_price: number;
  variant_size: string;
  variant_color: string;
  brand_name: string;
  category_name: string;
  created_at: string;
  updated_at: string | null;
}

export interface CartResponse {
  message: string;
  info: {
    cart_items: CartItem[];
    total_count: number;
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    total_amount: number;
    success: boolean;
    message: string;
  };
}

export interface AddToCartRequest {
  user_id: string;
  product_variant_id: string;
  quantity: number;
}

export interface AddToCartResponse {
  message: string;
  info: {
    message: string;
    cart_item_id: string;
    success: boolean;
  };
}

export interface UpdateCartQuantityRequest {
  quantity: number;
}

export interface UpdateCartQuantityResponse {
  message: string;
  info: {
    message: string;
    success: boolean;
  };
}

export interface RemoveCartItemResponse {
  message: string;
  info: {
    success: boolean;
    message: string;
  };
}

export const cartApi = {
  /**
   * GET /v1/cart/items - Get all cart items
   */
  async getCartItems(): Promise<CartResponse> {
    const response = await http2.get<CartResponse>("/v1/cart/items");
    return response;
  },

  /**
   * POST /v1/cart/items - Add item to cart
   */
  async addToCart(data: AddToCartRequest): Promise<AddToCartResponse> {
    const response = await http2.post<AddToCartResponse>(
      "/v1/cart/items",
      data
    );
    return response;
  },

  /**
   * DELETE /v1/cart/items/{cart_item_id} - Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<RemoveCartItemResponse> {
    const response = await http2.delete<RemoveCartItemResponse>(
      `/v1/cart/items/${cartItemId}`
    );
    return response;
  },

  /**
   * PATCH /v1/cart/items/{cart_item_id}/quantity - Update cart item quantity
   */
  async updateCartQuantity(
    cartItemId: string,
    data: UpdateCartQuantityRequest
  ): Promise<UpdateCartQuantityResponse> {
    const response = await http2.patch<UpdateCartQuantityResponse>(
      `/v1/cart/items/${cartItemId}/quantity`,
      data
    );
    return response;
  },
};
