import React from "react";
import type { CartItem } from "@/types";
import { CloseIcon, TrashIcon } from "@/components/icons";

interface CartProps {
  cartItems: CartItem[];
  onClose: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (variantId: string, newQuantity: number) => void;
  onRemoveItem: (variantId: string) => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  onClose,
  onCheckout,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.variant.price * item.quantity,
    0,
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Giỏ hàng của bạn
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      {cartItems.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Giỏ hàng của bạn đang trống.
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto -mr-2 pr-2">
          {cartItems.map((item) => (
            <div
              key={item.variant.id}
              className="flex items-start mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm"
            >
              <img
                src={item.product.imageUrls[0]}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-md mr-4"
              />
              <div className="flex-grow">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.variant.color && <span>{item.variant.color}</span>}
                  {item.variant.color && item.variant.size && <span> / </span>}
                  {item.variant.size && <span>{item.variant.size}</span>}
                </p>
                <p className="text-md text-gray-700 dark:text-gray-300 font-bold mt-1">
                  {formatPrice(item.variant.price)}
                </p>
                <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-md w-fit mt-2">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.variant.id, item.quantity - 1)
                    }
                    className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.variant.id, item.quantity + 1)
                    }
                    className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item.variant.id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Tổng cộng:
          </span>
          <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cartItems.length === 0}
          className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold text-lg hover:bg-slate-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:hover:bg-slate-600 dark:disabled:bg-gray-600"
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  );
};

export default Cart;
