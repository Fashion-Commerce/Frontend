import React, { useState, useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

interface AuthModalProps {
  initialView: "login" | "register";
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose }) => {
  const [view, setView] = useState(initialView);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, register, isLoading, error: authError } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    setView(initialView);
    setError(null);
  }, [initialView]);

  // Show auth error from store
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);

    try {
      if (view === "login") {
        const success = await login(email, password);
        if (success) {
          await fetchCart();
          onClose();
        }
      } else {
        const success = await register(
          name,
          email,
          password,
          phone || undefined
        );
        if (success) {
          await fetchCart();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:opacity-70 transition-opacity"
          style={{ color: "#333333" }}
          aria-label="Đóng"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="p-8">
          <h2
            className="text-2xl font-bold text-center mb-2"
            style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#333333",
            }}
          >
            {view === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-center mb-6" style={{ color: "#666666" }}>
            {view === "login"
              ? "Đăng nhập để tiếp tục mua sắm"
              : "Tham gia cùng AgentFashion ngay"}
          </p>

          <div
            className="flex mb-6"
            style={{ borderBottom: "2px solid #E9ECEF" }}
          >
            <button
              onClick={() => setView("login")}
              className={`flex-1 py-2 font-medium transition-colors`}
              style={{
                color: view === "login" ? "#C89B6D" : "#999999",
                borderBottom: view === "login" ? "2px solid #C89B6D" : "none",
                marginBottom: "-2px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setView("register")}
              className={`flex-1 py-2 font-medium transition-colors`}
              style={{
                color: view === "register" ? "#C89B6D" : "#999999",
                borderBottom:
                  view === "register" ? "2px solid #C89B6D" : "none",
                marginBottom: "-2px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "register" && (
              <>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="name"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="phone"
                  >
                    Số điện thoại (tùy chọn)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </>
            )}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-2.5 rounded-md font-semibold transition-all disabled:opacity-50 flex items-center justify-center hover:opacity-90"
              style={{
                backgroundColor: "#C89B6D",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : view === "login" ? (
                "Đăng nhập"
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
