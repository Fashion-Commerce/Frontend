import React from "react";
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
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className="w-4 h-4 text-yellow-400"
        isFilled={i < Math.round(rating)}
      />
    ))}
    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
      ({reviewCount})
    </span>
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onToggleWishlist,
  isWishlisted,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onProductClick(product)}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col cursor-pointer group border border-transparent dark:hover:border-slate-600"
    >
      <div className="relative">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-1.5 rounded-full transition-colors ${isWishlisted ? "text-red-500" : "text-gray-500 dark:text-gray-300 hover:text-red-500"}`}
          aria-label="Thêm vào wishlist"
        >
          <HeartIcon className="w-5 h-5" isFilled={isWishlisted} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {product.brand.name}
        </p>
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center mt-1 mb-2">
          <ProductRating
            rating={product.averageRating}
            reviewCount={product.reviewCount}
          />
        </div>
        <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mt-auto">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
