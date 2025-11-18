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
  searchInput?: string;
  searchTerm?: string;
  onSearchInputChange?: (value: string) => void;
  onSearchSubmit?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  theme,
  onThemeToggle,
  searchInput,
  searchTerm,
  onSearchInputChange,
  onSearchSubmit,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { totalCount } = useCartStore();

  // Auth modal state
  const [authModal, setAuthModal] = useState<"hidden" | "login" | "register">(
    "hidden"
  );

  // Placeholder for wishlist - sẽ có wishlist store sau
  const wishlist: string[] = [];

  const cartItemCount = totalCount;

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
    <div
      className="h-screen w-screen flex flex-col font-sans"
      style={{
        fontFamily: "Inter, sans-serif",
        color: "#333333",
      }}
    >
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
        searchInput={searchInput}
        onSearchInputChange={onSearchInputChange}
        onSearchSubmit={onSearchSubmit}
      />

      <main className="flex-grow flex overflow-hidden w-full">
        {/* Chatbot - takes 3/10 of screen when normal, full screen when expanded */}
        <Chatbot
          messages={[]}
          onSendMessage={(msg) => console.log("Send:", msg)}
          isBotTyping={false}
          onProductClick={(product) => console.log("Product:", product)}
          activeAgent={"system" as any}
        />

        {/* Main content area - takes 7/10 of screen */}
        <div
          className="flex-grow h-full overflow-y-auto"
          style={{ backgroundColor: "#F4F6F8", width: "100%" }}
        >
          <Outlet context={{ searchTerm }} />
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
