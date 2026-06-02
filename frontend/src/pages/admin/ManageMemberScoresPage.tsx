import React, { useState, useMemo } from 'react';
import { useMemberScores } from '@/hooks/useMemberScores';
import { useSeasonContext } from '@/context/SeasonContext';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import type { MemberScoreMatrixRow, MemberScoreHistoryEntry } from '@/types';
import {
  Users, X, Save, Plus, Clock, List,
  ChevronRight, Trophy, Medal, Award, ArrowRight
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
  return <span className="text-xs font-black text-slate-500 w-4 text-center">{rank}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export const ManageMemberScoresPage: React.FC = () => {
  const { selectedSeasonId, selectedSeason } = useSeasonContext();
  const { matrix, leaderboard, loading, updateMemberScore } = useMemberScores(selectedSeasonId);

  // Active view: 'teams' | 'members'
  const [activeView, setActiveView] = useState<'teams' | 'members'>('teams');
  const [activeTab, setActiveTab] = useState<'scoring' | 'leaderboard'>('scoring');

  // Selected team for drilling in
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Score History Modal
  const [modal, setModal] = useState<{
    teamMemberId: string;
    teamMemberName: string;
    teamName: string;
    categoryId: string;
    categoryName: string;
    maxScore: number;
    history: MemberScoreHistoryEntry[];
  } | null>(null);

  // Modal form state
  const [newScoreVal, setNewScoreVal] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 19);
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // ── Group matrix rows by team ──────────────────────────────────────────────
  const teamGroups = useMemo(() => {
    if (!matrix) return [];
    const map = new Map<string, { teamId: string; teamName: string; logoUrl: string; members: MemberScoreMatrixRow[] }>();
    matrix.rows.forEach((row) => {
      if (!map.has(row.teamId)) {
        map.set(row.teamId, { teamId: row.teamId, teamName: row.teamName, logoUrl: row.logoUrl, members: [] });
      }
      map.get(row.teamId)!.members.push(row);
    });
    return Array.from(map.values());
  }, [matrix]);

  const selectedTeamGroup = useMemo(
    () => teamGroups.find((g) => g.teamId === selectedTeamId) ?? null,
    [teamGroups, selectedTeamId]
  );

  // ── Open Modal ─────────────────────────────────────────────────────────────
  const openModal = (
    row: MemberScoreMatrixRow,
    catId: string,
    catName: string,
    maxScore: number,
    history: MemberScoreHistoryEntry[]
  ) => {
    setNewScoreVal('');
    setNewNotes('');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setNewDate(now.toISOString().slice(0, 19));
    setModal({
      teamMemberId: row.teamMemberId,
      teamMemberName: row.teamMemberName,
      teamName: row.teamName,
      categoryId: catId,
      categoryName: catName,
      maxScore,
      history,
    });
  };

  // ── Save new score entry ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!modal) return;
    const val = parseInt(newScoreVal);
    if (isNaN(val) || val < 0 || val > modal.maxScore) {
      alert(`الرجاء إدخال درجة صحيحة بين 0 و ${modal.maxScore}`);
      return;
    }

    setSaveStatus('saving');
    try {
      await updateMemberScore({
        teamMemberId: modal.teamMemberId,
        categoryId: modal.categoryId,
        scoreValue: val,
        notes: newNotes,
        updatedAt: newDate ? new Date(newDate).toISOString() : undefined,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      setModal(null);
    } catch {
      setSaveStatus('error');
    }
  };

  if (loading && !matrix) return <TableSkeleton />;

  return (
    <div className="w-full space-y-6 animate-fade-in" dir="rtl">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>تقييم الأفراد داخل الفرق</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اضغط على فريق لتقييم أعضائه — الدرجة تُضاف للفرد <span className="font-bold text-brand-gold-500">وللفريق</span> تلقائياً.
            موسم: <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>
          </p>
        </div>

        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
            ✓ تم الحفظ بنجاح!
          </span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-brand-navy-900 rounded-xl w-fit">
        {(['scoring', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setActiveView('teams'); setSelectedTeamId(null); }}
            className={`px-5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white dark:bg-brand-navy-800 text-brand-navy-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'scoring' ? '📋 التقييم' : '🏆 جدول الترتيب'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: SCORING                                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'scoring' && (
        <>
          {/* Breadcrumb */}
          {activeView === 'members' && selectedTeamGroup && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={() => { setActiveView('teams'); setSelectedTeamId(null); }}
                className="font-bold text-brand-navy-600 dark:text-brand-gold-400 hover:underline cursor-pointer"
              >
                الفرق
              </button>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              <span className="font-extrabold text-slate-700 dark:text-slate-300">{selectedTeamGroup.teamName}</span>
            </div>
          )}

          {/* VIEW 1: Team Cards Grid */}
          {activeView === 'teams' && (
            <>
              {teamGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamGroups.map((group) => {
                    const teamLeaderScore = leaderboard
                      .filter((e) => e.teamId === group.teamId)
                      .reduce((sum, e) => sum + e.totalScore, 0);
                    const memberCount = group.members.length;
                    const initials = group.teamName.replace('فريق ', '').slice(0, 2);

                    return (
                      <button
                        key={group.teamId}
                        onClick={() => { setSelectedTeamId(group.teamId); setActiveView('members'); }}
                        className="group relative text-right p-5 bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-gold-300 dark:hover:border-brand-gold-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {/* Logo */}
                          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-brand-navy-800 flex items-center justify-center border border-slate-200 dark:border-brand-navy-700 text-brand-gold-500 font-black text-sm shrink-0 overflow-hidden">
                            {group.logoUrl && !group.logoUrl.includes('default') ? (
                              <img src={group.logoUrl} alt={group.teamName} className="h-full w-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{group.teamName}</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {memberCount} عضو
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">إجمالي نقاط الأفراد:</span>
                              <span className="font-black text-brand-gold-500 text-sm">{teamLeaderScore}</span>
                            </div>
                          </div>
                          {/* Arrow */}
                          <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-brand-gold-500 transition-colors rtl:rotate-180 shrink-0 mt-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="لا يوجد فرق بها أعضاء"
                  description="أضف أعضاء للفرق أولاً من صفحة إدارة الفرق لتتمكن من تقييمهم."
                />
              )}
            </>
          )}

          {/* VIEW 2: Member Scoring Matrix */}
          {activeView === 'members' && selectedTeamGroup && matrix && (
            <div className="space-y-4">
              {/* Team header summary */}
              <div className="flex items-center gap-4 p-4 bg-brand-navy-950/5 dark:bg-brand-navy-900 rounded-2xl border border-slate-200 dark:border-brand-navy-800">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-brand-navy-800 flex items-center justify-center border font-black text-[11px] text-brand-gold-500 overflow-hidden shrink-0">
                  {selectedTeamGroup.logoUrl && !selectedTeamGroup.logoUrl.includes('default') ? (
                    <img src={selectedTeamGroup.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    selectedTeamGroup.teamName.replace('فريق ', '').slice(0, 2)
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">{selectedTeamGroup.teamName}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{selectedTeamGroup.members.length} عضو — اضغط على خلية لإضافة تقييم</p>
                </div>
              </div>

              {/* Scoring Table */}
              <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
                <table className="w-full text-right border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                      <th className="py-4 px-6 w-52">الفرد</th>
                      <th className="py-4 px-4 text-center bg-brand-gold-50/50 dark:bg-brand-gold-950/10 border-l border-slate-200 dark:border-brand-navy-800">
                        المجموع الكلي
                      </th>
                      {matrix.categories.map((cat) => (
                        <th key={cat.id} className="py-4 px-4 text-center">
                          <span>{cat.name}</span>
                          <span className="text-[9px] text-slate-400 block font-normal mt-0.5">حد أقصى ({cat.maxScore}) / تقييم</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs">
                    {selectedTeamGroup.members.map((row) => {
                      const initials = row.teamMemberName.slice(0, 2);
                      return (
                        <tr key={row.teamMemberId} className="hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/20 transition-colors">
                          {/* Member Name */}
                          <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                                {initials}
                              </div>
                              <span>{row.teamMemberName}</span>
                            </div>
                          </td>

                          {/* Total Score */}
                          <td className="py-4 px-4 text-center bg-brand-gold-50/30 dark:bg-brand-gold-950/10 border-l border-slate-100 dark:border-brand-navy-800">
                            <span className="font-black text-lg text-brand-gold-600 dark:text-brand-gold-400">
                              {row.totalScore}
                            </span>
                          </td>

                          {/* Category cells */}
                          {row.scores.map((cell) => {
                            const cat = matrix.categories.find((c) => c.id === cell.categoryId)!;
                            const hasHistory = cell.history && cell.history.length > 0;
                            return (
                              <td key={cell.categoryId} className="py-4 px-4 text-center">
                                <button
                                  onClick={() => openModal(row, cat.id, cat.name, cat.maxScore, cell.history || [])}
                                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                                    cell.scoreValue != null && cell.scoreValue > 0
                                      ? 'bg-brand-navy-50 border-brand-navy-200 text-brand-navy-900 dark:bg-brand-navy-900 dark:border-brand-navy-700 dark:text-white font-black'
                                      : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-500 font-bold'
                                  }`}
                                  title="اضغط لإضافة تقييم"
                                >
                                  <span>{cell.scoreValue != null ? cell.scoreValue : '-'}</span>
                                  {hasHistory && <List className="h-3 w-3 text-brand-gold-500" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: INDIVIDUAL LEADERBOARD                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-gold-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">جدول ترتيب الأفراد</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-brand-navy-900 px-2 py-0.5 rounded-full">
              {leaderboard.length} فرد
            </span>
          </div>

          {leaderboard.length > 0 ? (
            <div className="border border-slate-200 dark:border-brand-navy-800 rounded-2xl overflow-hidden bg-white dark:bg-brand-navy-950">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-600 dark:text-slate-300">
                    <th className="py-4 px-6 w-12 text-center">#</th>
                    <th className="py-4 px-6">الفرد</th>
                    <th className="py-4 px-6">الفريق</th>
                    <th className="py-4 px-6 text-center">إجمالي النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs">
                  {leaderboard.map((entry) => {
                    const isTop3 = entry.rank <= 3;
                    const initials = entry.teamMemberName.slice(0, 2);
                    return (
                      <tr
                        key={entry.teamMemberId}
                        className={`transition-colors ${
                          isTop3
                            ? 'bg-brand-gold-50/30 dark:bg-brand-gold-950/10 hover:bg-brand-gold-50/50'
                            : 'hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/20'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            <RankBadge rank={entry.rank} />
                          </div>
                        </td>

                        {/* Member */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                              entry.rank === 1 ? 'bg-yellow-400/20 text-yellow-600' :
                              entry.rank === 2 ? 'bg-slate-300/30 text-slate-600' :
                              entry.rank === 3 ? 'bg-amber-600/20 text-amber-700' :
                              'bg-slate-100 dark:bg-brand-navy-900 text-brand-gold-500'
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 dark:text-white">{entry.teamMemberName}</span>
                              {entry.rank === 1 && <span className="text-[9px] text-yellow-500 block font-bold">المركز الأول 🥇</span>}
                            </div>
                          </div>
                        </td>

                        {/* Team */}
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-brand-navy-900 px-2 py-1 rounded-lg">
                            {entry.teamName}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-6 text-center">
                          <span className={`font-black text-lg ${
                            isTop3 ? 'text-brand-gold-500' : 'text-slate-700 dark:text-white'
                          }`}>
                            {entry.totalScore}
                          </span>
                          <span className="text-[10px] text-slate-400 block">نقطة</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="لا يوجد تقييمات فردية بعد"
              description="أضف تقييمات للأفراد من تبويب التقييم ليظهروا هنا في جدول الترتيب."
            />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Add Score + History                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-lg bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-brand-navy-850">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <List className="h-4 w-4 text-brand-gold-500" />
                  سجل وإضافة تقييم
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-bold text-brand-navy-600 dark:text-brand-gold-400">{modal.teamMemberName}</span>
                  {' '}·{' '}
                  <span className="font-semibold">{modal.teamName}</span>
                  {' '}·{' '}
                  <span className="font-semibold">{modal.categoryName}</span>
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy-800 cursor-pointer transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Add New Score Form */}
              <div className="bg-slate-50 dark:bg-brand-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-850 space-y-4">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  إضافة تقييم جديد
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">الدرجة المضافة</label>
                    <input
                      type="number"
                      value={newScoreVal}
                      onChange={(e) => setNewScoreVal(e.target.value)}
                      min="0"
                      max={modal.maxScore}
                      placeholder={`0 ~ ${modal.maxScore}`}
                      className="w-full h-10 px-3 text-sm font-black bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-700 text-slate-800 dark:text-white rounded-xl focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">التاريخ والوقت</label>
                    <input
                      type="datetime-local"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      step="1"
                      className="w-full h-10 px-3 text-xs bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-700 text-slate-800 dark:text-white rounded-xl focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">ملاحظات</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="ملاحظات خاصة بهذا التقييم..."
                    rows={2}
                    className="w-full p-3 text-xs bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-700 text-slate-800 dark:text-white rounded-xl focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={!newScoreVal || saveStatus === 'saving'}
                    className="px-5 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 dark:bg-brand-gold-500 dark:text-brand-navy-950 dark:hover:bg-brand-gold-400 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
                  >
                    <Save className="h-4 w-4" />
                    {saveStatus === 'saving' ? 'جاري الحفظ...' : 'حفظ وإضافة للمجموع'}
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  السجل التاريخي
                  {modal.history.length > 0 && (
                    <span className="font-bold text-brand-gold-500 bg-brand-gold-50 dark:bg-brand-gold-950/30 px-2 py-0.5 rounded-full text-[10px]">
                      المجموع: {modal.history.reduce((s, e) => s + e.scoreValue, 0)}
                    </span>
                  )}
                </h4>

                {modal.history.length > 0 ? (
                  <div className="space-y-2">
                    {modal.history.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 bg-slate-50/80 dark:bg-brand-navy-950/50 rounded-xl border border-slate-100 dark:border-brand-navy-800">
                        <div className="h-8 w-8 rounded-full bg-brand-gold-100 dark:bg-brand-gold-950/30 text-brand-gold-600 dark:text-brand-gold-400 flex items-center justify-center font-black text-xs shrink-0">
                          +{entry.scoreValue}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              تم إضافة {entry.scoreValue} نقطة
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(entry.updatedAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'medium' })}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 bg-white/60 dark:bg-brand-navy-900/60 p-1.5 rounded-lg">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/50 dark:bg-brand-navy-950/50 rounded-xl border border-dashed border-slate-200 dark:border-brand-navy-800">
                    <p className="text-xs font-bold text-slate-400">لا يوجد تقييمات مسجلة لهذا الفرد في هذه الفئة بعد.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
