import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ProductGrid from "@/components/ProductGrid";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useProductStore } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { productApi } from "@/api/product.api";
import { categoryApi } from "@/api/category.api";
import type { Product, ProductVariant, Category } from "@/types";

// Interface for category section data
interface CategorySection {
  category: Category;
  products: Product[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}

interface OutletContext {
  searchTerm: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { searchTerm } = useOutletContext<OutletContext>();

  const pageSize = 5; // 5 products per page per category
  const categoryPageSize = 3; // 3 categories per page

  // Placeholder states - sẽ có từ stores sau
  const wishlist: string[] = [];
  const recommendedProducts: Product[] = [];
  const forYouProducts: Product[] = [];

  // Selected product for modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);

  // Category sections state - now with accumulated products
  const [categorySections, setCategorySections] = useState<CategorySection[]>(
    []
  );

  // Category pagination state
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const [totalCategoryPages, setTotalCategoryPages] = useState(1);
  const [isLoadingMoreCategories, setIsLoadingMoreCategories] = useState(false);

  // Search results state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  useEffect(() => {
    // Load initial categories from API
    loadCategoriesPage(1);
  }, []);

  // Handle search - load direct results instead of categories
  useEffect(() => {
    if (searchTerm && searchTerm.trim().length > 0) {
      // User is searching - show direct results
      setIsSearching(true);
      setSearchPage(1);
      loadSearchResults(1, true);
    } else if (searchTerm !== undefined) {
      // Empty search - back to category view
      setIsSearching(false);
      setSearchResults([]);
      if (categorySections.length === 0) {
        // Load categories if not loaded yet
        setCurrentCategoryPage(1);
        loadCategoriesPage(1);
      }
    }
  }, [searchTerm]);

  const loadSearchResults = async (page: number, reset: boolean = false) => {
    try {
      setSearchLoading(true);
      const response = await productApi.getProducts({
        page,
        page_size: 20, // Show more results per page for search
        name_search: searchTerm || undefined,
      });

      if (reset) {
        setSearchResults(response.info.products);
      } else {
        setSearchResults((prev) => [...prev, ...response.info.products]);
      }
      setSearchTotalPages(response.info.total_pages);
      setSearchLoading(false);
    } catch (error) {
      console.error("Failed to load search results:", error);
      setSearchLoading(false);
    }
  };

  const loadMoreSearchResults = () => {
    if (searchPage < searchTotalPages && !searchLoading) {
      const nextPage = searchPage + 1;
      setSearchPage(nextPage);
      loadSearchResults(nextPage, false);
    }
  };

  const loadCategoriesPage = async (page: number) => {
    try {
      const response = await categoryApi.getCategories({
        page,
        page_size: categoryPageSize,
      });

      const newCategories = response.info.categories;
      setTotalCategoryPages(response.info.total_pages);

      // Create sections for new categories
      const newSections: CategorySection[] = newCategories.map((category) => ({
        category,
        products: [],
        currentPage: 1,
        totalPages: 1,
        isLoading: true,
      }));

      if (page === 1) {
        // First load - replace all sections
        setCategorySections(newSections);
        // Load products for all new sections
        newCategories.forEach((category, index) => {
          loadCategoryProductsByCategory(category, index, 1);
        });
      } else {
        // Load more - append to existing sections
        setCategorySections((prev) => {
          const updated = [...prev, ...newSections];
          // Load products for newly added sections
          const startIndex = prev.length;
          newCategories.forEach((category, relativeIndex) => {
            loadCategoryProductsByCategory(
              category,
              startIndex + relativeIndex,
              1
            );
          });
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadMoreCategories = async () => {
    if (isLoadingMoreCategories) return;
    if (currentCategoryPage >= totalCategoryPages) return;

    setIsLoadingMoreCategories(true);
    const nextPage = currentCategoryPage + 1;
    setCurrentCategoryPage(nextPage);

    await loadCategoriesPage(nextPage);
    setIsLoadingMoreCategories(false);
  };

  const loadCategoryProductsByCategory = async (
    category: Category,
    categoryIndex: number,
    page: number
  ) => {
    try {
      const categoryId = category.id || category.category_id || "";
      const response = await productApi.getProducts({
        category_id_filter: categoryId,
        page,
        page_size: pageSize,
        name_search: searchTerm || undefined,
      });

      setCategorySections((prev) => {
        const newSections = [...prev];
        if (newSections[categoryIndex]) {
          newSections[categoryIndex] = {
            ...newSections[categoryIndex],
            products: response.info.products,
            currentPage: page,
            totalPages: response.info.total_pages,
            isLoading: false,
          };
        }
        return newSections;
      });
    } catch (error) {
      console.error(
        `Failed to load products for category ${category.name}:`,
        error
      );
      setCategorySections((prev) => {
        const newSections = [...prev];
        if (newSections[categoryIndex]) {
          newSections[categoryIndex] = {
            ...newSections[categoryIndex],
            isLoading: false,
          };
        }
        return newSections;
      });
    }
  };

  const loadCategoryProducts = async (categoryIndex: number, page: number) => {
    setCategorySections((prev) => {
      const section = prev[categoryIndex];
      if (!section) return prev;

      const newSections = [...prev];
      newSections[categoryIndex] = {
        ...newSections[categoryIndex],
        isLoading: true,
      };

      // Trigger the actual load
      loadCategoryProductsByCategory(section.category, categoryIndex, page);

      return newSections;
    });
  };

  const handleProductClick = async (product: Product) => {
    // Fetch full product details with variants from API
    try {
      setLoadingProductDetail(true);
      const productId = product.id || product.product_id || "";
      const response = await productApi.getProductById(productId);

      // Normalize the product data
      const fullProduct = {
        ...response.info.product,
        id: response.info.product.product_id || response.info.product.id,
        basePrice:
          response.info.product.base_price || response.info.product.price || 0,
        imageUrls: response.info.product.image_urls || [],
        averageRating: response.info.product.average_rating || 0,
        reviewCount: response.info.product.review_count || 0,
        brand: {
          name: response.info.product.brand_name || "",
        },
        category: {
          name: response.info.product.category_name || "",
        },
      } as Product;

      setSelectedProduct(fullProduct);
    } catch (error) {
      console.error("Failed to load product details:", error);
    } finally {
      setLoadingProductDetail(false);
    }
  };

  const handleCategoryPageChange = (categoryIndex: number, page: number) => {
    loadCategoryProducts(categoryIndex, page);
  };

  const handleToggleWishlist = (productId: string) => {
    if (!user) {
      // Show auth modal
      console.log("Need login");
      return;
    }
    // Toggle wishlist
    console.log("Toggle wishlist:", productId);
  };

  const handleAddToCart = async (
    product: Product,
    variant: ProductVariant,
    quantity: number
  ) => {
    if (!user) {
      console.log("Need login");
      return;
    }

    const userId = user.user_id || user.id || "";
    const variantId =
      variant.variant_id || variant.product_variant_id || variant.id || "";

    if (userId && variantId) {
      await addToCart(userId, variantId, quantity);
    }
  };

  const getRelatedProducts = (product: Product): Product[] => {
    // Get products from same category from category sections
    const productId = product.id || product.product_id || "";
    const categorySection = categorySections.find((section) => {
      const categoryId =
        section.category.id || section.category.category_id || "";
      return categoryId === product.category_id;
    });

    if (categorySection) {
      return categorySection.products
        .filter((p) => {
          const pId = p.id || p.product_id || "";
          return pId !== productId;
        })
        .slice(0, 4);
    }
    return [];
  };

  const hasMoreCategories = currentCategoryPage < totalCategoryPages;

  return (
    <>
      <ProductGrid
        categorySections={categorySections}
        recommendations={recommendedProducts}
        forYouProducts={forYouProducts}
        onProductClick={handleProductClick}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        onCategoryPageChange={handleCategoryPageChange}
        onLoadMoreCategories={loadMoreCategories}
        isLoadingMoreCategories={isLoadingMoreCategories}
        hasMoreCategories={currentCategoryPage < totalCategoryPages}
        isSearching={isSearching}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onLoadMoreSearchResults={loadMoreSearchResults}
        hasMoreSearchResults={searchPage < searchTotalPages}
      />

      {loadingProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      )}

      {selectedProduct && !loadingProductDetail && (
        <ProductDetailModal
          product={selectedProduct}
          relatedProducts={getRelatedProducts(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.includes(
            selectedProduct.id || selectedProduct.product_id || ""
          )}
          wishlist={wishlist}
        />
      )}
    </>
  );
};

export default HomePage;
