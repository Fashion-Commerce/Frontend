import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Chatbot from "@/components/Chatbot";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { MessageCircle, X } from "lucide-react";

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

  // Mobile chatbot dialog state
  const [isMobile, setIsMobile] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Placeholder for wishlist - sẽ có wishlist store sau
  const wishlist: string[] = [];

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cartItemCount = totalCount;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
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
        {/* Desktop Chatbot - hidden on mobile */}
        {!isMobile && <Chatbot isMobile={false} />}

        {/* Main content area */}
        <div
          className="flex-grow h-full overflow-y-auto w-full"
          style={{ backgroundColor: "#F4F6F8" }}
        >
          <Outlet context={{ searchTerm }} />
        </div>
      </main>

      {/* Mobile Chatbot Floating Button */}
      {isMobile && !chatbotOpen && (
        <button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform hover:scale-110 active:scale-95"
          style={{ backgroundColor: "#C89B6D" }}
          aria-label="Mở chatbot"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Mobile Chatbot Dialog */}
      {isMobile && chatbotOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <Chatbot isMobile={true} onClose={() => setChatbotOpen(false)} />
        </div>
      )}

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
