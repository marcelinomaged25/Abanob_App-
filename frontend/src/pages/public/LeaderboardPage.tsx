import React from 'react';
import { useSeasonContext } from '@/context/SeasonContext';
import { useStandings } from '@/hooks/useStandings';
import { RankBadge } from '@/components/RankBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { 
  TrendingUp, TrendingDown, Minus, 
  Sparkles, Zap 
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { selectedSeason, selectedSeasonId } = useSeasonContext();
  const { leaderboard, loading } = useStandings(selectedSeasonId);

  // Helper to render movement badges
  const renderMovement = (movement: 'Up' | 'Down' | 'None') => {
    if (movement === 'Up') {
      return (
        <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/30">
          <TrendingUp className="h-3 w-3" />
          <span>ارتفع</span>
        </div>
      );
    }
    if (movement === 'Down') {
      return (
        <div className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/10 px-2 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-900/30 animate-pulse">
          <TrendingDown className="h-3 w-3" />
          <span>تراجع</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-brand-navy-900 px-2 py-0.5 rounded-full">
        <Minus className="h-3 w-3" />
        <span>مستقر</span>
      </div>
    );
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5.5 w-5.5 text-brand-gold-500 animate-pulse" />
            <span>لوحة المتصدرين وحركة المراكز</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول المتصدرين المباشر لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span> يوضح حركة صعود وهبوط المراكز مقارنة بآخر تقييم.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>تحديث تلقائي للمراكز</span>
        </div>
      </div>

      {/* Leaderboard Entries List */}
      {leaderboard.length > 0 ? (
        <div className="max-w-3xl mx-auto space-y-3">
          {leaderboard.map((entry) => {
            const initials = entry.teamName.replace('فريق ', '').slice(0, 2);

            return (
              <div 
                key={entry.teamId}
                className={`p-4 bg-white border rounded-2xl flex items-center justify-between shadow-sm dark:bg-brand-navy-900 dark:border-brand-navy-800 hover:scale-[1.01] transition-transform duration-200 ${
                  entry.rank === 1 ? 'border-brand-gold-400 dark:border-brand-gold-500 bg-brand-gold-50/10 dark:bg-brand-gold-950/5' : ''
                }`}
              >
                {/* Left (RTL): Rank and Name */}
                <div className="flex items-center gap-4">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <RankBadge rank={entry.rank} />
                  </div>
                  
                  {/* Logo / Initials */}
                  <div className={`h-11 w-11 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center border font-extrabold text-xs shrink-0 shadow-sm ${
                    entry.rank === 1 ? 'border-brand-gold-400 text-brand-gold-400 ring-2 ring-brand-gold-500/20 bg-brand-navy-950' : 'border-slate-200 dark:border-brand-navy-800 text-slate-500'
                  }`}>
                    {entry.logoUrl && !entry.logoUrl.includes('default') ? (
                      <img src={entry.logoUrl} alt={entry.teamName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-extrabold truncate ${
                      entry.rank === 1 ? 'shiny-gold-text text-base' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {entry.teamName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      الترتيب الحالي: #{entry.rank} في الدوري
                    </span>
                  </div>
                </div>

                {/* Right: Score and Movement */}
                <div className="flex items-center gap-5 sm:gap-8">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-black block text-right">إجمالي النقاط</span>
                    <span className={`text-lg font-black tracking-tight ${
                      entry.rank === 1 ? 'text-brand-gold-500 text-xl' : 'text-brand-navy-600 dark:text-slate-200'
                    }`}>
                      {entry.totalScore}
                    </span>
                  </div>
                  <div className="w-20 flex justify-end shrink-0">
                    {renderMovement(entry.movement)}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="لوحة المتصدرين فارغة" 
          description="لا تتوفر أي نتائج أو تصنيفات لهذا الموسم لعرض لوحة المتصدرين حالياً." 
        />
      )}

    </div>
  );
};
