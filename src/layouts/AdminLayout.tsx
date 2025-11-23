import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-md"
        title={sidebarOpen ? "Đóng menu" : "Mở menu"}
        aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar - Single design for all screens */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-900 text-white">
            <div className="flex items-center justify-center h-16 sm:h-20 border-b border-slate-700 px-4">
              <h1 className="text-lg sm:text-xl font-bold text-white text-center">
                AgentFashion Admin
              </h1>
            </div>

            <div className="flex flex-col flex-grow p-3 sm:p-4 space-y-2">
              <nav className="flex-grow space-y-2">
                <button
                  onClick={() => {
                    navigate("/admin");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/products");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Sản phẩm
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/brands");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Thương hiệu
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/categories");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Danh mục
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/resources");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Kho tri thức
                </button>
                <button
                  onClick={() => {
                    navigate("/admin/chat-logs");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Chat Logs
                </button>
              </nav>

              <div className="mt-auto">
                <button
                  onClick={() => {
                    navigate("/");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-left rounded-md hover:bg-slate-700"
                >
                  Quay lại cửa hàng
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
        <div className="max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
