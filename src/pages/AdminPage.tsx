import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import DashboardOverview from "@/components/admin/DashboardOverview";
import ProductManagement from "@/components/admin/ProductManagement";
import ChatLogs from "@/components/admin/ChatLogs";
import Analytics from "@/components/admin/Analytics";
import AgentManagement from "@/components/admin/AgentManagement";
import BrandManagement from "@/components/admin/BrandManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import ResourceManagement from "@/components/admin/ResourceManagement";
import { useProductStore } from "@/stores/productStore";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useProductStore();

  // Placeholder cho chatMessages
  const chatMessages: any[] = [];

  // Determine current view based on route
  const renderContent = () => {
    const path = location.pathname;

    if (path === "/admin" || path === "/admin/") {
      return <DashboardOverview products={products} />;
    } else if (path.includes("/admin/products")) {
      return <ProductManagement products={products} setProducts={() => {}} />;
    } else if (path.includes("/admin/chat-logs")) {
      return <ChatLogs messages={chatMessages} />;
    } else if (path.includes("/admin/analytics")) {
      return <Analytics />;
    } else if (path.includes("/admin/agents")) {
      return <AgentManagement />;
    } else if (path.includes("/admin/brands")) {
      return <BrandManagement />;
    } else if (path.includes("/admin/categories")) {
      return <CategoryManagement />;
    } else if (path.includes("/admin/resources")) {
      return <ResourceManagement />;
    }

    return <Outlet />;
  };

  return renderContent();
};

export default AdminPage;
