import React, { useState, useEffect } from 'react';
import { CloseIcon } from '@/components/icons';

interface AuthModalProps {
  initialView: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose, onLogin, onRegister, error, isLoading }) => {
  const [view, setView] = useState(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
      setView(initialView)
  }, [initialView])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (view === 'login') {
      onLogin(email, password);
    } else {
      onRegister(name, email, password);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">
            {view === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            {view === 'login' ? 'Đăng nhập để tiếp tục mua sắm' : 'Tham gia cùng AgentFashion ngay'}
          </p>

          <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
            <button onClick={() => setView('login')} className={`flex-1 py-2 font-medium transition-colors ${view === 'login' ? 'text-slate-600 dark:text-slate-300 border-b-2 border-slate-600 dark:border-slate-300' : 'text-gray-500 dark:text-gray-400'}`}>
              Đăng nhập
            </button>
            <button onClick={() => setView('register')} className={`flex-1 py-2 font-medium transition-colors ${view === 'register' ? 'text-slate-600 dark:text-slate-300 border-b-2 border-slate-600 dark:border-slate-300' : 'text-gray-500 dark:text-gray-400'}`}>
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">Họ và tên</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-600 text-white py-2.5 rounded-md font-semibold hover:bg-slate-700 transition-colors disabled:bg-gray-400 dark:hover:bg-slate-500 dark:disabled:bg-gray-600 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (view === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;