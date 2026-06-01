import React from 'react';
import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

interface PodiumDisplayProps {
  topTeams: LeaderboardEntry[];
}

export const PodiumDisplay: React.FC<PodiumDisplayProps> = ({ topTeams }) => {
  const first = topTeams.find((t) => t.rank === 1);
  const second = topTeams.find((t) => t.rank === 2);
  const third = topTeams.find((t) => t.rank === 3);

  // Helper to render team initial avatars if logo fails
  const renderAvatar = (name: string, logoUrl: string, sizeClass = 'h-14 w-14') => {
    const initials = name.replace('فريق ', '').slice(0, 2);
    return (
      <div className={`relative ${sizeClass} rounded-full overflow-hidden flex items-center justify-center shiny-gold-border bg-brand-navy-900 shadow-md`}>
        {logoUrl && !logoUrl.includes('default') ? (
          <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-extrabold text-brand-gold-300 uppercase">{initials}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex items-end justify-center gap-4 sm:gap-6 pt-12 pb-6 px-4" dir="rtl">
      
      {/* 2nd Place Card (Right in RTL) */}
      {second && (
        <div className="flex flex-col items-center flex-1 max-w-[150px] sm:max-w-[180px] animate-slide-up">
          {renderAvatar(second.teamName, second.logoUrl, 'h-14 w-14 sm:h-16 sm:w-16')}
          <span className="mt-3 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 text-center truncate w-full">
            {second.teamName}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
            {second.totalScore} نقطة
          </span>
          {/* Podium block */}
          <div className="w-full mt-4 h-24 sm:h-28 bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700/60 rounded-t-2xl shadow-lg border border-slate-300/40 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm shadow-inner">
              ٢
            </div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">المركز الثاني</span>
          </div>
        </div>
      )}

      {/* 1st Place Card (Middle - Tallest) */}
      {first && (
        <div className="flex flex-col items-center flex-1 max-w-[160px] sm:max-w-[200px] z-10 -translate-y-4 sm:-translate-y-6 animate-float">
          {/* Crown */}
          <Crown className="h-6 w-6 text-brand-gold-400 fill-current mb-1 animate-bounce-slow" />
          {renderAvatar(first.teamName, first.logoUrl, 'h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-brand-gold-400')}
          <span className="mt-3 text-sm sm:text-base font-black text-slate-900 dark:text-white text-center truncate w-full shiny-gold-text">
            {first.teamName}
          </span>
          <span className="text-xs font-extrabold text-brand-gold-500">
            {first.totalScore} نقطة
          </span>
          {/* Podium block */}
          <div className="w-full mt-4 h-32 sm:h-36 bg-gradient-to-t from-brand-gold-500 to-brand-gold-400 rounded-t-2xl shadow-xl border border-brand-gold-400/30 flex flex-col items-center justify-center gap-1.5 animate-gold-glow">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy-900 border-2 border-brand-gold-400 text-brand-gold-300 font-black text-lg shadow-md">
              ١
            </div>
            <span className="text-xs font-black text-brand-navy-950">البطل المتصدر</span>
          </div>
        </div>
      )}

      {/* 3rd Place Card (Left in RTL) */}
      {third && (
        <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-[170px] animate-slide-up">
          {renderAvatar(third.teamName, third.logoUrl, 'h-12 w-12 sm:h-14 sm:w-14')}
          <span className="mt-3 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 text-center truncate w-full">
            {third.teamName}
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
            {third.totalScore} نقطة
          </span>
          {/* Podium block */}
          <div className="w-full mt-4 h-18 sm:h-22 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-2xl shadow-md border border-amber-800/30 flex flex-col items-center justify-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-900 border-2 border-amber-600 text-amber-300 font-extrabold text-xs shadow-inner">
              ٣
            </div>
            <span className="text-[10px] font-black text-amber-200">المركز الثالث</span>
          </div>
        </div>
      )}

    </div>
  );
};
