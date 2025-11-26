import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "@/components/ui/provider";
import { router } from "@/router";
import { useAuthStore } from "@/stores/authStore";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";

const App: React.FC = () => {
  const { initializeAuth, isAuthenticated, user } = useAuthStore();
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
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    initializeApp();
  }, []); // Only run once on mount

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    }
  }, [isAuthenticated, user, fetchCart]);

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
