import React from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import type { CartItem } from "@/api/cart.api";

interface CartProps {
  cartItems: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  totalAmount,
  onClose,
  onCheckout,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Giỏ hàng
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({cartItems.length} sản phẩm)
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-1">
            Giỏ hàng trống
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cart_item_id}
                className="group flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                {/* Product Image Placeholder */}
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                    {item.product_name}
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {item.product_name}
                  </h3>

                  {/* Variant Info */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.variant_color && (
                      <span className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300">
                        {item.variant_color}
                      </span>
                    )}
                    {item.variant_size && (
                      <span className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-300">
                        {item.variant_size}
                      </span>
                    )}
                  </div>

                  {/* Brand & Category */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {item.brand_name} • {item.category_name}
                  </p>

                  {/* Price & Quantity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.cart_item_id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(
                              item.cart_item_id,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.cart_item_id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.product_price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPrice(item.product_price)} × {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer - Summary & Checkout */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
          {/* Subtotal */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tạm tính</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Phí vận chuyển
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                Miễn phí
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              Tổng cộng
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(totalAmount)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Tiến hành thanh toán
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
