import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-64 bg-slate-900 text-white">
        <div className="flex items-center justify-center h-20 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">AgentFashion Admin</h1>
        </div>

        <div className="flex flex-col flex-grow p-4 space-y-2">
          <nav className="flex-grow space-y-2">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Sản phẩm
            </button>
            <button
              onClick={() => navigate("/admin/brands")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Thương hiệu
            </button>
            <button
              onClick={() => navigate("/admin/categories")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Danh mục
            </button>
            <button
              onClick={() => navigate("/admin/resources")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Kho tri thức
            </button>
            <button
              onClick={() => navigate("/admin/chat-logs")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Chat Logs
            </button>
          </nav>

          <div className="mt-auto">
            <button
              onClick={() => navigate("/")}
              className="flex items-center w-full px-4 py-3 text-left rounded-md hover:bg-slate-700"
            >
              Quay lại cửa hàng
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
