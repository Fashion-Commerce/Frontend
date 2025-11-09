import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "@/components/ui/provider";
import { router } from "@/router";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";

/**
 * App Component - Refactored với React Router
 *
 * Thay đổi chính:
 * - Loại bỏ tất cả local state, chuyển sang Zustand stores
 * - Sử dụng React Router thay vì conditional rendering
 * - Layouts và Pages được tách riêng
 * - Chuẩn bị sẵn cho tích hợp API backend thật
 *
 * TODO khi backend sẵn sàng:
 * - Loại bỏ dummy data từ stores
 * - Kết nối API calls trong useEffect của pages
 * - Thêm error handling và loading states
 * - Implement wishlist store
 * - Implement chat store với real AI
 */

const App: React.FC = () => {
  const { initializeAuth, isAuthenticated } = useAuthStore();
  const { fetchProducts, fetchCategories, fetchBrands } = useProductStore();
  const { fetchCart } = useCartStore();

  // Initialize app - load auth state and fetch initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth from localStorage
        initializeAuth();

        // Fetch initial store data
        await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);

        // If logged in, fetch cart
        if (isAuthenticated) {
          await fetchCart();
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, []); // Only run once on mount

  return (
    <Provider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Provider>
  );
};

export default App;
