

import React from 'react';
// FIX: Changed import path to be explicit to avoid a path resolution conflict.
import type { Product } from '../../types/index';
import { EditIcon, DeleteIcon } from './AdminIcons';

interface ProductManagementProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, setProducts }) => {
    // For now, edit/delete will just be client-side
    const handleDelete = (productId: string) => {
        if(window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    }
    
    // In a real app, this would open a proper form modal for editing.
    const handleEdit = (product: Product) => {
        alert(`Chức năng chỉnh sửa cho "${product.name}" sắp ra mắt!`);
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
                <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold">
                    Thêm sản phẩm mới
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Sản phẩm</th>
                                <th scope="col" className="px-6 py-3">Danh mục</th>
                                <th scope="col" className="px-6 py-3">Giá cơ bản</th>
                                <th scope="col" className="px-6 py-3">Thương hiệu</th>
                                <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={product.imageUrls[0]} alt={product.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{product.category.name}</td>
                                    <td className="px-6 py-4 font-semibold">{formatPrice(product.basePrice)}</td>
                                    <td className="px-6 py-4">{product.brand.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center space-x-3">
                                            <button onClick={() => handleEdit(product)} className="text-slate-600 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors">
                                                <DeleteIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;