import React, { useState } from 'react';
import { useScores } from '@/hooks/useScores';
import { useSeasonContext } from '@/context/SeasonContext';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { 
  FileText, MessageSquare, CheckCircle2, 
  X, Save, Plus, Clock, List, Trash2
} from 'lucide-react';

export const ManageScoresPage: React.FC = () => {
  const { selectedSeasonId, selectedSeason } = useSeasonContext();
  const { matrix, loading, updateScore, removeScore } = useScores(selectedSeasonId);

  // Save status feed
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Notes/History Modal state
  const [notesModalTarget, setNotesModalTarget] = useState<{
    teamId: string;
    teamName: string;
    categoryId: string;
    categoryName: string;
    maxScore: number;
    history: any[];
  } | null>(null);
  
  // New Score Form State
  const [newScoreVal, setNewScoreVal] = useState('');
  const [notesText, setNotesText] = useState('');
  const [notesDate, setNotesDate] = useState(() => {
    // Current date and time formatted for datetime-local input
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 19);
  });

  // Open Notes Modal
  const openNotesModal = (
    teamId: string,
    teamName: string,
    categoryId: string,
    categoryName: string,
    maxScore: number,
    history: any[]
  ) => {
    setNewScoreVal('');
    setNotesText('');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setNotesDate(now.toISOString().slice(0, 19));

    setNotesModalTarget({
      teamId,
      teamName,
      categoryId,
      categoryName,
      maxScore,
      history: history || []
    });
  };

  // Save Notes Handler
  const handleSaveNotes = async () => {
    if (!notesModalTarget) return;
    
    const scoreNum = parseInt(newScoreVal);
    if (isNaN(scoreNum) || scoreNum > notesModalTarget.maxScore) {
      alert(`الرجاء إدخال درجة لا تتعدى الحد الأقصى (${notesModalTarget.maxScore})`);
      return;
    }

    const { teamId, categoryId } = notesModalTarget;
    const dateToSave = notesDate ? new Date(notesDate).toISOString() : undefined;

    setSaveStatus('saving');
    try {
      await updateScore({
        teamId,
        categoryId,
        scoreValue: scoreNum,
        notes: notesText,
        updatedAt: dateToSave,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      setNotesModalTarget(null);
    } catch (err) {
      console.error('Failed to save score', err);
      setSaveStatus('error');
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقييم؟ سيتم خصمه من المجموع.')) return;
    try {
      await removeScore(scoreId);
      // Close modal as history changed and might be empty, or just close it to refresh
      setNotesModalTarget(null);
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading && !matrix) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6 animate-fade-in" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>رصد مصفوفة درجات التقييم (سجل النقاط)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول رصد إلكتروني تفاعلي لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>. انقر على خلية الدرجة لإضافة تقييم جديد للفريق وعرض السجل التاريخي.
          </p>
        </div>

        {/* Save Indicators status bar */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-brand-navy-500 dark:text-brand-gold-400 animate-pulse">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-brand-navy-500 dark:border-brand-gold-400 border-t-transparent animate-spin" />
              جاري حفظ التقييم...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تم حفظ التقييم بنجاح!
            </span>
          )}
        </div>
      </div>

      {/* Roster Matrix Table */}
      {matrix && matrix.rows.length > 0 ? (
        <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                <th className="py-4 px-6 w-52">اسم الفريق / المجموعة</th>
                
                {/* Category Headers */}
                {matrix.categories.map((cat) => (
                  <th key={cat.id} className="py-4 px-4 text-center">
                    <span>{cat.name}</span>
                    <span className="text-[9px] text-slate-400 block font-normal mt-0.5">مجموع (الحد الأقصى لكل تقييم {cat.maxScore})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs">
              {matrix.rows.map((row) => {
                const initials = row.teamName.replace('فريق ', '').slice(0, 2);

                return (
                  <tr key={row.teamId} className="hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/20 transition-colors">
                    
                    {/* Team Name column */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-brand-navy-900 overflow-hidden flex items-center justify-center border font-bold text-[9px] text-brand-gold-500 shadow-inner">
                          {row.logoUrl && !row.logoUrl.includes('default') ? (
                            <img src={row.logoUrl} alt={row.teamName} className="h-full w-full object-cover" />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <span className="truncate">{row.teamName}</span>
                      </div>
                    </td>

                    {/* Scores inputs columns */}
                    {row.scores.map((cell) => {
                      const hasNotes = !!cell.notes || (cell.history && cell.history.length > 0);
                      const cat = matrix.categories.find(c => c.id === cell.categoryId)!;

                      return (
                        <td key={cell.categoryId} className="py-4 px-4 text-center">
                          <button
                            onClick={() => 
                              openNotesModal(
                                row.teamId, 
                                row.teamName, 
                                cat.id, 
                                cat.name, 
                                cat.maxScore,
                                cell.history || []
                              )
                            }
                            className={`inline-flex items-center gap-1.5 relative h-9 px-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                              cell.scoreValue != null && cell.scoreValue > 0
                                ? 'bg-brand-navy-50 border-brand-navy-200 text-brand-navy-900 dark:bg-brand-navy-900 dark:border-brand-navy-700 dark:text-white font-black'
                                : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-500 font-bold'
                            }`}
                          >
                            <span>{cell.scoreValue != null ? cell.scoreValue : '-'}</span>
                            
                            {hasNotes && (
                              <List className="h-3.5 w-3.5 text-brand-gold-500" />
                            )}
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
      ) : (
        <EmptyState 
          title="لا يوجد فرق أو فئات لعرض المصفوفة" 
          description="يرجى إضافة فئة درجات وفريق متنافس واحد على الأقل للموسم المحدد لبناء وعرض المصفوفة الإلكترونية." 
        />
      )}

      {/* History & Add Score Dialog/Modal */}
      {notesModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-lg bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-850 pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <List className="h-4 w-4 text-brand-gold-500" />
                  سجل وإضافة التقييمات
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  فريق: <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{notesModalTarget.teamName}</span> | 
                  فئة: <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{notesModalTarget.categoryName}</span>
                </p>
              </div>
              <button 
                onClick={() => setNotesModalTarget(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy-800 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              
              {/* Add New Score Form */}
              <div className="bg-slate-50 dark:bg-brand-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-850 space-y-4">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  إضافة تقييم جديد
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">الدرجة المضافة</label>
                    <input
                      type="number"
                      value={newScoreVal}
                      onChange={(e) => setNewScoreVal(e.target.value)}
                      max={notesModalTarget.maxScore}
                      placeholder={`أقصى حد ${notesModalTarget.maxScore}`}
                      className="w-full h-10 px-3 text-xs font-black bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-700 text-slate-800 dark:text-white rounded-xl focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">التاريخ والوقت</label>
                    <input
                      type="datetime-local"
                      value={notesDate}
                      onChange={(e) => setNotesDate(e.target.value)}
                      step="1"
                      className="w-full h-10 px-3 text-xs bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-700 text-slate-800 dark:text-white rounded-xl focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500">ملاحظات التقييم</label>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="ملاحظات حول هذا التقييم تحديداً..."
                    rows={2}
                    className="w-full p-3 text-xs bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-700 text-slate-800 dark:text-white rounded-xl focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={!newScoreVal || saveStatus === 'saving'}
                    className="px-5 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 dark:bg-brand-gold-500 dark:text-brand-navy-950 dark:hover:bg-brand-gold-400 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>حفظ وإضافة للمجموع</span>
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  سجل التقييمات السابقة
                </h4>
                
                {notesModalTarget.history && notesModalTarget.history.length > 0 ? (
                  <div className="space-y-2">
                    {notesModalTarget.history.map((entry, idx) => (
                      <div key={entry.id || idx} className="bg-slate-50/50 dark:bg-brand-navy-950/50 p-3 rounded-xl border border-slate-100 dark:border-brand-navy-800 flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${entry.scoreValue < 0 ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-brand-gold-500/20 text-brand-gold-600 dark:text-brand-gold-400'}`}>
                          {entry.scoreValue > 0 ? '+' : ''}{entry.scoreValue}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              تم إدخال {entry.scoreValue} نقطة
                            </span>
                            <span className="text-[10px] text-slate-400 bg-white dark:bg-brand-navy-900 px-2 py-0.5 rounded border border-slate-100 dark:border-brand-navy-800">
                              {new Date(entry.updatedAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'medium' })}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 bg-white/50 dark:bg-brand-navy-900/50 p-2 rounded-lg border border-slate-100 dark:border-brand-navy-800">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        {entry.id && (
                          <button
                            onClick={() => handleDeleteScore(entry.id)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors ml-1"
                            title="حذف التقييم"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/50 dark:bg-brand-navy-950/50 rounded-xl border border-slate-100 dark:border-brand-navy-800 border-dashed">
                    <MessageSquare className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">لا يوجد تقييمات مسجلة حتى الآن.</p>
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
