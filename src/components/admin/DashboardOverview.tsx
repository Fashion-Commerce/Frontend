import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// FIX: Changed import path to be explicit to avoid a path resolution conflict.
import type { Product } from "../../types/index";
import { adminApi, type DashboardOverviewData } from "@/api/admin.api";

interface DashboardOverviewProps {
  products: Product[];
}

const StatCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  subtextColor?: string;
}> = ({ title, value, subtext, subtextColor = "text-green-500" }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    <p className={`text-xs ${subtextColor} mt-1`}>{subtext}</p>
  </div>
);

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products = [],
}) => {
  const [dashboardData, setDashboardData] =
    useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState(1);

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonths]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardOverview({
        months: selectedMonths,
      });
      setDashboardData(response.info.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  // Safe product count
  const productCount = Array.isArray(products) ? products.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Không thể tải dữ liệu dashboard
      </div>
    );
  }

  const { metrics, charts } = dashboardData;

  // Transform chart data for recharts
  const chartData = charts.revenue_orders_timeline.map((item) => ({
    name: formatDate(item.date),
    DoanhThu: item.revenue,
    "Đơn hàng": item.order_count,
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Bảng điều khiển AgentFashion
        </h2>
        <select
          value={selectedMonths}
          onChange={(e) => setSelectedMonths(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Chọn khoảng thời gian"
        >
          <option value={1}>1 tháng</option>
          <option value={3}>3 tháng</option>
          <option value={6}>6 tháng</option>
          <option value={12}>12 tháng</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={`Tổng doanh thu (${selectedMonths} tháng)`}
          value={formatPrice(metrics.revenue.current)}
          subtext={`${formatChangePercent(
            metrics.revenue.change_percent
          )} so với kỳ trước`}
          subtextColor={
            metrics.revenue.change_percent >= 0
              ? "text-green-500"
              : "text-red-500"
          }
        />
        <StatCard
          title={`Tổng đơn hàng (${selectedMonths} tháng)`}
          value={metrics.orders.current.toLocaleString("vi-VN")}
          subtext={`${formatChangePercent(
            metrics.orders.change_percent
          )} so với kỳ trước`}
          subtextColor={
            metrics.orders.change_percent >= 0
              ? "text-green-500"
              : "text-red-500"
          }
        />
        <StatCard
          title="Tổng sản phẩm"
          value={metrics.products.total.toLocaleString("vi-VN")}
          subtext={`${metrics.products.active.toLocaleString(
            "vi-VN"
          )} sản phẩm đang bán`}
        />
        <StatCard
          title="Tổng người dùng"
          value={metrics.users.total.toLocaleString("vi-VN")}
          subtext={`${formatChangePercent(metrics.users.change_percent)} (${
            metrics.users.new_users
          } người mới)`}
          subtextColor={
            metrics.users.change_percent >= 0
              ? "text-green-500"
              : "text-red-500"
          }
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Phân tích doanh thu & đơn hàng
        </h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                yAxisId="left"
                stroke="#8884d8"
                tickFormatter={(val) =>
                  new Intl.NumberFormat("vi-VN").format(val as number)
                }
              />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip
                formatter={(value, name) => [
                  name === "DoanhThu" ? formatPrice(value as number) : value,
                  name,
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="DoanhThu"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Đơn hàng"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
