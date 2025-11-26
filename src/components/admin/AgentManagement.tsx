import React from "react";
// FIX: Changed import path to be explicit to avoid a path resolution conflict.
import { AgentType } from "../../types/index";

const AgentCard: React.FC<{ agent: AgentType; description: string }> = ({
  agent,
  description,
}) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-xl font-bold text-gray-800 mb-2">{agent}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
        Active
      </span>
      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
        Cấu hình
      </button>
    </div>
  </div>
);

const AgentManagement: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AgentCard
          agent={AgentType.SEARCH}
          description="Tìm sản phẩm từ database dựa trên truy vấn ngôn ngữ tự nhiên (AgentSQL)."
        />
        <AgentCard
          agent={AgentType.ADVISOR}
          description="Tư vấn phối đồ, outfit, và xu hướng thời trang sử dụng RAG (Retrieval-Augmented Generation)."
        />
        <AgentCard
          agent={AgentType.ORDER}
          description="Xử lý đặt hàng, thanh toán, và theo dõi đơn hàng."
        />
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cấu hình chung</h3>
        <p className="text-gray-600">
          Đây là nơi để thiết lập các thông số chung cho hệ thống multi-agent,
          chẳng hạn như lời chào mặc định, agent xử lý khi không xác định được ý
          định, v.v.
        </p>
      </div>
    </div>
  );
};

export default AgentManagement;
