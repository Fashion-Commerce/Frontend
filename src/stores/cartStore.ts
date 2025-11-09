import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { cartApi, type CartItem } from "../api/cart.api";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productVariantId: string, quantity: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearError: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const items = await cartApi.getCartItems();
          set({ items, isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch cart",
            isLoading: false,
          });
        }
      },

      addToCart: async (productVariantId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          await cartApi.addToCart({
            product_variant_id: productVariantId,
            quantity,
          });

          // Refresh cart
          await get().fetchCart();

          return true;
        } catch (error: any) {
          set({
            error: error.message || "Failed to add to cart",
            isLoading: false,
          });
          return false;
        }
      },

      updateQuantity: async (cartItemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          if (quantity <= 0) {
            return await get().removeItem(cartItemId);
          }

          await cartApi.updateCartItem(cartItemId, { quantity });

          // Refresh cart
          await get().fetchCart();

          return true;
        } catch (error: any) {
          set({
            error: error.message || "Failed to update quantity",
            isLoading: false,
          });
          return false;
        }
      },

      removeItem: async (cartItemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await cartApi.removeFromCart(cartItemId);

          // Refresh cart
          await get().fetchCart();

          return true;
        } catch (error: any) {
          set({
            error: error.message || "Failed to remove item",
            isLoading: false,
          });
          return false;
        }
      },

      clearCart: () => {
        set({ items: [], error: null });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.variant?.price || item.product?.price || 0;
          return total + price * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "CartStore" },
  ),
);
