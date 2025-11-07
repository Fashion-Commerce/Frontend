
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// FIX: Changed import path to be explicit to avoid a path resolution conflict.
import type { Product } from '../../types/index';

interface DashboardOverviewProps {
    products: Product[];
}

// Mock data for the chart
const salesData = [
  { name: '7 ngày trước', DoanhThu: 4000000, "Đơn hàng": 24 },
  { name: '6 ngày trước', DoanhThu: 3000000, "Đơn hàng": 13 },
  { name: '5 ngày trước', DoanhThu: 2000000, "Đơn hàng": 58 },
  { name: '4 ngày trước', DoanhThu: 2780000, "Đơn hàng": 39 },
  { name: '3 ngày trước', DoanhThu: 1890000, "Đơn hàng": 48 },
  { name: 'Hôm qua', DoanhThu: 2390000, "Đơn hàng": 38 },
  { name: 'Hôm nay', DoanhThu: 3490000, "Đơn hàng": 43 },
];

const StatCard: React.FC<{ title: string; value: string; subtext: string;}> = ({ title, value, subtext }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        <p className="text-xs text-green-500 mt-1">{subtext}</p>
    </div>
);


const DashboardOverview: React.FC<DashboardOverviewProps> = ({ products }) => {
    
    const totalRevenue = salesData.reduce((acc, item) => acc + item.DoanhThu, 0);
    const totalOrders = salesData.reduce((acc, item) => acc + item["Đơn hàng"], 0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Bảng điều khiển AgentFashion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng doanh thu (7 ngày)" value={formatPrice(totalRevenue)} subtext="+5.4% so với tuần trước" />
                <StatCard title="Tổng đơn hàng (7 ngày)" value={totalOrders.toLocaleString('vi-VN')} subtext="+2.1% so với tuần trước" />
                <StatCard title="Tổng sản phẩm" value={products.length.toString()} subtext="Sản phẩm đang bán" />
                <StatCard title="Tổng người dùng" value="128" subtext="+12 người dùng mới" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Phân tích doanh thu</h3>
                 <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" stroke="#8884d8" tickFormatter={(val) => new Intl.NumberFormat('vi-VN').format(val as number)}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip formatter={(value, name) => [name === 'DoanhThu' ? formatPrice(value as number) : value, name]}/>
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="DoanhThu" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line yAxisId="right" type="monotone" dataKey="Đơn hàng" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;