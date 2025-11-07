
import React, { useState } from 'react';
// FIX: Changed import path to be explicit to avoid a path resolution conflict.
import type { Product, ChatMessage } from '../../types/index';
import { DashboardIcon, ProductsIcon, ChatIcon, LogoutIcon, SettingsIcon, AnalyticsIcon } from './AdminIcons';
import DashboardOverview from './DashboardOverview';
import ProductManagement from './ProductManagement';
import ChatLogs from './ChatLogs';
import AgentManagement from './AgentManagement';
import Analytics from './Analytics';


type AdminView = 'dashboard' | 'products' | 'chat' | 'agents' | 'analytics';

interface AdminDashboardProps {
    onExitAdmin: () => void;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    chatMessages: ChatMessage[];
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-md ${isActive ? 'bg-slate-700 text-white' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}>
        {icon}
        <span className="mx-4 font-medium">{label}</span>
    </button>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin, products, setProducts, chatMessages }) => {
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardOverview products={products} />;
            case 'products':
                return <ProductManagement products={products} setProducts={setProducts} />;
            case 'chat':
                return <ChatLogs messages={chatMessages} />;
            case 'agents':
                return <AgentManagement />;
            case 'analytics':
                return <Analytics />;
            default:
                return <DashboardOverview products={products} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <div className="flex flex-col w-64 bg-slate-900 text-white">
                <div className="flex items-center justify-center h-20 border-b border-slate-700">
                    <h1 className="text-2xl font-bold text-white">AgentFashion</h1>
                </div>
                <div className="flex flex-col flex-grow p-4 space-y-2">
                    <nav className="flex-grow">
                        <NavItem label="Bảng điều khiển" icon={<DashboardIcon className="w-6 h-6" />} isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
                        <NavItem label="Sản phẩm" icon={<ProductsIcon className="w-6 h-6" />} isActive={currentView === 'products'} onClick={() => setCurrentView('products')} />
                        <NavItem label="Lịch sử Chat" icon={<ChatIcon className="w-6 h-6" />} isActive={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
                        <NavItem label="Quản lý Agents" icon={<SettingsIcon className="w-6 h-6" />} isActive={currentView === 'agents'} onClick={() => setCurrentView('agents')} />
                        <NavItem label="Phân tích" icon={<AnalyticsIcon className="w-6 h-6" />} isActive={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
                    </nav>
                     <div className="mt-auto">
                        <button onClick={onExitAdmin} className="flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-md text-gray-400 hover:bg-slate-700 hover:text-white">
                            <LogoutIcon className="w-6 h-6"/>
                            <span className="mx-4 font-medium">Quay lại cửa hàng</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 p-8 overflow-y-auto">
                {renderView()}
            </main>
        </div>
    );
};

export default AdminDashboard;