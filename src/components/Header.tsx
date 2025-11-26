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
      <div className="w-full px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img
            src="/img/logobg.png"
            alt="AgentFashion"
            className="h-8 sm:h-10 md:h-12 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <Text
            className="font-bold"
            fontSize={{ base: "base", sm: "xl", md: "2xl" }}
            style={{ fontFamily: "Montserrat, sans-serif", color: "#C89B6D" }}
          >
            AgentFashion
          </Text>
        </Link>

        {/* Search Bar - Center - Hidden on mobile */}
        {onSearchInputChange && onSearchSubmit && (
          <Box flex="1" maxW="600px" display={{ base: "none", md: "block" }}>
            <Box
              position="relative"
              display="flex"
              alignItems="center"
              w="full"
            >
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
        <Flex align="center" gap={{ base: 2, sm: 3 }} className="flex-shrink-0">
          {currentUser ? (
            <Flex align="center" gap={{ base: 2, sm: 3 }}>
              {currentUser.user_type === "admin" && (
                <Button
                  onClick={onAdminClick}
                  size={{ base: "sm", md: "sm" }}
                  colorPalette="purple"
                  variant="subtle"
                  className="text-white flex items-center gap-1 sm:gap-2"
                >
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">
                    Admin
                  </span>
                  <span className="hidden lg:inline"> Panel</span>
                </Button>
              )}

              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 sm:gap-2 border-white/30 text-white hover:bg-white/10 px-2 sm:px-3"
                  >
                    <UserRound className="w-4 h-4" />
                    <Text
                      display={{ base: "none", md: "inline" }}
                      className="font-medium text-sm"
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
            <Flex gap={{ base: 1, sm: 2 }}>
              <Button
                onClick={() => onAuthClick("login")}
                variant="ghost"
                size="sm"
                className="font-medium text-white hover:bg-white/10"
                px={{ base: 2, sm: 3, md: 4 }}
                fontSize={{ base: "xs", sm: "sm" }}
              >
                <Text display={{ base: "none", sm: "inline" }}>Đăng nhập</Text>
                <Text display={{ base: "inline", sm: "none" }}>Login</Text>
              </Button>
              <Button
                onClick={() => onAuthClick("register")}
                size="sm"
                className="font-semibold text-white hover:opacity-90"
                px={{ base: 2, sm: 3, md: 4 }}
                fontSize={{ base: "xs", sm: "sm" }}
                style={{ backgroundColor: "#C89B6D" }}
              >
                <Text display={{ base: "none", sm: "inline" }}>Đăng ký</Text>
                <Text display={{ base: "inline", sm: "none" }}>Sign up</Text>
              </Button>
            </Flex>
          )}

          <Flex gap={{ base: 2, sm: 3 }}>
            <Box position="relative">
              <Button
                onClick={onCartClick}
                variant="ghost"
                size="sm"
                p={1.5}
                sm={{ p: 2 }}
                className="hover:bg-white/10"
              >
                <ShoppingCart
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: "#C89B6D" }}
                />
              </Button>
              {cartItemCount > 0 && (
                <Circle
                  className="absolute -top-1 -right-1 text-white font-bold"
                  size="4"
                  style={{ backgroundColor: "#C89B6D", fontSize: "10px" }}
                >
                  {cartItemCount}
                </Circle>
              )}
            </Box>
          </Flex>
        </Flex>
      </div>

      {/* Mobile Search Bar - Separate row */}
      {onSearchInputChange && onSearchSubmit && (
        <div className="md:hidden w-full px-3 pb-2">
          <Box className="relative flex items-center">
            <Search
              className="pointer-events-none"
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "#C89B6D",
              }}
            />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearchSubmit();
                }
              }}
              paddingLeft="40px"
              paddingRight="40px"
              size="sm"
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
              size="xs"
              borderRadius="full"
              style={{ backgroundColor: "#C89B6D", color: "white" }}
              _hover={{ backgroundColor: "#B88A5D" }}
              p={1.5}
              minW="auto"
            >
              <Search size={14} />
            </Button>
          </Box>
        </div>
      )}
    </header>
  );
};

// FIX: Added missing default export.
export default Header;
