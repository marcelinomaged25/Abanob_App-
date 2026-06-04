import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-brand-navy-950 dark:text-slate-100 transition-colors duration-300 relative">
      {/* Dark-mode radial depth overlay */}
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(36,96,184,0.07) 0%, transparent 60%)' }} />
      <Header />
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10" dir="rtl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
