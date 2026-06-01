import React from 'react';

export const Shimmer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`bg-slate-200 dark:bg-brand-navy-900 animate-pulse rounded ${className}`} />
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4" dir="rtl">
      <div className="flex justify-between items-center gap-4">
        <Shimmer className="h-10 w-48 rounded-xl" />
        <Shimmer className="h-10 w-32 rounded-xl" />
      </div>
      <div className="border border-slate-200 dark:border-brand-navy-800 rounded-2xl overflow-hidden bg-white dark:bg-brand-navy-950">
        <div className="bg-slate-50 dark:bg-brand-navy-900 h-12 flex items-center px-6">
          <Shimmer className="h-4 w-1/4" />
          <Shimmer className="h-4 w-1/4 mr-auto" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 h-8">
              <Shimmer className="h-6 w-8 rounded-full" />
              <Shimmer className="h-4 w-1/3" />
              <Shimmer className="h-4 w-12 mr-auto" />
              <Shimmer className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-8 w-8 rounded-xl" />
          </div>
          <Shimmer className="h-8 w-16 mt-2" />
          <Shimmer className="h-3 w-32 mt-1" />
        </div>
      ))}
    </div>
  );
};

export const GridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Shimmer className="h-12 w-12 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-brand-navy-800">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
