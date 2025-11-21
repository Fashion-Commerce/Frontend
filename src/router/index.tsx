import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/HomePage";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import OrdersPage from "@/pages/OrdersPage";
import AdminPage from "@/pages/AdminPage";
import ProfilePage from "@/pages/ProfilePage";
import PaymentResultPage from "@/pages/PaymentResultPage";
import ArtifactProductsPage from "@/pages/ArtifactProductsPage";
import { useAuthStore } from "@/stores/authStore";

// Protected Route Component for Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuthStore();

  // Check if user is admin
  const isAdmin =
    user?.email === "admin@agentfashion.com" || user?.user_type === "admin";

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Theme wrapper để truyền theme props vào MainLayout
let themeState = "dark" as "light" | "dark";
let setThemeState: (theme: "light" | "dark") => void;

export const setThemeHandlers = (
  theme: "light" | "dark",
  setTheme: (theme: "light" | "dark") => void
) => {
  themeState = theme;
  setThemeState = setTheme;
};

const MainLayoutWrapper: React.FC = () => {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [searchInput, setSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("agentfashion_theme") as
      | "light"
      | "dark"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const otherTheme = theme === "light" ? "dark" : "light";
    root.classList.remove(otherTheme);
    root.classList.add(theme);
    localStorage.setItem("agentfashion_theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
  };

  return (
    <MainLayout
      theme={theme}
      onThemeToggle={handleThemeToggle}
      searchInput={searchInput}
      searchTerm={searchTerm}
      onSearchInputChange={handleSearchInputChange}
      onSearchSubmit={handleSearchSubmit}
    />
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayoutWrapper />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "wishlist",
        element: <WishlistPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "payment-result",
        element: <PaymentResultPage />,
      },
      {
        path: "artifact/:artifactId",
        element: <ArtifactProductsPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      // <ProtectedAdminRoute>
      <AdminLayout />
      // </ProtectedAdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
      {
        path: "products",
        element: <AdminPage />,
      },
      {
        path: "chat-logs",
        element: <AdminPage />,
      },
      {
        path: "agents",
        element: <AdminPage />,
      },
      {
        path: "brands",
        element: <AdminPage />,
      },
      {
        path: "categories",
        element: <AdminPage />,
      },
      {
        path: "resources",
        element: <AdminPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
