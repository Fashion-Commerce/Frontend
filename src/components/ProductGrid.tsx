import React from "react";
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
}) => {
  return (
    <div className="p-6" id="product-grid">
      {forYouProducts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Dành cho bạn
            </span>
          </h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6">
              {forYouProducts.map((product) => (
                <div
                  key={`foryou-${product.id}`}
                  className="w-60 md:w-64 flex-shrink-0"
                >
                  <ProductCard
                    product={product}
                    onProductClick={onProductClick}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              Chuyên gia gợi ý cho bạn
            </span>
          </h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6">
              {recommendations.map((product) => (
                <div
                  key={`rec-${product.id}`}
                  className="w-60 md:w-64 flex-shrink-0"
                >
                  <ProductCard
                    product={product}
                    onProductClick={onProductClick}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Sản phẩm
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "All"
                ? "bg-slate-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onFilterChange(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.name
                  ? "bg-slate-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={wishlist.includes(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
