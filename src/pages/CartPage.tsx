import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { getAddresses, type Address } from "@/api/address.api";
import { orderApi, type CreateOrderRequest } from "@/api/order.api";
import { paymentApi } from "@/api";
import { toast } from "react-toastify";
import {
  ShoppingBag,
  Truck,
  Package,
  AlertTriangle,
  CreditCard,
  Wallet,
} from "lucide-react";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    totalAmount,
    totalCount,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious,
    successMessage,
    isLoading,
    fetchCart,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [pendingQuantities, setPendingQuantities] = useState<{
    [key: string]: number | string;
  }>({});
  const [sortBy, setSortBy] = useState<
    "created_at" | "updated_at" | "quantity"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (user) {
      fetchCart(1, sortBy, sortOrder);
      loadAddresses();
    }
  }, [user, sortBy, sortOrder]);

  // Reset selected items when page changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [currentPage]);

  const loadAddresses = async () => {
    try {
      const response = await getAddresses();
      if (response.info.success && response.info.addresses) {
        setAddresses(response.info.addresses);
        // Auto-select default address
        const defaultAddr = response.info.addresses.find((a) => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (response.info.addresses.length > 0) {
          setSelectedAddressId(response.info.addresses[0].id);
        }
      }
    } catch (error: any) {
      console.error("Failed to load addresses:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    await updateQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      await removeItem(cartItemId);
      // Remove from selected items if it was selected
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const toggleItemSelection = (cartItemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cartItemId)) {
        newSet.delete(cartItemId);
      } else {
        newSet.add(cartItemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.cart_item_id)));
    }
  };

  const handleCheckout = async () => {
    if (!user?.user_id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    if (selectedItems.size === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để đặt hàng");
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Địa chỉ không hợp lệ");
      return;
    }

    try {
      setIsSubmittingOrder(true);

      const selectedCartItems = items.filter((item) =>
        selectedItems.has(item.cart_item_id)
      );

      const orderData: CreateOrderRequest = {
        user_id: user.user_id,
        items: selectedCartItems.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price: item.product_price,
        })),
        shipping_address: `${selectedAddress.address_line}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`,
        shipping_phone: selectedAddress.recipient_phone,
        user_address_id: selectedAddress.id,
        notes: notes.trim() || undefined,
        shipping_fee: 30000,
      };

      const response = await orderApi.createOrder(orderData);
      if (response.success && response.order_id) {
        const orderId = response.order_id;
        toast.success(`Đặt hàng thành công! Mã đơn: ${orderId}`);

        // Create payment
        try {
          const paymentResponse = await paymentApi.createPayment({
            order_id: orderId,
            payment_method: paymentMethod,
          });

          if (paymentResponse?.success) {
            // Clear cart after successful payment creation
            await fetchCart(1, sortBy, sortOrder);
            setNotes("");
            setSelectedItems(new Set());

            if (paymentMethod === "vnpay" && paymentResponse.payment_url) {
              // Redirect to VNPay payment page
              toast.info("Đang chuyển đến trang thanh toán...");
              setTimeout(() => {
                window.location.href = paymentResponse.payment_url!;
              }, 500);
            } else {
              // COD payment - redirect to orders page
              toast.success("Đơn hàng COD đã được tạo thành công!");
              setTimeout(() => {
                navigate("/orders");
              }, 1000);
            }
          }
        } catch (paymentError: any) {
          toast.error(
            paymentError.message ||
              "Không thể tạo thanh toán. Vui lòng thử lại."
          );
          // Still redirect to orders page even if payment creation fails
          setTimeout(() => {
            navigate("/orders");
          }, 1500);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn cần đăng nhập để xem giỏ hàng của mình
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "#C89B6D",
              fontFamily: "Montserrat, sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#B88A5D")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#C89B6D")
            }
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  const selectedItemsArray = items.filter((item) =>
    selectedItems.has(item.cart_item_id)
  );
  const subtotal = selectedItemsArray.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const shipping = selectedItems.size > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6F8" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Trang chủ
          </button>
          <span className="text-gray-400 dark:text-gray-500">›</span>
          <span className="text-gray-900 dark:text-white font-medium">
            Giỏ hàng
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-4">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ color: "#1A2A4E", fontFamily: "Montserrat, sans-serif" }}
          >
            Tổng giỏ hàng của bạn là {formatPrice(total)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Miễn phí vận chuyển và hoàn trả
          </p>
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              {successMessage}
            </p>
          )}
        </div>

        {/* Cart Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sản phẩm</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentPage}/{totalPages}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trang</p>
          </div>
        </div>

        {/* Select All & Sort Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Select All */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  items.length > 0 && selectedItems.size === items.length
                }
                onChange={toggleSelectAll}
                disabled={isLoading || items.length === 0}
                className="w-5 h-5 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Chọn tất cả trang này ({selectedItems.size}/{items.length})
              </span>
            </label>

            {/* Sort Controls */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Sắp xếp:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="created_at">Ngày thêm</option>
                <option value="updated_at">Ngày cập nhật</option>
                <option value="quantity">Số lượng</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as typeof sortOrder)
                }
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-6 mb-6">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 transition-all ${
                selectedItems.has(item.cart_item_id)
                  ? "border-green-500 dark:border-green-600"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex gap-6 flex-wrap">
                {/* Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.cart_item_id)}
                    onChange={() => toggleItemSelection(item.cart_item_id)}
                    className="w-5 h-5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                  />
                </div>
                {/* Product Image */}
                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <img
                      src={item.image_urls[0]}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `<span class="flex items-center justify-center h-full text-xs text-gray-500 dark:text-gray-400 text-center px-2 break-words">${item.product_name}</span>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2 break-words">
                        {item.product_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-[300px]">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {item.product_name}
                  </h3>

                  {/* Brand & Category */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {item.brand_name} • {item.category_name}
                  </p>

                  {/* Delivery Info */}
                  <div className="space-y-1.5 mb-4">
                    {item.updated_at && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>
                          Cập nhật lần cuối:{" "}
                          {new Date(item.updated_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Variant Selectors */}
                  <div className="flex flex-wrap gap-3">
                    {/* Quantity Input */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`quantity-${item.cart_item_id}`}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        Số lượng:
                      </label>
                      <input
                        id={`quantity-${item.cart_item_id}`}
                        type="number"
                        min="1"
                        max="9999"
                        value={
                          pendingQuantities[item.cart_item_id] !== undefined
                            ? pendingQuantities[item.cart_item_id]
                            : item.quantity
                        }
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty string for better UX when clearing
                          if (inputValue === "") {
                            setPendingQuantities((prev) => ({
                              ...prev,
                              [item.cart_item_id]: "" as any,
                            }));
                            return;
                          }
                          const value = parseInt(inputValue, 10);
                          if (!isNaN(value) && value >= 0) {
                            setPendingQuantities((prev) => ({
                              ...prev,
                              [item.cart_item_id]: value,
                            }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = parseInt(e.currentTarget.value);
                            if (!isNaN(value) && value >= 1) {
                              handleQuantityChange(item.cart_item_id, value);
                              // Clear pending state after API call
                              setPendingQuantities((prev) => {
                                const newState = { ...prev };
                                delete newState[item.cart_item_id];
                                return newState;
                              });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            // Reset to original quantity if invalid
                            setPendingQuantities((prev) => {
                              const newState = { ...prev };
                              delete newState[item.cart_item_id];
                              return newState;
                            });
                          } else if (value !== item.quantity) {
                            // Auto-save on blur if changed
                            handleQuantityChange(item.cart_item_id, value);
                            setPendingQuantities((prev) => {
                              const newState = { ...prev };
                              delete newState[item.cart_item_id];
                              return newState;
                            });
                          }
                        }}
                        disabled={isLoading}
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50"
                      />
                    </div>

                    {/* Color Selector */}
                    {item.variant_color && (
                      <div className="relative">
                        <label
                          htmlFor={`color-${item.cart_item_id}`}
                          className="sr-only"
                        >
                          Màu sắc
                        </label>
                        <select
                          id={`color-${item.cart_item_id}`}
                          value={item.variant_color}
                          disabled
                          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option>{item.variant_color}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Size Selector */}
                    {item.variant_size && (
                      <div className="relative">
                        <label
                          htmlFor={`size-${item.cart_item_id}`}
                          className="sr-only"
                        >
                          Kích cỡ
                        </label>
                        <select
                          id={`size-${item.cart_item_id}`}
                          value={item.variant_size}
                          disabled
                          className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option>{item.variant_size}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="flex flex-col items-end justify-between min-w-[120px]">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.product_price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.cart_item_id)}
                    disabled={isLoading}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <button
              onClick={() => fetchCart(currentPage - 1, sortBy, sortOrder)}
              disabled={!hasPrevious || isLoading}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => fetchCart(page, sortBy, sortOrder)}
                    disabled={isLoading}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === currentPage
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => fetchCart(currentPage + 1, sortBy, sortOrder)}
              disabled={!hasNext || isLoading}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tiếp
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md ml-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tổng đơn hàng
          </h3>

          {/* Address Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Địa chỉ giao hàng <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="">-- Chọn địa chỉ giao hàng --</option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.address_label ? `${addr.address_label} - ` : ""}
                  {addr.recipient_name} | {addr.recipient_phone}
                </option>
              ))}
            </select>
            {selectedAddressId && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                {(() => {
                  const addr = addresses.find(
                    (a) => a.id === selectedAddressId
                  );
                  return addr ? (
                    <>
                      <div className="font-medium">
                        {addr.recipient_name} - {addr.recipient_phone}
                      </div>
                      <div>
                        {addr.address_line}, {addr.ward}, {addr.district},{" "}
                        {addr.city}
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ghi chú đơn hàng
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Phương thức thanh toán <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {/* COD Option */}
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "cod" | "vnpay")
                  }
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
                />
                <Wallet className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Thanh toán khi nhận hàng (COD)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Thanh toán bằng tiền mặt khi nhận hàng
                  </p>
                </div>
              </label>

              {/* VNPay Option */}
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "vnpay"
                    ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "cod" | "vnpay")
                  }
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
                />
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Thanh toán qua VNPay
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Thanh toán trực tuyến qua cổng VNPay
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Sản phẩm đã chọn
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedItems.size} sản phẩm
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tạm tính</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Phí vận chuyển
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Tổng cộng
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              isLoading ||
              isSubmittingOrder ||
              !selectedAddressId ||
              selectedItems.size === 0
            }
            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isSubmittingOrder
              ? "Đang xử lý..."
              : `Đặt hàng (${selectedItems.size} sản phẩm)`}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Bằng việc tiến hành thanh toán, bạn đồng ý với{" "}
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Điều khoản dịch vụ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
