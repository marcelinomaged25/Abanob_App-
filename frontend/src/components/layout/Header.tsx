import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useSeasonContext } from '@/context/SeasonContext';
import { 
  Sun, Moon, LogIn, LayoutDashboard, LogOut, 
  Menu, X, Calendar, Activity, BarChart2, Award, Users, Trophy 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { seasons, selectedSeasonId, setSelectedSeasonId } = useSeasonContext();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const publicNavLinks = [
    { name: 'الرئيسية', path: '/', icon: Trophy },
    { name: 'جدول الترتيب', path: '/standings', icon: Calendar },
    { name: 'ترتيب الأفراد', path: '/members', icon: Users },
    { name: 'مباشر', path: '/live', icon: Activity },
    { name: 'لوحة الشرف', path: '/hall-of-fame', icon: Award },
    { name: 'التحليلات والرسوم', path: '/analytics', pathBase: '/analytics', icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-gold-100/40 bg-white/85 backdrop-blur-md dark:border-brand-gold-500/10 dark:bg-brand-navy-950/92 transition-colors duration-300 shadow-[0_2px_12px_rgba(201,147,29,0.04)] dark:shadow-[0_2px_16px_rgba(201,147,29,0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" dir="rtl">
        
        {/* Left Side: Brand Logo and Title */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/abanob-icon.png" alt="القديس أبانوب" className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-gold-400/50 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-brand-navy-900 dark:text-white sm:text-xl">
                دوري القديس أبانوب
              </span>
              <span className="text-xs font-medium text-brand-gold-500 tracking-wider">
                PREMIER LEAGUE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {publicNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'bg-brand-navy-50 text-brand-navy-700 dark:bg-brand-navy-900/50 dark:text-brand-gold-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Options & Actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Season Selector */}
          {seasons.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-brand-navy-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-brand-navy-800">
              <Calendar className="h-4 w-4 text-brand-gold-500" />
              <select
                value={selectedSeasonId}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 border-none pr-1 focus:ring-0 focus:outline-none cursor-pointer"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id} className="dark:bg-brand-navy-900 dark:text-white">
                    {season.name} {season.isActive ? '🚩' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-brand-navy-900 dark:text-slate-300 dark:hover:bg-brand-navy-800 cursor-pointer"
            title={theme === 'dark' ? 'الوضع المضيء' : 'الوضع المظلم'}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-brand-gold-400 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5 text-brand-navy-800" />}
          </button>

          {/* Admin / Login Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-navy-900 text-brand-gold-300 hover:bg-brand-navy-800 dark:bg-brand-gold-500 dark:text-brand-navy-950 dark:hover:bg-brand-gold-400 transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                لوحة التحكم
              </Link>
              <button
                onClick={logoutUser}
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-extrabold border border-brand-gold-400 text-brand-navy-900 dark:text-white hover:bg-brand-gold-500 hover:text-brand-navy-950 dark:hover:text-brand-navy-950 transition-all duration-300"
            >
              <LogIn className="h-3.5 w-3.5" />
              تسجيل الدخول
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-brand-gold-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-brand-navy-950 px-4 py-4 space-y-3 shadow-lg" dir="rtl">
          {/* Season Selector for Mobile */}
          {seasons.length > 0 && (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-brand-navy-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-brand-navy-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">الموسم الحالي</span>
              <select
                value={selectedSeasonId}
                onChange={(e) => {
                  setSelectedSeasonId(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {publicNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-brand-navy-50 text-brand-navy-700 dark:bg-brand-navy-900 dark:text-brand-gold-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth Button for Mobile */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold bg-brand-gold-500 text-brand-navy-950"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم الادارية
                </Link>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-900/10 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-bold border border-brand-gold-400 text-brand-navy-900 dark:text-white"
              >
                <LogIn className="h-4 w-4" />
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
