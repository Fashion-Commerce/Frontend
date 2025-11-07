
import React from 'react';
import { ShoppingCartIcon, UserIcon, HeartIcon, SunIcon, MoonIcon } from '@/components/icons';
import type { User } from '@/types';

interface HeaderProps {
  cartItemCount: number;
  wishlistItemCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onAuthClick: (view: 'login' | 'register') => void;
  onAdminClick: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, wishlistItemCount, onCartClick, onWishlistClick, currentUser, onLogout, onAuthClick, onAdminClick, theme, onThemeToggle }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200">AgentFashion</h1>
          <p className="ml-3 text-xs text-gray-500 dark:text-gray-400 hidden md:block">Multi-Agent Commerce with RAG</p>
        </div>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              {currentUser.email === 'admin@agentfashion.com' && (
                 <button onClick={onAdminClick} className="px-3 py-1.5 text-sm font-semibold text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800 transition-colors">
                    Admin Panel
                </button>
              )}
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-200 font-medium hidden sm:inline">Chào, {currentUser.fullname}</span>
              {/* FIX: Completed truncated className and button content. */}
              <button onClick={onLogout} className="text-sm text-gray-600 hover:text-slate-600 dark:text-gray-300 dark:hover:text-slate-100">Đăng xuất</button>
            </div>
          ) : (
             <div>
                <button onClick={() => onAuthClick('login')} className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Đăng nhập
                </button>
                <button onClick={() => onAuthClick('register')} className="ml-2 px-3 py-1.5 text-sm font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-700 dark:hover:bg-slate-500 transition-colors">
                    Đăng ký
                </button>
            </div>
          )}
           <div id="header-icons" className="flex items-center space-x-4">
                <button onClick={onThemeToggle} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700">
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
                <button onClick={onWishlistClick} className="relative text-gray-600 dark:text-gray-300 hover:text-slate-600 dark:hover:text-slate-100">
                    <HeartIcon className="h-6 w-6" />
                    {wishlistItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlistItemCount}</span>}
                </button>
                <button onClick={onCartClick} className="relative text-gray-600 dark:text-gray-300 hover:text-slate-600 dark:hover:text-slate-100">
                    <ShoppingCartIcon className="h-6 w-6" />
                    {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

// FIX: Added missing default export.
export default Header;
