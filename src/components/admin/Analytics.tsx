import React from 'react';

const Analytics: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Phân tích & Thống kê</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Báo cáo hiệu suất Agent</h3>
                <p className="text-gray-600">
                    Biểu đồ và số liệu chi tiết về hiệu suất của từng agent (tỷ lệ phản hồi thành công, các truy vấn phổ biến, v.v.) sẽ được hiển thị ở đây.
                </p>
                <div className="mt-6 h-64 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-400">Biểu đồ sắp ra mắt</p>
                </div>
            </div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Phân tích ý định người dùng</h3>
                <p className="text-gray-600">
                    Phân tích các câu hỏi và yêu cầu phổ biến từ người dùng để cải thiện chất lượng dịch vụ và sản phẩm.
                </p>
                 <div className="mt-6 h-64 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-400">Biểu đồ sắp ra mắt</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
