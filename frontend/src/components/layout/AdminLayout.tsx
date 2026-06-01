import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from './AdminSidebar';
import { ShieldAlert, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-brand-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-brand-gold-400">جاري التحقق من الصلاحيات...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 transition-colors duration-300" dir="rtl">
      
      {/* Sidebar (Right-positioned in RTL) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Admin Header Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <ShieldAlert className="h-4.5 w-4.5 text-brand-gold-500" />
            <span className="text-xs font-bold">بوابة التحكم الإدارية</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-navy-50 text-brand-navy-700 dark:bg-brand-navy-900 dark:text-brand-gold-400">
              الموسم النشط حالياً
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-brand-navy-950 dark:text-slate-300 dark:hover:bg-brand-navy-900 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-brand-gold-400" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              أهلاً، <span className="text-slate-800 dark:text-white font-extrabold">{user?.fullName}</span>
            </div>
          </div>
        </header>

        {/* View Viewport */}
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
