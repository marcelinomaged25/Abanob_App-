import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  actionButton 
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-brand-navy-900 border border-dashed border-slate-200 dark:border-brand-navy-800 rounded-2xl shadow-sm max-w-md mx-auto animate-fade-in" dir="rtl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold-50 dark:bg-brand-gold-950/20 text-brand-gold-500 mb-4 animate-pulse">
        <Database className="h-6 w-6" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 max-w-xs">
        {description}
      </p>
      {actionButton && <div className="animate-scale-in">{actionButton}</div>}
    </div>
  );
};
