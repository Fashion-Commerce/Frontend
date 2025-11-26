import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { orderApi, type Order, type OrdersParams } from "@/api/order.api";
import { paymentApi } from "@/api";
import { toast } from "react-toastify";
import {
  Package,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { Dialog, Button, Portal, Text, Flex } from "@chakra-ui/react";

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderToPayment, setOrderToPayment] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, currentPage, selectedStatus, dateFrom, dateTo]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params: OrdersParams = {
        page: currentPage,
        page_size: 10,
      };
      if (selectedStatus) {
        params.status_filter = selectedStatus;
      }
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }

      const response = await orderApi.getOrders(params);
      setOrders(response.orders);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderDetail = async (orderId: string) => {
    try {
      setIsLoadingDetail(true);
      const response = await orderApi.getOrderById(orderId);
      setOrderDetail(response.order);
      setSelectedOrderId(orderId);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải chi tiết đơn hàng");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await orderApi.cancelOrder(orderId);
      if (response.success) {
        toast.success("Hủy đơn hàng thành công!");
        loadOrders();
        if (selectedOrderId === orderId) {
          loadOrderDetail(orderId);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể hủy đơn hàng");
    } finally {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  const handlePayOrder = async () => {
    if (!orderToPayment) return;

    try {
      setIsProcessingPayment(true);

      // Create payment for existing order
      const paymentResponse = await paymentApi.createPayment({
        order_id: orderToPayment.order_id,
        payment_method: paymentMethod,
      });

      if (paymentResponse?.success) {
        toast.success("Tạo thanh toán thành công!");

        // Close dialog
        setPaymentDialogOpen(false);
        setOrderToPayment(null);

        if (paymentMethod === "vnpay" && paymentResponse.payment_url) {
          // Redirect to VNPay payment page
          toast.info("Đang chuyển đến trang thanh toán...");
          setTimeout(() => {
            window.location.href = paymentResponse.payment_url!;
          }, 500);
        } else {
          // COD payment - reload orders
          toast.success("Đơn hàng COD đã được xác nhận!");
          loadOrders();
          if (selectedOrderId === orderToPayment.order_id) {
            loadOrderDetail(orderToPayment.order_id);
          }
        }
      }
    } catch (error: any) {
      toast.error(
        error.message || "Không thể tạo thanh toán. Vui lòng thử lại."
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getEstimatedDeliveryDate = (orderDate: string) => {
    const date = new Date(orderDate);
    const minDays = 3;
    const maxDays = 4;
    const minDate = new Date(date);
    const maxDate = new Date(date);
    minDate.setDate(date.getDate() + minDays);
    maxDate.setDate(date.getDate() + maxDays);
    return `${minDate.toLocaleDateString(
      "vi-VN"
    )} - ${maxDate.toLocaleDateString("vi-VN")}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
        );
      case "processing":
        return (
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
        );
      case "shipped":
        return (
          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
        );
      case "delivered":
        return (
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
        );
      case "cancelled":
        return (
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
        );
      default:
        return (
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
        );
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      shipped:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      colorMap[status.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bạn cần đăng nhập để xem đơn hàng
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý và theo dõi đơn hàng của bạn
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-stretch sm:items-center">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
              <label
                htmlFor="status-filter"
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Trạng thái:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
              <label
                htmlFor="date-from"
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Từ ngày:
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
              <label
                htmlFor="date-to"
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Đến ngày:
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                }}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Xóa bộ lọc ngày
              </button>
            )}

            <div className="sm:ml-auto text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2 sm:pt-0">
              Tổng: {totalCount} đơn hàng
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 md:p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Bắt đầu mua sắm để tạo đơn hàng đầu tiên!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    {getStatusIcon(order.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          #{order.order_id.slice(0, 8)}
                        </span>
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Ngày đặt:</span>{" "}
                        {formatDate(order.order_date)}
                      </p>
                      {order.status.toLowerCase() !== "cancelled" &&
                        order.status.toLowerCase() !== "delivered" && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            <span className="font-medium">Dự kiến giao:</span>{" "}
                            {getEstimatedDeliveryDate(order.order_date)}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {formatPrice(order.total_amount)}
                    </p>
                    {order.shipping_fee && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        (Phí ship: {formatPrice(order.shipping_fee)})
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {order.shipping_address}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">SĐT:</span>{" "}
                    {order.shipping_phone}
                  </p>
                  {order.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-medium">Ghi chú:</span>{" "}
                      {order.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => loadOrderDetail(order.order_id)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    Xem chi tiết
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  {order.status.toLowerCase() === "pending" && (
                    <>
                      <button
                        onClick={() => {
                          setOrderToPayment(order);
                          setPaymentMethod("cod");
                          setPaymentDialogOpen(true);
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        Thanh toán
                      </button>
                      <button
                        onClick={() => {
                          setOrderToCancel(order.order_id);
                          setCancelDialogOpen(true);
                        }}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                Chi tiết đơn hàng
              </h2>
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setOrderDetail(null);
                }}
                title="Đóng"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="p-8 sm:p-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : orderDetail ? (
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Order Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Mã đơn hàng
                      </p>
                      <p className="font-mono text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-all">
                        {orderDetail.order_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Trạng thái
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          orderDetail.status
                        )}`}
                      >
                        {getStatusText(orderDetail.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Ngày đặt
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(orderDetail.order_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Thanh toán
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {orderDetail.payment_method?.toUpperCase() || "COD"}
                      </p>
                    </div>
                    {orderDetail.status.toLowerCase() !== "cancelled" &&
                      orderDetail.status.toLowerCase() !== "delivered" && (
                        <div className="sm:col-span-2">
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Dự kiến giao hàng
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                            {getEstimatedDeliveryDate(orderDetail.order_date)}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Thông tin giao hàng
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Địa chỉ:</span>{" "}
                      {orderDetail.shipping_address}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Số điện thoại:</span>{" "}
                      {orderDetail.shipping_phone}
                    </p>
                    {orderDetail.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Ghi chú:</span>{" "}
                        {orderDetail.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Sản phẩm ({orderDetail.items_count || 0})
                  </h3>
                  <div className="space-y-3">
                    {orderDetail.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                          {item.product_image_url ? (
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {item.product_name}
                          </h4>
                          <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {item.variant_color && (
                              <span>Màu: {item.variant_color}</span>
                            )}
                            {item.variant_size && (
                              <span>Size: {item.variant_size}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {formatPrice(item.unit_price)} x {item.quantity}
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatPrice(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tạm tính
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(
                          orderDetail.total_amount -
                            (orderDetail.shipping_fee || 0)
                        )}
                      </span>
                    </div>
                    {orderDetail.shipping_fee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Phí vận chuyển
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(orderDetail.shipping_fee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">
                        Tổng cộng
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatPrice(orderDetail.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {orderDetail.status.toLowerCase() === "pending" && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setOrderToCancel(orderDetail.order_id);
                        setCancelDialogOpen(true);
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Hủy đơn hàng
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <Dialog.Root
        open={cancelDialogOpen}
        onOpenChange={(e) => {
          setCancelDialogOpen(e.open);
          if (!e.open) setOrderToCancel(null);
        }}
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner className="flex items-center justify-center">
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-2xl font-bold text-red-600">
                  Xác nhận hủy đơn hàng
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6">
                <Text>
                  Bạn có chắc chắn muốn hủy đơn hàng{" "}
                  <span className="font-bold">
                    #{orderToCancel?.slice(0, 8)}
                  </span>{" "}
                  không?
                </Text>
                <Text color="red.500" fontSize="sm" mt={2}>
                  Hành động này không thể hoàn tác!
                </Text>
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Flex justify="flex-end" gap={3}>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCancelDialogOpen(false);
                        setOrderToCancel(null);
                      }}
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Hủy
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
                    onClick={() =>
                      orderToCancel && handleCancelOrder(orderToCancel)
                    }
                  >
                    Xác nhận hủy
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Payment Method Dialog */}
      <Dialog.Root
        open={paymentDialogOpen}
        onOpenChange={(e) => {
          setPaymentDialogOpen(e.open);
          if (!e.open) {
            setOrderToPayment(null);
            setPaymentMethod("cod");
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop className="!bg-black/50" />
          <Dialog.Positioner className="flex items-center justify-center">
            <Dialog.Content className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4">
              <Dialog.Header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chọn phương thức thanh toán
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body className="px-6 py-6">
                {orderToPayment && (
                  <div className="mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Đơn hàng:{" "}
                        <span className="font-bold">
                          #{orderToPayment.order_id.slice(0, 8)}
                        </span>
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        Tổng tiền: {formatPrice(orderToPayment.total_amount)}
                      </p>
                    </div>

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
                          className="w-4 h-4"
                        />
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
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Thanh toán qua VNPay
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Thanh toán online qua cổng VNPay
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </Dialog.Body>

              <Dialog.Footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Flex justify="flex-end" gap={3}>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPaymentDialogOpen(false);
                        setOrderToPayment(null);
                        setPaymentMethod("cod");
                      }}
                      className="border-2 border-gray-200 hover:border-gray-300 rounded-lg px-4 py-2"
                    >
                      Hủy
                    </Button>
                  </Dialog.CloseTrigger>
                  <Button
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg px-6 py-2 disabled:opacity-50"
                    onClick={handlePayOrder}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment
                      ? "Đang xử lý..."
                      : "Xác nhận thanh toán"}
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  );
};

export default OrdersPage;
