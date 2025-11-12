import React from "react";
import type { User } from "@/types";
import {
  Heart,
  ShoppingCart,
  UserRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button, Badge, Flex, Box, Text, Portal, Menu, Circle } from "@chakra-ui/react";

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
}) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20 border-b border-gray-200 dark:border-slate-700 p-3">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            AgentFashion
          </h1>
          <p className="ml-3 text-xs text-gray-500 dark:text-gray-400 hidden md:block">
            Multi-Agent Commerce with RAG
          </p>
        </div>

        <Flex align="center" gap={3}>
          {currentUser ? (
            <Flex align="center" gap={3}>
              {currentUser.user_type === "admin" && (
                <Button
                  onClick={onAdminClick}
                  size="sm"
                  colorPalette="purple"
                  variant="subtle"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}

              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
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
                className="font-medium px-4 hover:bg-gray-100"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => onAuthClick("register")}
                colorPalette="blue"
                size="sm"
                className="font-semibold px-4"
              >
                Đăng ký
              </Button>
            </Flex>
          )}

          <Flex gap={3}>
            <Box position="relative">
              <Button onClick={onWishlistClick} variant="ghost" size="sm" p={2}>
                <Heart className="w-5 h-5 text-pink-500" />
              </Button>
              {wishlistItemCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorPalette="red"
                  variant="solid"
                  fontSize="xs"
                >
                  {wishlistItemCount}
                </Badge>
              )}
            </Box>

            <Box position="relative">
              <Button onClick={onCartClick} variant="ghost" size="sm" p={2}>
                <ShoppingCart className="w-5 h-5 text-green-500" />
              </Button>
              {cartItemCount > 0 && (
                <Circle
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs"
                  size="5"
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
