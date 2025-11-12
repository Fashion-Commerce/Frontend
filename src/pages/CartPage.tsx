import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    totalAmount,
    totalCount,
    isLoading,
    fetchCart,
    updateQuantity,
    removeItem,
  } = useCartStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = async (cartItemId: string, delta: number) => {
    const item = items.find((i) => i.cart_item_id === cartItemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    await updateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      await removeItem(cartItemId);
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout logic
    alert("Chức năng thanh toán đang được phát triển");
  };

  if (!user) {
    return (
      <Box className="container mx-auto px-6 py-12">
        <VStack gap={6}>
          <ShoppingBag className="w-24 h-24 text-gray-300" />
          <Heading size="lg" color="gray.700">
            Vui lòng đăng nhập
          </Heading>
          <Text color="gray.600">
            Bạn cần đăng nhập để xem giỏ hàng của mình
          </Text>
          <Button onClick={() => navigate("/")} colorPalette="blue" size="lg">
            Về trang chủ
          </Button>
        </VStack>
      </Box>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <Box className="container mx-auto px-6 py-12">
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box className="container mx-auto px-6 py-12">
        <VStack gap={6}>
          <ShoppingBag className="w-24 h-24 text-gray-300" />
          <Heading size="lg" color="gray.700">
            Giỏ hàng trống
          </Heading>
          <Text color="gray.600">Bạn chưa có sản phẩm nào trong giỏ hàng</Text>
          <Button onClick={() => navigate("/")} colorPalette="blue" size="lg">
            Tiếp tục mua sắm
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="container mx-auto px-6 py-8">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <Button onClick={() => navigate("/")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tiếp tục mua sắm
          </Button>
        </HStack>
        <Heading size="xl" color="gray.800">
          Giỏ hàng của bạn
        </Heading>
        <Badge colorPalette="blue" size="lg" px={3} py={1}>
          {totalCount} sản phẩm
        </Badge>
      </Flex>

      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        {/* Cart Items */}
        <Box flex="1">
          <VStack gap={4} align="stretch">
            {items.map((item) => {
              return (
                <Box
                  key={item.cart_item_id}
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  boxShadow="sm"
                >
                  <Flex gap={4}>
                    {/* Image Placeholder */}
                    <Box
                      w="120px"
                      h="120px"
                      flexShrink={0}
                      borderRadius="md"
                      overflow="hidden"
                      bg="gray.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        textAlign="center"
                        px={2}
                      >
                        {item.product_name}
                      </Text>
                    </Box>

                    {/* Info */}
                    <Flex flex="1" direction="column" justify="space-between">
                      <Box>
                        <Heading size="sm" color="gray.800" mb={1}>
                          {item.product_name}
                        </Heading>
                        <HStack gap={2} mb={1}>
                          {item.variant_color && (
                            <Badge colorPalette="gray" size="sm">
                              Màu: {item.variant_color}
                            </Badge>
                          )}
                          {item.variant_size && (
                            <Badge colorPalette="gray" size="sm">
                              Size: {item.variant_size}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.600" mb={2}>
                          {item.brand_name} • {item.category_name}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="red.600">
                          {formatPrice(item.product_price)}
                        </Text>
                      </Box>

                      <Flex justify="space-between" align="center">
                        {/* Quantity Controls */}
                        <Flex
                          align="center"
                          gap={2}
                          borderWidth="1px"
                          borderColor="gray.300"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Button
                            onClick={() =>
                              handleQuantityChange(item.cart_item_id, -1)
                            }
                            size="sm"
                            variant="ghost"
                            disabled={item.quantity <= 1 || isLoading}
                            p={2}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Text
                            minW="40px"
                            textAlign="center"
                            fontWeight="medium"
                          >
                            {item.quantity}
                          </Text>
                          <Button
                            onClick={() =>
                              handleQuantityChange(item.cart_item_id, 1)
                            }
                            size="sm"
                            variant="ghost"
                            disabled={isLoading}
                            p={2}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </Flex>

                        {/* Subtotal & Remove */}
                        <Flex align="center" gap={4}>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            {formatPrice(item.product_price * item.quantity)}
                          </Text>
                          <Button
                            onClick={() => handleRemoveItem(item.cart_item_id)}
                            variant="ghost"
                            colorPalette="red"
                            size="sm"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* Order Summary */}
        <Box
          w={{ base: "full", lg: "400px" }}
          position={{ base: "static", lg: "sticky" }}
          top="100px"
          alignSelf="flex-start"
        >
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="md"
          >
            <Heading size="md" mb={4} color="gray.800">
              Tổng đơn hàng
            </Heading>

            <VStack gap={3} align="stretch" mb={4}>
              <Flex justify="space-between">
                <Text color="gray.600">Tạm tính</Text>
                <Text fontWeight="medium">{formatPrice(totalAmount)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.600">Phí vận chuyển</Text>
                <Text fontWeight="medium" color="green.600">
                  Miễn phí
                </Text>
              </Flex>
            </VStack>

            <Box pt={3} borderTopWidth="1px" borderColor="gray.200" mb={4}>
              <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  Tổng cộng
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  {formatPrice(totalAmount)}
                </Text>
              </Flex>
            </Box>

            <Button
              onClick={handleCheckout}
              w="full"
              size="lg"
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              disabled={isLoading}
            >
              Tiến hành thanh toán
            </Button>

            <Text fontSize="xs" color="gray.500" textAlign="center" mt={3}>
              Bằng việc tiến hành thanh toán, bạn đồng ý với{" "}
              <Text as="span" color="blue.600" cursor="pointer">
                Điều khoản dịch vụ
              </Text>
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default CartPage;
