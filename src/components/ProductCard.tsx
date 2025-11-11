import React from "react";
import {
  Box,
  Image,
  Text,
  Badge,
  HStack,
  VStack,
  AspectRatio,
} from "@chakra-ui/react";
import type { Product } from "@/types";
import { HeartIcon, StarIcon } from "@/components/icons";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

const ProductRating: React.FC<{ rating: number; reviewCount: number }> = ({
  rating,
  reviewCount,
}) => (
  <HStack className="gap-1">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className="w-3 h-3 text-yellow-400"
        isFilled={i < Math.round(rating)}
      />
    ))}
    <Text className="text-xs text-gray-500">({reviewCount})</Text>
  </HStack>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id || product.product_id || "");
  };

  const productId = product.id || product.product_id || "";
  const images = product.imageUrls || product.image_urls || [];
  const imageUrl = images[0] || "";
  const brandName = product.brand?.name || product.brand_name || "";
  const basePrice =
    product.basePrice || product.base_price || product.price || 0;
  const avgRating = product.averageRating || product.average_rating || 0;
  const reviewCnt = product.reviewCount || product.review_count || 0;

  return (
    <Box
      onClick={() => onProductClick(product)}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Container */}
      <Box className="relative">
        <AspectRatio ratio={1}>
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
              onError={() => setImageError(true)}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Box className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              <svg
                className="w-12 h-12 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </Box>
          )}
        </AspectRatio>

        {/* Wishlist Button */}
        <Box
          as="button"
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10 transition-all ${
            isWishlisted
              ? "text-red-500 scale-110"
              : "text-gray-500 dark:text-gray-300 hover:text-red-500 hover:scale-110"
          }`}
        >
          <HeartIcon className="w-4 h-4" isFilled={isWishlisted} />
        </Box>

        {/* Official Badge */}
        <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>CHÍNH HÃNG</span>
        </Badge>
      </Box>

      {/* Product Info */}
      <VStack className="items-stretch p-3 gap-1">
        {/* Brand */}
        {brandName && (
          <Text className="text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {brandName}
          </Text>
        )}

        {/* Product Name */}
        <Text
          className="text-sm font-medium min-h-[40px] leading-[1.25]"
          css={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </Text>

        {/* Rating */}
        {reviewCnt > 0 && (
          <Box>
            <ProductRating rating={avgRating} reviewCount={reviewCnt} />
          </Box>
        )}

        {/* Price */}
        <Text className="text-lg font-bold text-red-600 dark:text-red-500">
          {formatPrice(basePrice)}
        </Text>
      </VStack>
    </Box>
  );
};

export default ProductCard;
