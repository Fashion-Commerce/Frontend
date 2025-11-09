import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Chatbot from "@/components/Chatbot";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

interface MainLayoutProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ theme, onThemeToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { items: cartItems } = useCartStore();

  // Auth modal state
  const [authModal, setAuthModal] = useState<"hidden" | "login" | "register">(
    "hidden",
  );

  // Placeholder for wishlist - sẽ có wishlist store sau
  const wishlist: string[] = [];

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  const handleAuthClick = (view: "login" | "register") => {
    setAuthModal(view);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-900 dark:text-gray-100">
      <Header
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlist.length}
        onCartClick={() => navigate("/cart")}
        onWishlistClick={() => navigate("/wishlist")}
        currentUser={user}
        onLogout={handleLogout}
        onAuthClick={handleAuthClick}
        onAdminClick={handleAdminClick}
        handleProfileClick={handleProfileClick}
      />

      <main className="flex-grow flex overflow-hidden">
        {/* Chatbot - always visible, takes 1/5 of screen */}
        <Chatbot
          messages={[]}
          onSendMessage={(msg) => console.log("Send:", msg)}
          isBotTyping={false}
          onProductClick={(product) => console.log("Product:", product)}
          activeAgent={"system" as any}
        />

        {/* Main content area - takes 4/5 of screen */}
        <div className="flex-grow h-full overflow-y-auto bg-gray-100 dark:bg-slate-900">
          <Outlet />
        </div>
      </main>

      {/* Auth Modal */}
      {authModal !== "hidden" && (
        <AuthModal
          initialView={authModal}
          onClose={() => setAuthModal("hidden")}
        />
      )}
    </div>
  );
};

export default MainLayout;
