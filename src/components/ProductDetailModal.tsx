import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Image,
  AspectRatio,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, X, Heart } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { StarIcon } from "@/components/icons";
import ProductCard from "@/components/ProductCard";
import { productApi } from "@/api/product.api";

interface ProductDetailModalProps {
  product: Product;
  relatedProducts: Product[];
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  wishlist: string[];
}

const ProductRating: React.FC<{
  rating: number;
  reviewCount: number;
  big?: boolean;
}> = ({ rating, reviewCount, big }) => (
  <HStack className="items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`${big ? "w-5 h-5" : "w-4 h-4"} text-yellow-400`}
        isFilled={i < Math.round(rating)}
      />
    ))}
    <Text className={`${big ? "text-base" : "text-xs"} text-gray-600 ml-2`}>
      {rating.toFixed(1)} ({reviewCount} đánh giá)
    </Text>
  </HStack>
);

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  isWishlisted,
  wishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [pendingQuantity, setPendingQuantity] = useState<number | string>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);

  const productId = product.id || product.product_id || "";
  const images = product.imageUrls || product.image_urls || [];
  const imageUrl = images[currentImageIndex] || images[0] || "";
  const brandName = product.brand?.name || product.brand_name || "";
  const avgRating = product.averageRating || product.average_rating || 0;
  const reviewCnt = product.reviewCount || product.review_count || 0;

  // Fetch variants from API
  useEffect(() => {
    const fetchVariants = async () => {
      if (!productId) return;
      setIsLoadingVariants(true);
      try {
        const response = await productApi.getProductVariants({
          product_id_filter: productId,
          page_size: 100,
        });
        setVariants(response.info.variants || []);
      } catch (error) {
        console.error("Failed to fetch variants:", error);
        setVariants([]);
      } finally {
        setIsLoadingVariants(false);
      }
    };
    fetchVariants();
  }, [productId]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Auto-select first available color and size
  useEffect(() => {
    if (variants.length > 0 && !selectedColor) {
      const firstVariant = variants[0];
      setSelectedColor(firstVariant.color || null);
      setSelectedSize(firstVariant.size || null);
    }
  }, [variants, selectedColor]);

  const availableColors = useMemo(() => {
    return [
      ...new Set(variants.map((v) => v.color).filter(Boolean)),
    ] as string[];
  }, [variants]);

  const availableSizes = useMemo(() => {
    return [
      ...new Set(
        variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
          .filter(Boolean)
      ),
    ] as string[];
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    return (
      variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || null
    );
  }, [selectedColor, selectedSize, variants]);

  // Reset selections when product changes
  useEffect(() => {
    setQuantity(1);
    setPendingQuantity(1);
    setCurrentImageIndex(0);
  }, [product]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCartClick = () => {
    if (selectedVariant) {
      onAddToCart(product, selectedVariant, quantity);
      onClose();
    } else {
      alert("Vui lòng chọn màu sắc và kích thước");
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.base_price || product.price || 0;

  return (
    <Box
      position="fixed"
      inset="0"
      bg="blackAlpha.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="40"
      p={4}
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="xl"
        w="full"
        maxW="5xl"
        maxH="85vh"
        position="relative"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "2px solid #E9ECEF",
          boxShadow: "0 4px 6px rgba(26, 42, 78, 0.1)",
        }}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          position="absolute"
          top={3}
          right={3}
          zIndex={10}
          bg="white"
          borderRadius="full"
          p={1.5}
          minW="auto"
          h="auto"
          aria-label="Đóng"
          style={{ border: "1px solid #E9ECEF", color: "#1A2A4E" }}
          _hover={{ bg: "#C89B6D", color: "white" }}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <Box flex="1" overflowY="auto" p={6}>
          <Flex gap={6}>
            {/* Left: Images - Thu nhỏ xuống 1/3 */}
            <Box w="280px" flexShrink={0}>
              <VStack spacing={3} position="sticky" top={0}>
                {/* Main Image - Compact */}
                <Box
                  position="relative"
                  w="full"
                  bg="#F4F6F8"
                  borderRadius="lg"
                  overflow="hidden"
                  style={{ border: "1px solid #E9ECEF" }}
                >
                  <AspectRatio ratio={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      p={6}
                    >
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        objectFit="contain"
                        maxW="full"
                        maxH="full"
                      />
                    </Box>
                  </AspectRatio>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <Button
                        onClick={prevImage}
                        position="absolute"
                        left={2}
                        top="50%"
                        transform="translateY(-50%)"
                        p={1.5}
                        minW="auto"
                        h="auto"
                        borderRadius="full"
                        aria-label="Ảnh trước"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #E9ECEF",
                          color: "#1A2A4E",
                        }}
                        _hover={{ bg: "#C89B6D", color: "white" }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={nextImage}
                        position="absolute"
                        right={2}
                        top="50%"
                        transform="translateY(-50%)"
                        p={1.5}
                        minW="auto"
                        h="auto"
                        borderRadius="full"
                        aria-label="Ảnh sau"
                        style={{
                          backgroundColor: "white",
                          border: "1px solid #E9ECEF",
                          color: "#1A2A4E",
                        }}
                        _hover={{ bg: "#C89B6D", color: "white" }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </Box>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <Flex gap={2} w="full" overflowX="auto" pb={1}>
                    {images.map((img, index) => (
                      <Button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        flexShrink={0}
                        w="60px"
                        h="60px"
                        p={0}
                        minW="auto"
                        borderRadius="md"
                        overflow="hidden"
                        borderWidth="2px"
                        borderColor={
                          index === currentImageIndex ? "blue.500" : "gray.200"
                        }
                        _hover={{
                          borderColor:
                            index === currentImageIndex
                              ? "blue.500"
                              : "gray.400",
                        }}
                        transition="all 0.2s"
                      >
                        <Image
                          src={img}
                          alt={`${product.name} - ${index + 1}`}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      </Button>
                    ))}
                  </Flex>
                )}
              </VStack>
            </Box>

            {/* Middle: Product Info */}
            <Box flex="1" minW={0}>
              <VStack gap={4} align="stretch">
                {/* Brand */}
                {brandName && (
                  <Badge
                    bg="blue.50"
                    color="blue.600"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="medium"
                    w="fit-content"
                  >
                    {brandName}
                  </Badge>
                )}

                {/* Product Name */}
                <Heading
                  size="md"
                  lineHeight="shorter"
                  style={{
                    color: "#1A2A4E",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  {product.name}
                </Heading>

                {/* Rating */}
                {reviewCnt > 0 && (
                  <Box>
                    <ProductRating rating={avgRating} reviewCount={reviewCnt} />
                  </Box>
                )}

                {/* Price */}
                <Box
                  px={4}
                  py={3}
                  borderRadius="lg"
                  style={{
                    backgroundColor: "#FFF8F0",
                    border: "1px solid #C89B6D",
                  }}
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    style={{
                      color: "#C89B6D",
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    {formatPrice(displayPrice)}
                  </Text>
                  {selectedVariant &&
                    selectedVariant.stock_quantity !== undefined && (
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Còn {selectedVariant.stock_quantity} sản phẩm
                      </Text>
                    )}
                </Box>

                {/* Loading */}
                {isLoadingVariants && (
                  <Flex justify="center" py={2}>
                    <Spinner size="md" color="blue.500" />
                  </Flex>
                )}

                {/* Color Selection */}
                {!isLoadingVariants && availableColors.length > 0 && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={2}
                    >
                      Màu sắc
                    </Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {availableColors.map((color) => (
                        <Button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setSelectedSize(null);
                          }}
                          size="sm"
                          px={3}
                          py={2}
                          minW="auto"
                          h="auto"
                          borderWidth="1px"
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight={
                            selectedColor === color ? "medium" : "normal"
                          }
                          bg={selectedColor === color ? "#C89B6D" : "white"}
                          style={{
                            borderColor:
                              selectedColor === color ? "#C89B6D" : "#E9ECEF",
                            color:
                              selectedColor === color ? "white" : "#333333",
                          }}
                          _hover={{
                            borderColor: "#C89B6D",
                            bg: selectedColor === color ? "#B88A5D" : "#FFF8F0",
                          }}
                        >
                          {color}
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Size Selection */}
                {!isLoadingVariants && availableSizes.length > 0 && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={2}
                    >
                      Kích thước
                    </Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {availableSizes.map((size) => (
                        <Button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          size="sm"
                          px={4}
                          py={2}
                          minW="50px"
                          h="auto"
                          borderWidth="1px"
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="medium"
                          borderColor={
                            selectedSize === size ? "blue.500" : "gray.300"
                          }
                          bg={selectedSize === size ? "blue.50" : "white"}
                          color={
                            selectedSize === size ? "blue.600" : "gray.700"
                          }
                          _hover={{
                            borderColor:
                              selectedSize === size ? "blue.500" : "gray.400",
                          }}
                        >
                          {size}
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Description */}
                {product.description && (
                  <Box pt={3} borderTopWidth="1px" borderColor="gray.200">
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.800"
                      mb={2}
                    >
                      Mô tả sản phẩm
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      lineHeight="tall"
                      noOfLines={3}
                    >
                      {product.description}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Right: Actions Sidebar */}
            <Box w="240px" flexShrink={0}>
              <Box
                bg="#F4F6F8"
                p={4}
                borderRadius="lg"
                position="sticky"
                top={0}
                style={{ border: "1px solid #E9ECEF" }}
              >
                <VStack spacing={4} align="stretch">
                  {/* Quantity */}
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={2}
                    >
                      Số lượng
                    </Text>
                    <Flex
                      borderWidth="1px"
                      borderColor="gray.300"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Button
                        onClick={() => {
                          const newQty = Math.max(1, quantity - 1);
                          setQuantity(newQty);
                          setPendingQuantity(newQty);
                        }}
                        flex={1}
                        borderRadius={0}
                        fontSize="sm"
                        h="36px"
                        _hover={{ bg: "gray.100" }}
                      >
                        -
                      </Button>
                      <input
                        type="number"
                        min={1}
                        max={selectedVariant?.stock_quantity || 9999}
                        value={pendingQuantity}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty string for better UX
                          if (inputValue === "") {
                            setPendingQuantity("");
                            return;
                          }
                          const value = parseInt(inputValue, 10);
                          if (!isNaN(value) && value >= 0) {
                            setPendingQuantity(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = parseInt(e.currentTarget.value);
                            const maxStock =
                              selectedVariant?.stock_quantity || 9999;
                            if (!isNaN(value) && value >= 1) {
                              const finalQty = Math.min(value, maxStock);
                              setQuantity(finalQty);
                              setPendingQuantity(finalQty);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          const maxStock =
                            selectedVariant?.stock_quantity || 9999;
                          if (isNaN(value) || value < 1) {
                            // Reset to current quantity if invalid
                            setPendingQuantity(quantity);
                          } else {
                            const finalQty = Math.min(value, maxStock);
                            setQuantity(finalQty);
                            setPendingQuantity(finalQty);
                          }
                        }}
                        disabled={isLoadingVariants}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          borderLeft: "1px solid #D1D5DB",
                          borderRight: "1px solid #D1D5DB",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          outline: "none",
                        }}
                      />
                      <Button
                        onClick={() => {
                          const maxStock =
                            selectedVariant?.stock_quantity || 9999;
                          const newQty = Math.min(quantity + 1, maxStock);
                          setQuantity(newQty);
                          setPendingQuantity(newQty);
                        }}
                        disabled={
                          quantity >= (selectedVariant?.stock_quantity || 9999)
                        }
                        flex={1}
                        borderRadius={0}
                        fontSize="sm"
                        h="36px"
                        _hover={{ bg: "gray.100" }}
                        _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                      >
                        +
                      </Button>
                    </Flex>
                    {selectedVariant &&
                      selectedVariant.stock_quantity &&
                      quantity >= selectedVariant.stock_quantity && (
                        <Text fontSize="xs" color="orange.500" mt={1}>
                          Đã đạt tối đa số lượng trong kho
                        </Text>
                      )}
                  </Box>

                  {/* Subtotal */}
                  <Box pt={3} borderTopWidth="1px" borderColor="gray.200">
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="xs" color="gray.600">
                        Tạm tính
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.600">
                        {formatPrice(displayPrice * quantity)}
                      </Text>
                    </Flex>
                  </Box>

                  {/* Action Buttons */}
                  <VStack spacing={2} pt={2}>
                    <Button
                      onClick={handleAddToCartClick}
                      isDisabled={!selectedVariant || isLoadingVariants}
                      w="full"
                      bg="#C89B6D"
                      color="white"
                      size="md"
                      fontSize="sm"
                      fontWeight="medium"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                      _hover={{ bg: "#B88A5D" }}
                      _disabled={{ bg: "gray.400", cursor: "not-allowed" }}
                    >
                      Mua ngay
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedVariant) {
                          onAddToCart(product, selectedVariant, quantity);
                        } else {
                          alert("Vui lòng chọn màu sắc và kích thước");
                        }
                      }}
                      isDisabled={!selectedVariant || isLoadingVariants}
                      w="full"
                      bg="white"
                      size="md"
                      fontSize="sm"
                      fontWeight="medium"
                      borderWidth="1px"
                      style={{
                        borderColor: "#1A2A4E",
                        color: "#1A2A4E",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                      _hover={{ bg: "#1A2A4E", color: "white" }}
                      _disabled={{
                        bg: "gray.200",
                        borderColor: "gray.300",
                        color: "gray.400",
                        cursor: "not-allowed",
                      }}
                    >
                      Thêm giỏ hàng
                    </Button>
                    <Button
                      onClick={() => onToggleWishlist(productId)}
                      w="full"
                      size="md"
                      fontSize="sm"
                      fontWeight="medium"
                      borderWidth="1px"
                      bg={isWishlisted ? "#FFF8F0" : "white"}
                      style={{
                        borderColor: isWishlisted ? "#C89B6D" : "#E9ECEF",
                        color: isWishlisted ? "#C89B6D" : "#666666",
                      }}
                      _hover={{
                        borderColor: "red.500",
                        color: "red.500",
                      }}
                    >
                      <Flex align="center" justify="center" gap={1.5}>
                        <Heart
                          className={`w-4 h-4 ${
                            isWishlisted ? "fill-current" : ""
                          }`}
                        />
                        <Text>Yêu thích</Text>
                      </Flex>
                    </Button>
                  </VStack>
                </VStack>
              </Box>
            </Box>
          </Flex>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <Box mt={6} pt={5} borderTopWidth="1px" borderColor="gray.200">
              <Heading size="sm" mb={4} color="gray.900">
                Sản phẩm tương tự
              </Heading>
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={4}>
                {relatedProducts.slice(0, 4).map((p) => {
                  const relProductId = p.id || p.product_id || "";
                  return (
                    <Box key={relProductId}>
                      <ProductCard
                        product={p}
                        onProductClick={onProductClick}
                        onToggleWishlist={onToggleWishlist}
                        isWishlisted={wishlist.includes(relProductId)}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetailModal;
