import React, { useState, useMemo, useEffect } from "react";
import type { Product, ProductVariant } from "@/types";
import { CloseIcon, HeartIcon, StarIcon } from "@/components/icons";

interface ProductDetailModalProps {
  product: Product;
  relatedProducts: Product[];
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant,
    quantity: number,
  ) => void;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

const ProductRating: React.FC<{
  rating: number;
  reviewCount: number;
  big?: boolean;
}> = ({ rating, reviewCount, big }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`${big ? "w-5 h-5" : "w-4 h-4"} text-yellow-400`}
        isFilled={i < Math.round(rating)}
      />
    ))}
    <span
      className={`${big ? "text-base" : "text-xs"} text-gray-600 dark:text-gray-400 ml-2`}
    >
      {rating.toFixed(1)} ({reviewCount} đánh giá)
    </span>
  </div>
);

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants[0]?.color || null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants[0]?.size || null,
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  const availableColors = useMemo(() => {
    return [
      ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
    ] as string[];
  }, [product.variants]);

  const availableSizes = useMemo(() => {
    return [
      ...new Set(
        product.variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
          .filter(Boolean),
      ),
    ] as string[];
  }, [product.variants, selectedColor]);

  useEffect(() => {
    const variant = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize,
    );
    setSelectedVariant(variant || null);
  }, [selectedColor, selectedSize, product.variants]);

  // Reset selections when product changes
  useEffect(() => {
    const firstVariant = product.variants[0];
    setSelectedColor(firstVariant?.color || null);
    setSelectedSize(firstVariant?.size || null);
    setQuantity(1);
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
      alert("Sản phẩm này hiện không có sẵn. Vui lòng thử lại sau.");
    }
  };

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.basePrice;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] relative flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white z-10 bg-white/50 dark:bg-slate-800/50 rounded-full p-1"
        >
          <CloseIcon className="w-7 h-7" />
        </button>
        <div className="flex-grow overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {product.name}
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">
                Thương hiệu:{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {product.brand.name}
                </span>
              </p>
              <div className="my-3">
                <ProductRating
                  rating={product.averageRating}
                  reviewCount={product.reviewCount}
                  big
                />
              </div>
              <p className="text-4xl font-extrabold text-slate-700 dark:text-slate-400 my-4">
                {formatPrice(displayPrice)}
              </p>

              {availableColors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Màu sắc:{" "}
                    <span className="font-normal">{selectedColor}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${selectedColor === color ? "border-slate-600 dark:border-slate-300" : "border-transparent"}`}
                        style={{
                          backgroundColor:
                            color.toLowerCase() === "trắng"
                              ? "#f0f0f0"
                              : color.toLowerCase(),
                        }}
                        title={color}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {availableSizes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Chọn size:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md transition-colors text-sm ${selectedSize === size ? "bg-slate-600 text-white border-slate-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-200 dark:border-slate-600 dark:hover:bg-slate-600"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Số lượng:
                </h4>
                <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-md w-fit">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={handleAddToCartClick}
                  disabled={!selectedVariant}
                  className="flex-grow bg-slate-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-colors dark:hover:bg-slate-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-3 border rounded-lg transition-colors ${isWishlisted ? "text-red-500 border-red-500 bg-red-50 dark:bg-red-900/50" : "text-gray-500 border-gray-300 hover:border-red-500 hover:text-red-500 dark:text-gray-400 dark:border-slate-600 dark:hover:border-red-500"}`}
                >
                  <HeartIcon className="w-6 h-6" isFilled={isWishlisted} />
                </button>
              </div>

              <div className="mt-8">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-slate-700 pb-2">
                  Mô tả sản phẩm
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Sản phẩm liên quan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onProductClick(p)}
                  className="bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
                >
                  <img
                    src={p.imageUrls[0]}
                    alt={p.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {p.name}
                    </h4>
                    <p className="text-md font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {formatPrice(p.basePrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
