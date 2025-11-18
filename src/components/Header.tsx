import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@/types";
import {
  Heart,
  ShoppingCart,
  UserRound,
  LogOut,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  Button,
  Badge,
  Flex,
  Box,
  Text,
  Portal,
  Menu,
  Circle,
  Input,
} from "@chakra-ui/react";

interface HeaderProps {
  cartItemCount: number;
  wishlistItemCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onAuthClick: (view: "login" | "register") => void;
  onAdminClick: () => void;
  handleProfileClick: () => void;
  searchInput?: string;
  onSearchInputChange?: (value: string) => void;
  onSearchSubmit?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  wishlistItemCount,
  onCartClick,
  onWishlistClick,
  currentUser,
  onLogout,
  onAuthClick,
  onAdminClick,
  handleProfileClick,
  searchInput = "",
  onSearchInputChange,
  onSearchSubmit,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        backgroundColor: "#1A2A4E",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "3px solid",
        borderImage: "linear-gradient(to right, #C89B6D, #D4A76A, #C89B6D) 1",
      }}
    >
      {/* Top Row: Logo, Search, Actions */}
      <div className="w-full px-6 py-3 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/img/logo.png"
            alt="AgentFashion"
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </Link>

        {/* Search Bar - Center */}
        {onSearchInputChange && onSearchSubmit && (
          <Box className="flex-1" style={{ maxWidth: "600px" }}>
            <Box className="relative flex items-center">
              <Search
                className="pointer-events-none"
                size={18}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  color: "#C89B6D",
                }}
              />
              <Input
                placeholder="Search for products..."
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearchSubmit();
                  }
                }}
                paddingLeft="48px"
                paddingRight="48px"
                size="md"
                style={{
                  borderColor: "#E9ECEF",
                  backgroundColor: "white",
                  fontFamily: "Inter, sans-serif",
                }}
                _focus={{
                  borderColor: "#C89B6D",
                  boxShadow: "0 0 0 1px #C89B6D",
                }}
                borderRadius="full"
              />
              <Button
                onClick={onSearchSubmit}
                position="absolute"
                right="4px"
                size="sm"
                borderRadius="full"
                style={{ backgroundColor: "#C89B6D", color: "white" }}
                _hover={{ backgroundColor: "#B88A5D" }}
                p={2}
                minW="auto"
              >
                <Search size={16} />
              </Button>
            </Box>
          </Box>
        )}

        {/* Right Actions */}
        <Flex align="center" gap={3} className="flex-shrink-0">
          {currentUser ? (
            <Flex align="center" gap={3}>
              {currentUser.user_type === "admin" && (
                <Button
                  onClick={onAdminClick}
                  size="sm"
                  colorPalette="purple"
                  variant="subtle"
                  className="text-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}

              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-white/30 text-white hover:bg-white/10"
                  >
                    <UserRound className="w-4 h-4" />
                    <Text
                      display={{ base: "none", sm: "inline" }}
                      className="font-medium"
                    >
                      {currentUser.fullname}
                    </Text>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content className="min-w-[200px] rounded-md shadow-lg">
                      <Menu.Item
                        value="profile"
                        onClick={handleProfileClick}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <UserRound className="w-4 h-4" />
                        <Text className="text-sm">Hồ sơ của tôi</Text>
                      </Menu.Item>
                      <Menu.Item
                        value="orders"
                        onClick={() => navigate("/orders")}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <Text className="text-sm">Đơn hàng của tôi</Text>
                      </Menu.Item>
                      <Menu.Item
                        value="logout"
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <Text className="text-sm font-medium">Đăng xuất</Text>
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Flex>
          ) : (
            <Flex gap={2}>
              <Button
                onClick={() => onAuthClick("login")}
                variant="ghost"
                size="sm"
                className="font-medium px-4 text-white hover:bg-white/10"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => onAuthClick("register")}
                size="sm"
                className="font-semibold px-4 text-white hover:opacity-90"
                style={{ backgroundColor: "#C89B6D" }}
              >
                Đăng ký
              </Button>
            </Flex>
          )}

          <Flex gap={3}>
            <Box position="relative">
              <Button
                onClick={onCartClick}
                variant="ghost"
                size="sm"
                p={2}
                className="hover:bg-white/10"
              >
                <ShoppingCart
                  className="w-5 h-5"
                  style={{ color: "#C89B6D" }}
                />
              </Button>
              {cartItemCount > 0 && (
                <Circle
                  className="absolute -top-1 -right-1 text-white text-xs font-bold"
                  size="4"
                  style={{ backgroundColor: "#C89B6D" }}
                >
                  {cartItemCount}
                </Circle>
              )}
            </Box>
          </Flex>
        </Flex>
      </div>
    </header>
  );
};

// FIX: Added missing default export.
export default Header;
