import React from 'react';
import { useSeasonContext } from '@/context/SeasonContext';
import { useMemberScores } from '@/hooks/useMemberScores';
import { RankBadge } from '@/components/RankBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Users, Sparkles, Shield } from 'lucide-react';

export const IndividualLeaderboardPage: React.FC = () => {
  const { selectedSeason, selectedSeasonId } = useSeasonContext();
  const { leaderboard, loading } = useMemberScores(selectedSeasonId);

  if (loading) return <TableSkeleton />;

  // Top 3 for podium
  const top3 = leaderboard.slice(0, 3);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const podiumConfig = [
    { height: 'h-20', bg: 'from-slate-300/60 to-slate-400/40', border: 'border-slate-300', text: 'text-slate-500 dark:text-slate-400', label: '🥈 ثانياً', glow: '' },
    { height: 'h-28', bg: 'from-brand-gold-400/60 to-brand-gold-600/40', border: 'border-brand-gold-400', text: 'text-brand-gold-600 dark:text-brand-gold-400', label: '🥇 الأول', glow: 'ring-2 ring-brand-gold-400/30 shadow-brand-gold-400/20 shadow-lg' },
    { height: 'h-16', bg: 'from-amber-600/50 to-amber-700/30', border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-500', label: '🥉 ثالثاً', glow: '' },
  ];

  return (
    <div className="w-full space-y-10" dir="rtl">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-gold-500" />
            <span>ترتيب الأفراد</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            تصنيف أفراد موسم{' '}
            <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>{' '}
            حسب مجموع نقاط التقييم الفردي
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-brand-gold-500/10 text-brand-gold-500 border border-brand-gold-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{leaderboard.length} مشارك</span>
        </div>
      </div>

      {leaderboard.length > 0 ? (
        <>
          {/* ── Podium (Top 3) ── */}
          {top3.length >= 2 && (
            <div className="flex items-end justify-center gap-4 sm:gap-8 pt-6 pb-2">
              {podiumOrder.map((entry, podiumIdx) => {
                if (!entry) return null;
                const cfg = podiumConfig[podiumIdx];
                const initials = entry.teamMemberName.slice(0, 2);
                const isFirst = entry.rank === 1;

                return (
                  <div key={entry.teamMemberId} className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
                    {/* Avatar */}
                    <div className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl border-2 ${cfg.border} ${cfg.glow} bg-white dark:bg-brand-navy-900 ${cfg.text} transition-all`}>
                      {initials}
                      {isFirst && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl animate-bounce">👑</span>
                      )}
                    </div>

                    {/* Name & Team */}
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm font-extrabold ${isFirst ? 'text-brand-gold-600 dark:text-brand-gold-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {entry.teamMemberName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                        <Shield className="h-2.5 w-2.5" />
                        {entry.teamName}
                      </p>
                    </div>

                    {/* Score */}
                    <div className={`text-base sm:text-lg font-black ${cfg.text}`}>
                      {entry.totalScore} <span className="text-[10px] font-semibold text-slate-400">نقطة</span>
                    </div>

                    {/* Podium Stand */}
                    <div className={`w-full ${cfg.height} rounded-t-xl bg-gradient-to-b ${cfg.bg} border-t-2 border-x-2 ${cfg.border} flex items-center justify-center`}>
                      <span className="text-xl sm:text-2xl">{cfg.label.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Full Rankings Table ── */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span>الترتيب الكامل</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-brand-navy-800" />
            </h3>

            <div className="border border-slate-200 dark:border-brand-navy-800 rounded-2xl overflow-hidden bg-white dark:bg-brand-navy-950">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-5 w-14 text-center">#</th>
                    <th className="py-3.5 px-5">الفرد</th>
                    <th className="py-3.5 px-5">الفريق</th>
                    <th className="py-3.5 px-5 text-center">النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-sm">
                  {leaderboard.map((entry) => {
                    const initials = entry.teamMemberName.slice(0, 2);
                    const isTop3 = entry.rank <= 3;

                    return (
                      <tr
                        key={entry.teamMemberId}
                        className={`transition-colors ${
                          entry.rank === 1
                            ? 'bg-brand-gold-50/40 dark:bg-brand-gold-950/10 hover:bg-brand-gold-50/60'
                            : isTop3
                            ? 'bg-slate-50/50 dark:bg-brand-navy-900/30 hover:bg-slate-50 dark:hover:bg-brand-navy-900/40'
                            : 'hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/20'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center">
                            <RankBadge rank={entry.rank} />
                          </div>
                        </td>

                        {/* Member */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                              entry.rank === 1
                                ? 'bg-brand-gold-50 border-brand-gold-300 text-brand-gold-600 dark:bg-brand-gold-950/30 dark:border-brand-gold-700 dark:text-brand-gold-400'
                                : entry.rank === 2
                                ? 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-brand-navy-900 dark:border-brand-navy-700 dark:text-slate-400'
                                : entry.rank === 3
                                ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-500'
                                : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-brand-navy-900 dark:border-brand-navy-800 dark:text-slate-400'
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <span className={`font-extrabold block ${
                                entry.rank === 1 ? 'text-brand-gold-600 dark:text-brand-gold-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                {entry.teamMemberName}
                              </span>
                              {entry.rank === 1 && (
                                <span className="text-[10px] font-bold text-brand-gold-500 block">
                                  المتصدر الأول 🌟
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Team */}
                        <td className="py-4 px-5">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-brand-navy-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-brand-navy-800">
                            <Shield className="h-3 w-3 text-brand-gold-500" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.teamName}</span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-5 text-center">
                          <span className={`font-black text-xl ${
                            isTop3 ? 'text-brand-gold-500' : 'text-slate-700 dark:text-white'
                          }`}>
                            {entry.totalScore}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">نقطة</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title="لا يوجد تقييمات فردية بعد"
          description="لم تُسجَّل أي نقاط للأفراد في هذا الموسم حتى الآن. سيظهر الترتيب هنا فور بدء التقييم."
        />
      )}
    </div>
  );
};
