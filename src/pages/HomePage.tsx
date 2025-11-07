import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "@/components/ProductGrid";
import { useProductStore } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    products,
    categories,
    activeCategory,
    fetchProducts,
    fetchCategories,
    setActiveCategory,
  } = useProductStore();

  // Placeholder states - sẽ có từ stores sau
  const wishlist: string[] = [];
  const recommendedProducts: any[] = [];
  const forYouProducts: any[] = [];

  useEffect(() => {
    // Fetch initial data
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleProductClick = (product: any) => {
    // Navigate to product detail hoặc open modal
    console.log("Product clicked:", product);
  };

  const handleFilterChange = (categoryName: string | "All") => {
    setActiveCategory(categoryName === "All" ? null : categoryName);
    if (categoryName === "All") {
      fetchProducts();
    } else {
      // Filter by category
      const category = categories.find((c) => c.name === categoryName);
      if (category) {
        fetchProducts({ category_id_filter: category.id });
      }
    }
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

  return (
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
    />
  );
};

export default HomePage;
