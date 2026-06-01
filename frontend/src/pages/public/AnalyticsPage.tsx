import React, { useMemo } from 'react';
import { useSeasonContext } from '@/context/SeasonContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AchievementBadge } from '@/components/AchievementBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { BarChart3, Award, Sparkles, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { selectedSeason, selectedSeasonId } = useSeasonContext();
  const { analytics, loading } = useAnalytics(selectedSeasonId);

  // Format data for Category Averages Bar Chart
  const categoryAveragesData = useMemo(() => {
    if (!analytics || !analytics.categoryAverages) return [];
    return analytics.categoryAverages.map((cat) => ({
      name: cat.categoryName,
      'متوسط الدرجة': Math.round(cat.averageScore * 10) / 10,
      'الحد الأقصى': cat.maxScore,
    }));
  }, [analytics]);

  // Format data for Team Score Distribution (Stacked Bar Chart)
  const teamScoreDistributionData = useMemo(() => {
    if (!analytics || !analytics.teamScoreDistributions) return [];
    return analytics.teamScoreDistributions.map((team) => {
      const row: Record<string, any> = {
        name: team.teamName,
      };
      team.scores.forEach((s) => {
        row[s.categoryName] = s.scoreValue;
      });
      return row;
    });
  }, [analytics]);

  const categoriesList = useMemo(() => {
    if (!analytics || !analytics.categoryAverages) return [];
    return analytics.categoryAverages.map((c) => c.categoryName);
  }, [analytics]);

  if (loading) {
    return <TableSkeleton />;
  }

  const hasData = analytics && (
    analytics.highestScoringTeam || 
    analytics.categoryAverages.length > 0 || 
    analytics.teamScoreDistributions.length > 0
  );

  return (
    <div className="w-full space-y-10 pb-12" dir="rtl">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>لوحة التحليلات والمؤشرات البيانية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            مخططات إحصائية متكاملة لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span> لتحليل أداء الفرق ومستويات الصعوبة.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>تحليلات ذكية للمسابقات</span>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-10">
          
          {/* 1. Summary Badges Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {analytics.highestScoringTeam && (
              <AchievementBadge
                type="highest"
                title="الفريق الأعلى تقييماً"
                subtitle={analytics.highestScoringTeam.teamName}
                valueText={`مجموع درجات: ${analytics.highestScoringTeam.value}`}
              />
            )}

            {analytics.lowestScoringTeam && (
              <AchievementBadge
                type="lowest"
                title="الفريق الأكثر احتياجاً للدعم التشجيعي"
                subtitle={analytics.lowestScoringTeam.teamName}
                valueText={`مجموع درجات: ${analytics.lowestScoringTeam.value}`}
              />
            )}

            {analytics.mostConsistentTeam && (
              <AchievementBadge
                type="consistent"
                title="الأكثر ثباتاً واستقراراً"
                subtitle={analytics.mostConsistentTeam.teamName}
                valueText="أقل تشتت وفروقات في درجات الفئات"
              />
            )}

            {analytics.strongestCategory && (
              <AchievementBadge
                type="strongest"
                title="الفئة الأعلى أداءً (متوسط المجموعات)"
                subtitle={analytics.strongestCategory.categoryName}
                valueText={`متوسط درجات: ${analytics.strongestCategory.value}%`}
              />
            )}

            {analytics.mostCompetitiveCategory && (
              <AchievementBadge
                type="competitive"
                title="الفئة الأكثر تنافسية وصعوبة"
                subtitle={analytics.mostCompetitiveCategory.categoryName}
                valueText="أعلى تقارب درجات وتنافسية بين المجموعات"
              />
            )}

          </section>

          {/* 2. Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart A: Category Averages */}
            {categoryAveragesData.length > 0 && (
              <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-brand-gold-500" />
                  <span>متوسط الدرجات لكل فئة</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  يوضح الرسم البياني متوسط النقاط التي حصدتها جميع الفرق في كل فئة، مما يشير لمدى تفوق أو صعوبة المادة.
                </p>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryAveragesData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-brand-navy-800" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="متوسط الدرجة" fill="#0b2a5b" radius={[4, 4, 0, 0]} className="dark:fill-brand-gold-500" />
                      <Bar dataKey="الحد الأقصى" fill="#cbd5e1" radius={[4, 4, 0, 0]} className="dark:fill-brand-navy-850" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart B: Stacked Scores Distribution */}
            {teamScoreDistributionData.length > 0 && (
              <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-brand-gold-400" />
                  <span>توزيع مساهمة الفئات في درجات الفرق</span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  تحليل توزيع درجات كل فريق فئة بفئة، موضحاً مصادر تفوق كل مجموعة.
                </p>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamScoreDistributionData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-brand-navy-800" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      
                      {/* Stacked bars for each category */}
                      {categoriesList.map((catName, index) => {
                        // Pick beautiful curated palette of HSL colors for stack
                        const colors = ['#0b2a5b', '#d4af37', '#0f766e', '#7c2d12', '#4338ca', '#be123c', '#b45309'];
                        const color = colors[index % colors.length];
                        return (
                          <Bar 
                            key={catName} 
                            dataKey={catName} 
                            stackId="a" 
                            fill={color} 
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </section>

        </div>
      ) : (
        <EmptyState 
          title="لا توجد تحليلات كافية" 
          description="يرجى إدخال درجات كافية للفرق في فئات المسابقات المختلفة لحساب وعرض التحليلات الذكية للموسم." 
        />
      )}

    </div>
  );
};
