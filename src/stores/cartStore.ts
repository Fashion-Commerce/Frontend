import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { cartApi, type CartItem } from "../api/cart.api";

interface CartState {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  fetchCart: (
    page?: number,
    sortBy?: "created_at" | "updated_at" | "quantity",
    sortOrder?: "asc" | "desc"
  ) => Promise<void>;
  addToCart: (
    userId: string,
    productVariantId: string,
    quantity: number
  ) => Promise<boolean>;
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
      totalCount: 0,
      totalAmount: 0,
      currentPage: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      isLoading: false,
      error: null,
      successMessage: null,

      fetchCart: async (
        page = 1,
        sortBy?: "created_at" | "updated_at" | "quantity",
        sortOrder?: "asc" | "desc"
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartApi.getCartItems({
            page,
            page_size: 10,
            sort_by: sortBy,
            sort_order: sortOrder,
          });
          set({
            items: response.info.cart_items,
            totalCount: response.info.total_count,
            totalAmount: response.info.total_amount,
            currentPage: response.info.current_page,
            totalPages: response.info.total_pages,
            hasNext: response.info.has_next,
            hasPrevious: response.info.has_previous,
            successMessage: response.info.message,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Không thể tải giỏ hàng",
            isLoading: false,
          });
          console.error("Fetch cart error:", error);
        }
      },

      addToCart: async (
        userId: string,
        productVariantId: string,
        quantity: number
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartApi.addToCart({
            user_id: userId,
            product_variant_id: productVariantId,
            quantity,
          });

          if (response.info.success) {
            // Refresh cart
            await get().fetchCart();
            toast.success("Đã thêm vào giỏ hàng!");
            return true;
          }

          throw new Error(
            response.info.message || "Thêm vào giỏ hàng thất bại"
          );
        } catch (error: any) {
          const errorMessage = error.message || "Không thể thêm vào giỏ hàng";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },

      updateQuantity: async (cartItemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          if (quantity <= 0) {
            return await get().removeItem(cartItemId);
          }

          const response = await cartApi.updateCartQuantity(cartItemId, {
            quantity,
          });

          if (response.info.success) {
            // Refresh cart
            await get().fetchCart();
            toast.success("Đã cập nhật số lượng!");
            return true;
          }

          throw new Error(response.info.message || "Cập nhật thất bại");
        } catch (error: any) {
          const errorMessage = error.message || "Không thể cập nhật số lượng";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },

      removeItem: async (cartItemId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartApi.removeFromCart(cartItemId);

          if (response.info.success) {
            // Refresh cart
            await get().fetchCart();
            toast.success("Đã xóa khỏi giỏ hàng!");
            return true;
          }

          throw new Error(response.info.message || "Xóa thất bại");
        } catch (error: any) {
          const errorMessage = error.message || "Không thể xóa sản phẩm";
          set({
            error: errorMessage,
            isLoading: false,
          });
          toast.error(errorMessage);
          return false;
        }
      },

      clearCart: () => {
        set({
          items: [],
          totalCount: 0,
          totalAmount: 0,
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          error: null,
          successMessage: null,
        });
      },

      getTotalPrice: () => {
        const { totalAmount } = get();
        return totalAmount;
      },

      getTotalItems: () => {
        const { totalCount } = get();
        return totalCount;
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "CartStore" }
  )
);
