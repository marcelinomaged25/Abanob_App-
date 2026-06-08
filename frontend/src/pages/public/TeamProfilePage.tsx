import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScoresByTeam } from '@/services/scoreService';
import { getTeamProfile } from '@/services/teamService';
import { useSeasonContext } from '@/context/SeasonContext';
import { RadarChart } from '@/components/RadarChart';
import { ScoreProgressBar } from '@/components/ScoreProgressBar';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import type { TeamProfile, Score } from '@/types';
import { ChevronRight, MessageSquare, Award, FileText, Users } from 'lucide-react';

export const TeamProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedSeason } = useSeasonContext();

  const [team, setTeam] = useState<TeamProfile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [teamData, scoresData] = await Promise.all([
          getTeamProfile(id),
          getScoresByTeam(id),
        ]);
        setTeam(teamData);
        setScores(scoresData);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تحميل بيانات الفريق');
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [id]);

  const totalScore = team?.totalScore ?? scores.reduce((sum, s) => sum + s.scoreValue, 0);

  const radarData = scores.map((s) => {
    const percentage = s.maxScore > 0 ? (s.scoreValue / s.maxScore) * 100 : 0;
    return {
      subject: s.categoryName,
      A: Math.round(percentage),
      fullMark: 100,
    };
  });

  if (loading) {
    return <TableSkeleton />;
  }

  if (error || !team) {
    return (
      <div className="w-full text-center py-16" dir="rtl">
        <EmptyState
          title="فشل تحميل البيانات"
          description={error || 'لم نعثر على الفريق المطلوب في قاعدة البيانات.'}
          actionButton={
            <Link to="/standings" className="inline-flex h-9 items-center justify-center px-4 rounded-xl text-xs font-bold bg-brand-navy-950 text-white">
              العودة لجدول الترتيب
            </Link>
          }
        />
      </div>
    );
  }

  const initials = team.name.replace('فريق ', '').slice(0, 2);

  return (
    <div className="w-full space-y-8 pb-12" dir="rtl">
      <div className="flex items-center">
        <Link
          to="/standings"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
          <span>العودة إلى ترتيب الفرق</span>
        </Link>
      </div>

      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden dark:bg-brand-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold-950/10 via-brand-navy-900/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-950/40 border-2 border-brand-gold-400 overflow-hidden flex items-center justify-center font-extrabold text-2xl text-brand-gold-300 shadow-lg shrink-0 animate-scale-in">
            {team.logoUrl && !team.logoUrl.includes('default') ? (
              <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black">{team.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-gold-500 text-brand-navy-950 uppercase">
                {selectedSeason?.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-xl">
              {team.description || `فريق ${team.name} المشارك بنشاط في مسابقات دوري القديس أبانوب للشباب.`}
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 sm:border-r border-slate-800 sm:pr-8 flex-wrap justify-center sm:justify-start">
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 block">مجموع النقاط</span>
              <span className="text-3xl font-black text-brand-gold-400 tracking-tight">{totalScore}</span>
              <span className="text-[9px] text-slate-500 block font-semibold">نقطة تراكمية</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 block">نقاط الفريق</span>
              <span className="text-xl font-black text-white tracking-tight">{team.teamScoreTotal}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 block">نقاط الأفراد</span>
              <span className="text-xl font-black text-white tracking-tight">{team.memberScoreTotal}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {radarData.length > 0 && (
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-brand-gold-400" />
              <span>تحليل الأداء البياني</span>
            </h3>
            <RadarChart data={radarData} teamName={team.name} />
            <div className="p-4 bg-slate-50 dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
              * يعبر مخطط الرادار عن نسبة التقييم المئوية للفريق في كل فئة. الأركان الأوسع تدل على مجالات تفوق وتميز المجموعات.
            </div>
          </div>
        )}

        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-brand-gold-500" />
            <span>تفاصيل الدرجات فئة بفئة</span>
          </h3>

          {scores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scores.map((score) => {
                return (
                  <div
                    key={score.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm dark:bg-brand-navy-900 dark:border-brand-navy-800 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {score.categoryName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        تحديث: {new Date(score.updatedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <ScoreProgressBar score={score.scoreValue} maxScore={score.maxScore} />

                    {score.notes && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 dark:border-brand-navy-800">
                        <MessageSquare className="h-3.5 w-3.5 text-brand-gold-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">ملاحظة المقيم:</strong> {score.notes}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="لا توجد درجات مسجلة"
              description="لم يتم إدخال درجات لهذا الفريق في أي فئة بعد."
            />
          )}

          {team.members.length > 0 && (
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-brand-navy-900 dark:border-brand-navy-800 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-brand-gold-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">أفراد الفريق</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.members
                  .slice()
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-brand-navy-800 bg-slate-50 dark:bg-brand-navy-950 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white">{member.fullName}</div>
                        <div className="text-[10px] text-slate-400">ترتيب #{member.displayOrder}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400">إجمالي الفرد</div>
                        <div className="text-sm font-black text-brand-gold-500">{member.totalScore}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
