import React from 'react';
import { useSeasonContext } from '@/context/SeasonContext';
import { useStandings } from '@/hooks/useStandings';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Trophy, Award, Medal, Crown } from 'lucide-react';

export const HallOfFamePage: React.FC = () => {
  const { selectedSeason, selectedSeasonId } = useSeasonContext();
  const { hallOfFame, loading } = useStandings(selectedSeasonId);

  // Helper for team initials avatars
  const renderAvatar = (name: string, logoUrl: string, sizeClass = 'h-14 w-14') => {
    const initials = name.replace('فريق ', '').slice(0, 2);
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center shiny-gold-border bg-brand-navy-900 shadow-md shrink-0`}>
        {logoUrl && !logoUrl.includes('default') ? (
          <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-black text-brand-gold-300 uppercase">{initials}</span>
        )}
      </div>
    );
  };

  if (loading) {
    return <TableSkeleton />;
  }

  const hasChampions = hallOfFame && (hallOfFame.bestTeamOverall || hallOfFame.categoryChampions.length > 0);

  return (
    <div className="w-full space-y-10 pb-12" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5.5 w-5.5 text-brand-gold-500 animate-float" />
            <span>لوحة الشرف وتتويج الأبطال</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            صالة تتويج وتكريم المجموعات المتصدرة وأبطال الفئات في <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20">
          <Crown className="h-3.5 w-3.5" />
          <span>قاعة الإكليل والمجد</span>
        </div>
      </div>

      {hasChampions ? (
        <div className="space-y-10">
          
          {/* 1. Best Team Overall - Large Trophy Card */}
          {hallOfFame.bestTeamOverall && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 border border-brand-gold-500/30 shadow-xl transition-all duration-300 dark:bg-brand-navy-950 max-w-4xl mx-auto shiny-gold-border animate-gold-glow">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold-950/20 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black bg-brand-gold-500 text-brand-navy-950">
                    <Crown className="h-3.5 w-3.5 animate-bounce-slow" />
                    <span>البطل العام المتصدر للموسم</span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-black shiny-gold-text">
                    {hallOfFame.bestTeamOverall.teamName}
                  </h3>
                  
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xl">
                    حصد الفريق كأس البطولة للمجموع التراكمي وتصدر بجدارة واستحقاق لوحة شرف دوري القديس أبانوب عن فئة المجموعات. هنيئاً لكم هذا المركز المرموق!
                  </p>

                  <div className="text-xs text-slate-300 font-bold">
                    مجموع درجات الفوز: <span className="text-brand-gold-400 text-lg font-black">{hallOfFame.bestTeamOverall.totalScore} نقطة</span>
                  </div>
                </div>

                {/* Left Visual Trophy Element */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="h-28 w-28 rounded-full bg-slate-950/50 border-4 border-brand-gold-400 flex items-center justify-center shadow-lg relative animate-float">
                    <Trophy className="h-16 w-16 text-brand-gold-400" />
                  </div>
                  <span className="text-[10px] font-black text-brand-gold-400 uppercase tracking-widest">🏆 BEST TEAM OVERALL</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Category Champions Grid */}
          {hallOfFame.categoryChampions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-brand-navy-800 pb-2">
                <Medal className="h-5 w-5 text-brand-gold-500" />
                <span>أبطال الفئات والتصنيفات</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hallOfFame.categoryChampions.map((champion) => {
                  const isPerfect = champion.scoreValue === champion.maxScore;

                  return (
                    <div 
                      key={champion.categoryId}
                      className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm dark:bg-brand-navy-900 dark:border-brand-navy-800 hover:shadow-md transition-shadow relative group"
                    >
                      <div className="absolute top-4 left-4">
                        <Award className={`h-6 w-6 text-brand-gold-400 ${isPerfect ? 'animate-pulse' : ''}`} />
                      </div>

                      <div>
                        {/* Subject category */}
                        <span className="text-[10px] font-black text-brand-gold-500 uppercase tracking-wider block mb-1">
                          بطولة فئة {champion.categoryName}
                        </span>

                        <div className="flex items-center gap-3 mt-3">
                          {renderAvatar(champion.teamName, champion.logoUrl, 'h-11 w-11')}
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                              {champion.teamName}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              حائز على درع الفئة التنافسية
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-brand-navy-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>أعلى مجموع درجات:</span>
                        <span className="text-brand-navy-600 dark:text-brand-gold-400 font-black">
                          {champion.scoreValue} من {champion.maxScore}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      ) : (
        <EmptyState 
          title="لوحة الشرف فارغة" 
          description="لا تتوفر أي إحصائيات بطل أو أبطال فئات لهذا الموسم بعد." 
        />
      )}

    </div>
  );
};
