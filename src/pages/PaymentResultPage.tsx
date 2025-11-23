import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Home, Package, AlertCircle } from "lucide-react";

/**
 * PaymentResultPage - Hiển thị kết quả thanh toán từ VNPay callback
 * URL params:
 * - status: "success" | "failed"
 * - order_id: string
 * - message: string (optional, for failed payments)
 */
const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const orderId = searchParams.get("order_id");
  const message = searchParams.get("message");

  const [countdown, setCountdown] = useState(10);

  const isSuccess = status === "success";

  // Auto redirect after 10 seconds
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate("/");
    }
  }, [countdown, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Đơn hàng của bạn đã được thanh toán thành công
            </p>

            {/* Order ID */}
            {orderId && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Mã đơn hàng
                </p>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white break-all">
                  {orderId}
                </p>
              </div>
            )}

            {/* Success Message */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Thanh toán đã được xác nhận</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chúng tôi sẽ xử lý và giao hàng sớm nhất cho bạn
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleViewOrders}
                className="w-full px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                <Package className="w-5 h-5" />
                Xem đơn hàng
              </button>

              <button
                onClick={handleGoHome}
                className="w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "#F4F6F8",
                  border: "1px solid #E9ECEF",
                  color: "#333333",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#E9ECEF")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F4F6F8")
                }
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </button>
            </div>

            {/* Auto redirect countdown */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              Tự động chuyển về trang chủ sau {countdown}s
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment Failed UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Failed Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Failed Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Không thể hoàn tất giao dịch thanh toán
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Mã đơn hàng
              </p>
              <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white break-all">
                {orderId}
              </p>
            </div>
          )}

          {/* Error Message */}
          {message && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Lý do thất bại
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {decodeURIComponent(message)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 Đơn hàng của bạn vẫn được lưu. Bạn có thể thử thanh toán lại
              hoặc chọn phương thức thanh toán khác.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleViewOrders}
              className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Xem đơn hàng & thử lại
            </button>

            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Về trang chủ
            </button>
          </div>

          {/* Auto redirect countdown */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Tự động chuyển về trang chủ sau {countdown}s
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
