import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Calendar, Users, ListPlus, 
  FileText, History, LogOut, ArrowLeftRight 
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();

  const isLinkActive = (path: string) => location.pathname === path;

  const sidebarLinks = [
    { name: 'لوحة التحكم العامة', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'إدارة المواسم', path: '/admin/seasons', icon: Calendar },
    { name: 'إدارة الفرق', path: '/admin/teams', icon: Users },
    { name: 'إدارة الفئات', path: '/admin/categories', icon: ListPlus },
    { name: 'إدخال ومصفوفة الدرجات', path: '/admin/scores', icon: FileText },
    { name: 'تقييم الأفراد', path: '/admin/member-scores', icon: Users },
    { name: 'سجل العمليات (Audit)', path: '/admin/audit-logs', icon: History, superAdminOnly: true },
  ];

  const filteredLinks = sidebarLinks.filter(
    (link) => !link.superAdminOnly || user?.role === 'SuperAdmin'
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-l border-slate-800 dark:bg-brand-navy-950 transition-colors" dir="rtl">
      
      {/* Upper Content */}
      <div className="flex flex-col">
        
        {/* Admin Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg shiny-gold-bg text-brand-navy-950 flex items-center justify-center font-extrabold text-sm">
              أ
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-white">لوحة الإدارة</span>
              <span className="text-[10px] text-brand-gold-400 font-bold tracking-wider">ABANOB ADMIN</span>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 bg-slate-950/30 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-gold-500 text-brand-navy-950 flex items-center justify-center font-extrabold text-sm">
              {user?.fullName?.charAt(0) || 'أ'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user?.fullName || 'أدمن النظام'}</span>
              <span className="text-[10px] text-brand-gold-400 font-semibold uppercase">{user?.role === 'SuperAdmin' ? 'سوبر أدمن' : 'أدمن'}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="px-3 space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-brand-gold-500 text-brand-navy-950'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        
        {/* Back to Public Site */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0 text-brand-gold-400" />
          العودة للموقع العام
        </Link>

        {/* Logout Button */}
        <button
          onClick={logoutUser}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          تسجيل الخروج
        </button>

      </div>

    </aside>
  );
};
