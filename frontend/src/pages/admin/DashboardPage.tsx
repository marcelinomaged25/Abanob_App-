import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeasonContext } from '@/context/SeasonContext';
import { useStandings } from '@/hooks/useStandings';
import { useAuth } from '@/hooks/useAuth';
import { getAuditLogs } from '@/services/auditService';
import { StatsSkeleton } from '@/components/LoadingSkeleton';
import type { AuditLog } from '@/types';
import { 
  Trophy, Calendar, Users, ListPlus, ShieldCheck, 
  ChevronLeft, ArrowUpRight, History 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { selectedSeason, selectedSeasonId, seasons } = useSeasonContext();
  const { leaderboard, quickStats, loading } = useStandings(selectedSeasonId);
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      setLogsLoading(true);
      try {
        const auditData = await getAuditLogs();
        setLogs(auditData.slice(0, 5)); // Get recent 5 logs
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLogsLoading(false);
      }
    };
    loadLogs();
  }, [selectedSeasonId]);

  return (
    <div className="w-full space-y-8" dir="rtl">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>لوحة المتابعة الإدارية الشاملة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة إحصائيات الموسم النشط، وتعديل ترتيب المجموعات، ونشاط عمليات المشرفين.
          </p>
        </div>
        
        {/* Season Indicator Pill */}
        <div className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-brand-gold-500 text-brand-navy-950 flex items-center gap-1.5 shadow-sm">
          <Calendar className="h-3.5 w-3.5" />
          <span>الموسم: {selectedSeason?.name || 'تحميل...'}</span>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      {loading ? (
        <StatsSkeleton />
      ) : quickStats ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">إجمالي المواسم</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center font-extrabold">
                📅
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {seasons.length}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">مواسم البطولة النشطة والمؤرشفة</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">الفرق ببطولة {selectedSeason?.name.split(' ').pop()}</span>
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center font-extrabold">
                👥
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {quickStats.totalTeams}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">فريق شبابي مسجل بالموسم</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">فئات التقييم المعتمدة</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center font-extrabold">
                📝
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {quickStats.totalCategories}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">مجالات تقييم ودرجات منوعة</p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold">صاحب الصدارة الحالي</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center font-extrabold">
                👑
              </div>
            </div>
            <div className="mt-4 text-emerald-600 dark:text-brand-gold-400">
              <span className="text-sm sm:text-md font-black truncate block">
                {quickStats.leadingTeamName || 'لا يوجد فرق'}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">برصيد {quickStats.highestTotalScore} نقطة تراكمية</p>
            </div>
          </div>

        </section>
      ) : null}

      {/* Admin Shortcuts Panel */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link 
          to="/admin/scores"
          className="p-6 bg-brand-navy-950 text-white rounded-2xl border border-brand-gold-500/20 shadow-md flex items-center justify-between group hover:scale-[1.01] transition-transform duration-200"
        >
          <div className="space-y-1">
            <h4 className="text-xs font-black text-brand-gold-400 uppercase">إدخال وتقييم</h4>
            <p className="text-sm font-black">مصفوفة إدخال الدرجات</p>
            <p className="text-[10px] text-slate-400">شاشة رصد الدرجات مع حفظ تلقائي وسهل</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-gold-500 text-brand-navy-950 flex items-center justify-center font-black shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </Link>

        <Link 
          to="/admin/teams"
          className="p-6 bg-white border border-slate-200 dark:bg-brand-navy-900 dark:border-brand-navy-800 rounded-2xl shadow-sm flex items-center justify-between group hover:scale-[1.01] transition-transform duration-200"
        >
          <div className="space-y-1 text-right">
            <h4 className="text-xs font-black text-slate-400 uppercase">الفرق والمجموعات</h4>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">إدارة وتسجيل الفرق</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">إضافة وتعديل الفرق ورفع الشعارات الرسمية</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 dark:bg-brand-navy-950 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </Link>

        <Link 
          to="/admin/categories"
          className="p-6 bg-white border border-slate-200 dark:bg-brand-navy-900 dark:border-brand-navy-800 rounded-2xl shadow-sm flex items-center justify-between group hover:scale-[1.01] transition-transform duration-200"
        >
          <div className="space-y-1 text-right">
            <h4 className="text-xs font-black text-slate-400 uppercase">فئات ودرجات التقييم</h4>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">تنظيم وهيكلة الفئات</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">إضافة الفئات وإعادة ترتيب الأولوية بالسحب والإفلات</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 dark:bg-brand-navy-950 dark:text-slate-300 flex items-center justify-center shrink-0">
            <ListPlus className="h-5 w-5" />
          </div>
        </Link>

      </section>

      {/* Grid: Mini Leaderboard vs Recent Audit Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top 5 Teams Mini Standings */}
        <div className="p-6 bg-white border border-slate-200 dark:bg-brand-navy-900 dark:border-brand-navy-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-800 pb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
              <Trophy className="h-4.5 w-4.5 text-brand-gold-500" />
              <span>الخمسة الأوائل المتصدرين</span>
            </h3>
            <Link to="/standings" className="text-[10px] font-bold text-brand-navy-500 dark:text-brand-gold-400 flex items-center gap-0.5">
              <span>عرض الترتيب الكامل</span>
              <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((team) => {
                const initials = team.teamName.replace('فريق ', '').slice(0, 2);
                return (
                  <div key={team.teamId} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-brand-navy-950 rounded-xl border border-slate-100 dark:border-brand-navy-850">
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-brand-navy-900 text-[10px] font-black flex items-center justify-center text-slate-700 dark:text-brand-gold-400">
                        {team.rank}
                      </span>
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-brand-navy-900 overflow-hidden flex items-center justify-center border font-bold text-[9px] text-brand-gold-500 shadow-inner">
                        {team.logoUrl && !team.logoUrl.includes('default') ? (
                          <img src={team.logoUrl} alt={team.teamName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">{team.teamName}</span>
                    </div>
                    <span className="text-xs font-black text-brand-navy-600 dark:text-brand-gold-400">{team.totalScore} نقطة</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">لا يوجد ترتيب فرق متوفر حالياً.</div>
          )}
        </div>

        {/* Recent Audit Feed */}
        <div className="p-6 bg-white border border-slate-200 dark:bg-brand-navy-900 dark:border-brand-navy-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-800 pb-2">
            <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-slate-400" />
              <span>آخر العمليات الإدارية والمشرفين</span>
            </h3>
            {user?.role === 'SuperAdmin' && (
              <Link to="/admin/audit-logs" className="text-[10px] font-bold text-brand-navy-500 dark:text-brand-gold-400 flex items-center gap-0.5">
                <span>كل سجلات العمليات</span>
                <ChevronLeft className="h-3 w-3" />
              </Link>
            )}
          </div>

          {logsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-brand-navy-950 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-3.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-brand-navy-950 rounded-xl text-[10px] border border-slate-100 dark:border-brand-navy-850">
                  <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-brand-navy-900 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-brand-gold-400">
                    {log.userFullName.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-0.5 text-right min-w-0">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{log.userFullName}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium break-words">
                      قام بإجراء: <span className="font-black text-brand-navy-800 dark:text-brand-gold-400">{log.action}</span> على فئة/فريق <span className="font-extrabold">{log.entityName}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">لا يوجد أي سجل عمليات مسجل مؤخراً.</div>
          )}
        </div>

      </section>

    </div>
  );
};
