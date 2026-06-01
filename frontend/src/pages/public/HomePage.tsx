import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSeasonContext } from '@/context/SeasonContext';
import { useStandings } from '@/hooks/useStandings';
import { PodiumDisplay } from '@/components/PodiumDisplay';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { StatsSkeleton } from '@/components/LoadingSkeleton';
import { Trophy, Calendar, Sparkles, ChevronLeft } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { selectedSeason, selectedSeasonId, loading: seasonLoading } = useSeasonContext();
  const { leaderboard, quickStats, loading: standingsLoading } = useStandings(selectedSeasonId);

  const isLoading = seasonLoading || standingsLoading;

  return (
    <div className="w-full space-y-12 pb-12" dir="rtl">
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl transition-all duration-300 dark:bg-brand-navy-950">
        
        {/* Decorative Grid / Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold-950/15 via-brand-navy-900/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex-1 space-y-4 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>دوري القديس أبانوب للشباب</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              أهلاً بكم في <br />
              <span className="shiny-gold-text">دوري القديس أبانوب الممتاز</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
              منصة التقييم والترتيب الرسمية لبطولات كنيستنا العامرة. نهدف لخلق روح المنافسة الشريفة والنمو الروحي والفكري المستمر. تابع لحظة بلحظة الترتيب، النقاط، ومصفوفة درجات جميع المجموعات والفرق.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <RouterLink
                to="/standings"
                className="inline-flex h-10 items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold bg-brand-gold-500 text-brand-navy-950 rounded-xl hover:bg-brand-gold-400 shadow-lg hover:shadow-brand-gold-500/10 transition-all cursor-pointer"
              >
                <span>عرض جدول الترتيب الكامل</span>
                <ChevronLeft className="h-4 w-4" />
              </RouterLink>
              <RouterLink
                to="/live"
                className="inline-flex h-10 items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>متابعة مصفوفة المباشر</span>
              </RouterLink>
            </div>
          </div>

          {/* Right Icon Shield Showcase */}
          <div className="flex-shrink-0 flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 rounded-3xl bg-slate-950/40 border border-slate-800/80 shadow-inner relative animate-float">
            <Trophy className="h-20 w-20 sm:h-28 sm:w-28 text-brand-gold-500/80 filter drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
          </div>

        </div>
      </section>

      {/* Selected Season Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-gold-500" />
            <span>إحصائيات ومنصة التتويج</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            النتائج والتصنيفات المعروضة أدناه خاصة بـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name || 'الموسم المحدد'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-brand-navy-900 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
          <Calendar className="h-4 w-4 text-brand-gold-500" />
          <span>تاريخ البدء: {selectedSeason ? new Date(selectedSeason.startDate).toLocaleDateString('ar-EG') : '-'}</span>
        </div>
      </div>

      {/* Quick Stats Panel */}
      {isLoading ? (
        <StatsSkeleton />
      ) : quickStats ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">الفرق المشاركة</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center font-extrabold">
                👥
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                <AnimatedCounter end={quickStats.totalTeams} />
              </span>
              <p className="text-[10px] text-slate-400 mt-1">فريق شبابي يتنافس على الصدارة</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">فئات التقييم</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center font-extrabold">
                📝
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                <AnimatedCounter end={quickStats.totalCategories} />
              </span>
              <p className="text-[10px] text-slate-400 mt-1">ألحان، طقس، ثقافة، والتزام</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">المتصدر الحالي</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center font-extrabold">
                👑
              </div>
            </div>
            <div className="mt-4">
              <span className="text-md sm:text-lg font-black text-amber-600 dark:text-brand-gold-400 truncate block">
                {quickStats.leadingTeamName || 'لا يوجد فرق بعد'}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">صاحب أعلى نقاط تراكمية حالياً</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">أعلى درجة مسجلة</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center font-extrabold">
                ✨
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                <AnimatedCounter end={quickStats.highestTotalScore} />
              </span>
              <p className="text-[10px] text-slate-400 mt-1">أعلى نقاط حصل عليها فريق</p>
            </div>
          </div>

        </section>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400">لا يوجد إحصائيات متوفرة لهذا الموسم حالياً.</span>
        </div>
      )}

      {/* Podium PodiumDisplay Section */}
      {leaderboard.length > 0 && (
        <section className="bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg font-black shiny-gold-text">منصة التتويج الممتازة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              تكريم الفرق الثلاثة الأولى المتصدرة لمجموع الدرجات التراكمية في البطولة الحالية.
            </p>
          </div>
          <PodiumDisplay topTeams={leaderboard} />
        </section>
      )}

      {/* Action cards for other public sub-sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between dark:bg-brand-navy-900 dark:border-brand-navy-800">
          <div className="space-y-2">
            <span className="text-2xl">📊</span>
            <h3 className="text-base font-black text-slate-800 dark:text-white">جدول الترتيب والمصفوفة الكاملة</h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              تصفح جدول ترتيب الفرق بطريقة ممتعة وقم بتصفية وترتيب النتائج حسب كل فئة تقييم، مع توفير خيارات التصدير المباشر لملفات PDF وتقارير Excel.
            </p>
          </div>
          <RouterLink
            to="/standings"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy-500 hover:text-brand-navy-700 dark:text-brand-gold-400 dark:hover:text-brand-gold-300"
          >
            <span>انتقل إلى جدول الترتيب</span>
            <ChevronLeft className="h-4 w-4" />
          </RouterLink>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between dark:bg-brand-navy-900 dark:border-brand-navy-800">
          <div className="space-y-2">
            <span className="text-2xl">📈</span>
            <h3 className="text-base font-black text-slate-800 dark:text-white">التحليلات والمؤشرات البيانية</h3>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              استكشف الرسوم البيانية الدائرية ومخططات الرادار لتحليل أداء كل فريق عبر كل فئات المسابقة، والتعرف على الفريق الأكثر استقراراً وصاحب الفئة الأقوى.
            </p>
          </div>
          <RouterLink
            to="/analytics"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy-500 hover:text-brand-navy-700 dark:text-brand-gold-400 dark:hover:text-brand-gold-300"
          >
            <span>افتح صفحة الرسوم والتحليلات</span>
            <ChevronLeft className="h-4 w-4" />
          </RouterLink>
        </div>

      </section>

    </div>
  );
};
