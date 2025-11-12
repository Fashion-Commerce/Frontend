import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "@/components/ProductGrid";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useProductStore } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { productApi } from "@/api/product.api";
import type { Product, ProductVariant } from "@/types";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    products,
    categories,
    activeCategory,
    isLoading,
    fetchProducts,
    fetchCategories,
  } = useProductStore();
  const { addToCart } = useCartStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12; // 12 products per page

  // Placeholder states - sẽ có từ stores sau
  const wishlist: string[] = [];
  const recommendedProducts: Product[] = [];
  const forYouProducts: Product[] = [];

  // Selected product for modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);

  useEffect(() => {
    // Fetch initial data
    loadProducts();
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Reload products when page changes
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      const response = await productApi.getProducts({
        page: currentPage,
        page_size: pageSize,
      });

      setTotalPages(response.info.total_pages);
      await fetchProducts({
        page: currentPage,
        page_size: pageSize,
      });
    } catch (error) {
      console.error("Failed to load products:", error);
    }
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

  const handleFilterChange = (categoryName: string | "All") => {
    setCurrentPage(1); // Reset to first page when filtering
    if (categoryName === "All") {
      fetchProducts({ page: 1, page_size: pageSize });
    } else {
      // Filter by category
      const category = categories.find((c) => c.name === categoryName);
      if (category) {
        const categoryId =
          (category as any).id || (category as any).category_id || "";
        fetchProducts({
          category_id_filter: categoryId,
          page: 1,
          page_size: pageSize,
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (searchTerm: string) => {
    setCurrentPage(1);
    fetchProducts({
      page: 1,
      page_size: pageSize,
      name_search: searchTerm || undefined,
    });
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
    // Get products from same category, excluding current product
    const productId = product.id || product.product_id || "";
    return products
      .filter((p) => {
        const pId = p.id || p.product_id || "";
        return p.category_id === product.category_id && pId !== productId;
      })
      .slice(0, 4);
  };

  return (
    <>
      <ProductGrid
        products={products}
        categories={categories}
        recommendations={recommendedProducts}
        forYouProducts={forYouProducts}
        onProductClick={handleProductClick}
        onFilterChange={handleFilterChange}
        activeCategory={activeCategory || "All"}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
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
