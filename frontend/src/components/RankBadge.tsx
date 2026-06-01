import React from 'react';
import { Medal } from 'lucide-react';

interface RankBadgeProps {
  rank: number;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 animate-pulse-glow">
        <Medal className="h-3.5 w-3.5 text-amber-500 fill-current animate-bounce-slow" />
        الذهبي
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/80">
        <Medal className="h-3.5 w-3.5 text-slate-400 fill-current" />
        الفضي
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-900/30">
        <Medal className="h-3.5 w-3.5 text-orange-600 fill-current" />
        البرونزي
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 dark:bg-brand-navy-900 dark:text-slate-400 border border-slate-200 dark:border-brand-navy-800">
      {rank}
    </div>
  );
};
