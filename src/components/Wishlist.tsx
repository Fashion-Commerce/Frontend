import React from "react";
import type { Product } from "@/types";
import { CloseIcon, ShoppingCartIcon, HeartIcon } from "@/components/icons";

interface WishlistProps {
  wishlistItems: Product[];
  onClose: () => void;
  onRemoveFromWishlist: (productId: string) => void;
  onProductClick: (product: Product) => void;
}

const Wishlist: React.FC<WishlistProps> = ({
  wishlistItems,
  onClose,
  onRemoveFromWishlist,
  onProductClick,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <HeartIcon className="w-7 h-7 text-red-500" isFilled={true} />
          Sản phẩm yêu thích
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      {wishlistItems.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Bạn chưa có sản phẩm yêu thích nào.
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto -mr-6 pr-6">
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm"
              >
                <img
                  src={item.imageUrls[0]}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.brand.name}
                  </p>
                  <p className="text-lg text-slate-600 dark:text-slate-400 font-bold mt-1">
                    {formatPrice(item.basePrice)}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Xóa khỏi Wishlist"
                  >
                    <HeartIcon
                      className="w-6 h-6 text-red-500"
                      isFilled={true}
                    />
                  </button>
                  <button
                    onClick={() => onProductClick(item)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                    aria-label="Thêm vào giỏ hàng"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
