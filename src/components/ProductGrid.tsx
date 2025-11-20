import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";

// Interface for category section data
interface CategorySection {
  category: Category;
  products: Product[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}

interface ProductGridProps {
  categorySections: CategorySection[];
  recommendations: Product[];
  forYouProducts: Product[];
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  onCategoryPageChange: (categoryIndex: number, page: number) => void;
  onSearchChange?: (searchTerm: string) => void;
  onLoadMoreCategories?: () => void;
  isLoadingMoreCategories?: boolean;
  hasMoreCategories?: boolean;
  isSearching?: boolean;
  searchResults?: Product[];
  searchLoading?: boolean;
  onLoadMoreSearchResults?: () => void;
  hasMoreSearchResults?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  categorySections,
  recommendations,
  forYouProducts,
  onProductClick,
  onToggleWishlist,
  wishlist,
  onCategoryPageChange,
  onSearchChange,
  onLoadMoreCategories,
  isLoadingMoreCategories = false,
  hasMoreCategories = false,
  isSearching = false,
  searchResults = [],
  searchLoading = false,
  onLoadMoreSearchResults,
  hasMoreSearchResults = false,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll for both search results and categories
  useEffect(() => {
    const shouldLoadMore = isSearching
      ? onLoadMoreSearchResults && hasMoreSearchResults && !searchLoading
      : onLoadMoreCategories && hasMoreCategories && !isLoadingMoreCategories;

    if (!shouldLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (isSearching && onLoadMoreSearchResults) {
            onLoadMoreSearchResults();
          } else if (!isSearching && onLoadMoreCategories) {
            onLoadMoreCategories();
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [
    isSearching,
    onLoadMoreSearchResults,
    hasMoreSearchResults,
    searchLoading,
    onLoadMoreCategories,
    hasMoreCategories,
    isLoadingMoreCategories,
  ]);

  const handlePrevPage = (categoryIndex: number, currentPage: number) => {
    if (currentPage > 1) {
      onCategoryPageChange(categoryIndex, currentPage - 1);
    }
  };

  const handleNextPage = (
    categoryIndex: number,
    currentPage: number,
    totalPages: number
  ) => {
    if (currentPage < totalPages) {
      onCategoryPageChange(categoryIndex, currentPage + 1);
    }
  };

  return (
    <Box
      className="w-full"
      style={{ backgroundColor: "#F4F6F8", padding: "1rem", width: "100%" }}
      id="product-grid"
    >
      {forYouProducts.length > 0 && (
        <Box className="mb-8" style={{ width: "100%" }}>
          <Heading className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Dành cho bạn
          </Heading>
          <Box className="relative" style={{ width: "100%" }}>
            <Flex
              className="overflow-x-auto gap-4 pb-4 scrollbar-hide"
              style={{ width: "100%" }}
            >
              {forYouProducts.map((product) => {
                const productId = product.id || product.product_id || "";
                return (
                  <Box
                    key={`foryou-${productId}`}
                    className="flex-shrink-0 product-card-responsive"
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
        <Box className="mb-8" style={{ width: "100%" }}>
          <Heading className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Chuyên gia gợi ý cho bạn
          </Heading>
          <Box className="relative" style={{ width: "100%" }}>
            <Flex
              className="overflow-x-auto gap-4 pb-4 scrollbar-hide"
              style={{ width: "100%" }}
            >
              {recommendations.map((product) => {
                const productId = product.id || product.product_id || "";
                return (
                  <Box
                    key={`rec-${productId}`}
                    className="flex-shrink-0 product-card-responsive"
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

      {/* Search Results Section */}
      {isSearching && (
        <Box className="mb-8" style={{ width: "100%" }}>
          <Heading
            className="text-xl md:text-2xl font-bold mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#1A2A4E",
            }}
          >
            Kết quả tìm kiếm ({searchResults.length} sản phẩm)
          </Heading>

          {searchLoading && searchResults.length === 0 ? (
            <VStack className="py-20">
              <Spinner className="w-12 h-12" style={{ color: "#C89B6D" }} />
              <Text style={{ color: "#1A2A4E" }}>Đang tìm kiếm...</Text>
            </VStack>
          ) : searchResults.length === 0 ? (
            <VStack className="py-20">
              <Text style={{ color: "#1A2A4E", fontSize: "18px" }}>
                Không tìm thấy sản phẩm nào
              </Text>
            </VStack>
          ) : (
            <Box
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                width: "100%",
              }}
            >
              {searchResults.map((product) => {
                const productId = product.id || product.product_id || "";
                return (
                  <Box key={`search-${productId}`}>
                    <ProductCard
                      product={product}
                      onProductClick={onProductClick}
                      onToggleWishlist={onToggleWishlist}
                      isWishlisted={wishlist.includes(productId)}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Category Sections - Only show when NOT searching */}
      {!isSearching &&
        categorySections.map((section, originalIndex) => {
          // Skip empty sections
          if (section.products.length === 0 && !section.isLoading) return null;

          const categoryId =
            section.category.id || section.category.category_id || "";
          const showPrevButton = section.currentPage > 1;
          const showNextButton = section.currentPage < section.totalPages;

          return (
            <Box key={categoryId} className="mb-10" style={{ width: "100%" }}>
              {/* Category Header */}
              <Flex justify="space-between" align="center" mb={4}>
                <Heading
                  className="text-xl md:text-2xl font-bold uppercase tracking-wide"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#333333",
                  }}
                >
                  {section.category.name}
                </Heading>
                <Text fontSize="sm" style={{ color: "#333333" }}>
                  Page {section.currentPage} / {section.totalPages}
                </Text>
              </Flex>

              {/* Products Horizontal Scroll with Navigation Buttons */}
              {section.isLoading ? (
                <VStack className="py-20">
                  <Spinner className="w-12 h-12" style={{ color: "#C89B6D" }} />
                </VStack>
              ) : (
                <Box className="relative">
                  {/* Left Arrow Button */}
                  {showPrevButton && (
                    <Button
                      position="absolute"
                      left="0"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={10}
                      onClick={() =>
                        handlePrevPage(originalIndex, section.currentPage)
                      }
                      size="lg"
                      borderRadius="full"
                      bg="white"
                      shadow="lg"
                      className="hover:opacity-90"
                      style={{ backgroundColor: "#C89B6D", color: "white" }}
                    >
                      <ChevronLeft size={24} />
                    </Button>
                  )}

                  {/* Products Container */}
                  <Flex
                    className="overflow-x-auto gap-4 pb-4 scrollbar-hide"
                    style={{ width: "100%" }}
                  >
                    {section.products.map((product) => {
                      const productId = product.id || product.product_id || "";
                      return (
                        <Box
                          key={`${categoryId}-${productId}`}
                          className="flex-shrink-0 product-card-responsive"
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

                  {/* Right Arrow Button */}
                  {showNextButton && (
                    <Button
                      position="absolute"
                      right="0"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={10}
                      onClick={() =>
                        handleNextPage(
                          originalIndex,
                          section.currentPage,
                          section.totalPages
                        )
                      }
                      size="lg"
                      borderRadius="full"
                      shadow="lg"
                      className="hover:opacity-90"
                      style={{ backgroundColor: "#C89B6D", color: "white" }}
                    >
                      <ChevronRight size={24} />
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          );
        })}

      {/* Load More Trigger */}
      {(hasMoreCategories || hasMoreSearchResults) && (
        <Box ref={loadMoreRef} className="py-8">
          {(isLoadingMoreCategories || searchLoading) && (
            <VStack>
              <Spinner className="w-12 h-12" style={{ color: "#C89B6D" }} />
              <Text style={{ color: "#1A2A4E" }}>
                {isSearching
                  ? "Đang tải thêm kết quả..."
                  : "Đang tải thêm danh mục..."}
              </Text>
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProductGrid;
