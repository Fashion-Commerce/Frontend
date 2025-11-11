import React, { useState } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  recommendations: Product[];
  forYouProducts: Product[];
  onProductClick: (product: Product) => void;
  onFilterChange: (categoryName: string | "All") => void;
  activeCategory: string | "All";
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onSearchChange?: (searchTerm: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  recommendations,
  forYouProducts,
  onProductClick,
  onFilterChange,
  activeCategory,
  onToggleWishlist,
  wishlist,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  onSearchChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <Flex justify="center" align="center" gap={2} mt={8} mb={4}>
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          variant="outline"
          size="sm"
          borderColor="gray.300"
          _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
          minW="32px"
          p={0}
        >
          <ChevronLeft size={18} />
        </Button>
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <Text key={`ellipsis-${index}`} px={3} py={2} color="gray.500">
                ...
              </Text>
            );
          }
          const pageNum = page as number;
          return (
            <Button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              bg={currentPage === pageNum ? "blue.500" : "transparent"}
              color={currentPage === pageNum ? "white" : "gray.700"}
              borderWidth="1px"
              borderColor={currentPage === pageNum ? "blue.500" : "gray.300"}
              _hover={{
                bg: currentPage === pageNum ? "blue.600" : "gray.100",
                _dark: {
                  bg: currentPage === pageNum ? "blue.600" : "gray.700",
                },
              }}
              size="sm"
              minW="32px"
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          variant="outline"
          size="sm"
          borderColor="gray.300"
          _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
          minW="32px"
          p={0}
        >
          <ChevronRight size={18} />
        </Button>
      </Flex>
    );
  };

  return (
    <Box className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900" id="product-grid">
      {forYouProducts.length > 0 && (
        <Box className="mb-8">
          <Heading className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Dành cho bạn
          </Heading>
          <Box className="relative">
            <Flex className="overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
              {forYouProducts.map((product) => {
                const productId = product.id || product.product_id || "";
                return (
                  <Box
                    key={`foryou-${productId}`}
                    className="min-w-[192px] md:min-w-[224px] flex-shrink-0"
                  >
                    <ProductCard
                      product={product}
                      onProductClick={onProductClick}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={wishlist.includes(productId)}
                    />
                  </Box>
                );
              })}
            </Flex>
          </Box>
        </Box>
      )}

      {recommendations.length > 0 && (
        <Box className="mb-8">
          <Heading className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Chuyên gia gợi ý cho bạn
          </Heading>
          <Box className="relative">
            <Flex className="overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
              {recommendations.map((product) => {
                const productId = product.id || product.product_id || "";
                return (
                  <Box
                    key={`rec-${productId}`}
                    className="min-w-[192px] md:min-w-[224px] flex-shrink-0"
                  >
                    <ProductCard
                      product={product}
                      onProductClick={onProductClick}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={wishlist.includes(productId)}
                    />
                  </Box>
                );
              })}
            </Flex>
          </Box>
        </Box>
      )}

      <Box className="mb-6">
        <Flex className="items-center justify-between mb-4">
          <Heading className="text-xl md:text-2xl font-bold">Sản phẩm</Heading>

          {/* Search Bar */}
          <InputGroup className="max-w-xs">
            <Box className="relative w-full">
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </Box>
          </InputGroup>
        </Flex>

        <Flex className="flex-wrap gap-2 mb-4">
          <Button
            onClick={() => onFilterChange("All")}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              activeCategory === "All"
                ? "bg-blue-500 text-white border-blue-500 shadow-md hover:bg-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Tất cả
          </Button>
          {categories.map((category) => {
            const categoryId = category.id || category.category_id || "";
            const isActive = activeCategory === category.name;
            return (
              <Button
                key={categoryId}
                onClick={() => onFilterChange(category.name)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                  isActive
                    ? "bg-blue-500 text-white border-blue-500 shadow-md hover:bg-blue-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {category.name}
              </Button>
            );
          })}
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 2, md: 4 }} className="gap-3 md:gap-4">
        {isLoading ? (
          <VStack className="col-span-full py-20">
            <Spinner className="w-12 h-12 text-blue-500" />
          </VStack>
        ) : products.length === 0 ? (
          <VStack className="col-span-full py-20">
            <Text className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào
            </Text>
          </VStack>
        ) : (
          products.map((product) => {
            const productId = product.id || product.product_id || "";
            return (
              <ProductCard
                key={productId}
                product={product}
                onProductClick={onProductClick}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(productId)}
              />
            );
          })
        )}
      </SimpleGrid>

      {renderPagination()}
    </Box>
  );
};

export default ProductGrid;
