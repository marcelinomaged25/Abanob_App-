import React, { useState, useEffect, useCallback } from 'react';
import { useScores } from '@/hooks/useScores';
import { useSeasonContext } from '@/context/SeasonContext';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { 
  FileText, MessageSquare, AlertCircle, CheckCircle2, 
  RefreshCw, X, Save 
} from 'lucide-react';



export const ManageScoresPage: React.FC = () => {
  const { selectedSeasonId, selectedSeason } = useSeasonContext();
  const { matrix, loading, updateScore } = useScores(selectedSeasonId);

  // local temporary scores state to prevent laggy typing
  const [localCells, setLocalCells] = useState<Record<string, { value: string; notes: string }>>({});
  
  // Validation errors map
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Save status feed
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Notes Modal state
  const [notesModalTarget, setNotesModalTarget] = useState<{
    teamId: string;
    teamName: string;
    categoryId: string;
    categoryName: string;
    maxScore: number;
  } | null>(null);
  
  const [notesText, setNotesText] = useState('');

  // Synchronize local cells state when database matrix is fetched
  useEffect(() => {
    if (matrix) {
      const cells: Record<string, { value: string; notes: string }> = {};
      matrix.rows.forEach((row) => {
        row.scores.forEach((cell) => {
          const key = `${row.teamId}-${cell.categoryId}`;
          cells[key] = {
            value: cell.scoreValue !== null ? cell.scoreValue.toString() : '',
            notes: cell.notes || '',
          };
        });
      });
      setLocalCells(cells);
      setValidationErrors({});
    }
  }, [matrix]);

  // Debounced auto-save function
  const triggerAutoSave = useCallback(
    async (teamId: string, categoryId: string, value: string, notes: string) => {
      const scoreVal = parseInt(value);
      if (isNaN(scoreVal)) return;

      setSaveStatus('saving');
      try {
        await updateScore({
          teamId,
          categoryId,
          scoreValue: scoreVal,
          notes,
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Failed to auto-save score', err);
        setSaveStatus('error');
      }
    },
    [updateScore]
  );

  // Debounce timers map
  const [saveTimers, setSaveTimers] = useState<Record<string, number>>({});

  const handleCellChange = (
    teamId: string,
    categoryId: string,
    valStr: string,
    maxScore: number,
    existingNotes: string
  ) => {
    const key = `${teamId}-${categoryId}`;
    
    // 1. Update local cell text state immediately
    setLocalCells((prev) => ({
      ...prev,
      [key]: { value: valStr, notes: existingNotes },
    }));

    // 2. Perform validations
    if (valStr.trim() === '') {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: 'الدرجة مطلوبة',
      }));
      return;
    }

    const numericVal = parseInt(valStr);
    if (isNaN(numericVal) || numericVal < 0 || numericVal > maxScore) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: `يجب أن تكون بين 0 و ${maxScore}`,
      }));
      return;
    }

    // Clear validation error if valid
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    // 3. Clear existing timers for this cell and queue a new debounced auto-save
    if (saveTimers[key]) {
      clearTimeout(saveTimers[key]);
    }

    const timer = window.setTimeout(() => {
      triggerAutoSave(teamId, categoryId, valStr, existingNotes);
    }, 1200); // Wait for 1.2s of typing idle

    setSaveTimers((prev) => ({
      ...prev,
      [key]: timer,
    }));
  };

  // Open Notes Modal
  const openNotesModal = (
    teamId: string,
    teamName: string,
    categoryId: string,
    categoryName: string,
    maxScore: number
  ) => {
    const key = `${teamId}-${categoryId}`;
    const cellData = localCells[key];
    setNotesText(cellData ? cellData.notes : '');
    setNotesModalTarget({
      teamId,
      teamName,
      categoryId,
      categoryName,
      maxScore,
    });
  };

  // Save Notes Handler
  const handleSaveNotes = async () => {
    if (!notesModalTarget) return;
    const { teamId, categoryId } = notesModalTarget;
    const key = `${teamId}-${categoryId}`;
    const cellValStr = localCells[key]?.value || '0';

    // Update local state
    setLocalCells((prev) => ({
      ...prev,
      [key]: { value: cellValStr, notes: notesText },
    }));

    // Close Modal
    setNotesModalTarget(null);

    // Save immediately to backend
    await triggerAutoSave(teamId, categoryId, cellValStr, notesText);
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
            <span>رصد مصفوفة درجات التقييم</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول رصد إلكتروني تفاعلي لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>. قم بتعديل الدرجات مباشرة في الخلايا وسيحفظ النظام تلقائياً.
          </p>
        </div>

        {/* Save Indicators status bar */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-brand-navy-500 dark:text-brand-gold-400 animate-pulse">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              جاري الحفظ التلقائي...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تم حفظ التعديلات بنجاح!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              فشل الحفظ التلقائي!
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-slate-400 text-[10px] font-semibold">
              * جميع الدرجات تحفظ تلقائياً عند التوقف عن الكتابة
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
                    <span className="text-[9px] text-slate-400 block font-normal mt-0.5">الحد الأقصى ({cat.maxScore})</span>
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
                    {matrix.categories.map((cat) => {
                      const key = `${row.teamId}-${cat.id}`;
                      const cellData = localCells[key] || { value: '', notes: '' };
                      const hasError = !!validationErrors[key];
                      const hasNotes = !!cellData.notes;

                      return (
                        <td key={cat.id} className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 relative">
                            
                            {/* Score Input Box */}
                            <input
                              type="text"
                              value={cellData.value}
                              onChange={(e) => 
                                handleCellChange(
                                  row.teamId, 
                                  cat.id, 
                                  e.target.value, 
                                  cat.maxScore, 
                                  cellData.notes
                                )
                              }
                              className={`w-14 h-9 text-center text-xs font-black rounded-lg border bg-slate-50 dark:bg-brand-navy-950 dark:text-white transition-all focus:bg-white focus:shadow-sm focus:outline-none ${
                                hasError 
                                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500' 
                                  : 'border-slate-200 dark:border-brand-navy-850 focus:border-brand-navy-500'
                              }`}
                              placeholder="-"
                              title={hasError ? validationErrors[key] : ''}
                            />

                            {/* Add/View notes comment bubble button */}
                            <button
                              onClick={() => 
                                openNotesModal(
                                  row.teamId, 
                                  row.teamName, 
                                  cat.id, 
                                  cat.name, 
                                  cat.maxScore
                                )
                              }
                              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                hasNotes 
                                  ? 'bg-amber-50 border-amber-300 text-brand-gold-500 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-500'
                              }`}
                              title={hasNotes ? `تعديل الملاحظة: ${cellData.notes}` : 'إضافة ملاحظة المقيم'}
                            >
                              <MessageSquare className="h-3.5 w-3.5 fill-current" style={{ fillOpacity: hasNotes ? 1 : 0 }} />
                            </button>

                          </div>

                          {/* Inline Error Indicator tooltip */}
                          {hasError && (
                            <span className="text-[9px] text-rose-500 block font-bold mt-1 text-center select-none animate-pulse">
                              {validationErrors[key]}
                            </span>
                          )}
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

      {/* Notes Dialog/Modal */}
      {notesModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-850 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">إضافة ملاحظات التقييم</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  فريق: <span className="font-extrabold text-slate-700 dark:text-slate-200">{notesModalTarget.teamName}</span> | فئة: <span className="font-extrabold">{notesModalTarget.categoryName}</span>
                </p>
              </div>
              <button 
                onClick={() => setNotesModalTarget(null)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-right">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">ملاحظات وتقييم المشرفين</label>
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="أداء ممتاز للشباب، أخطاء طفيفة في الطقوس..."
                rows={4}
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-brand-navy-850">
              <button
                onClick={() => setNotesModalTarget(null)}
                className="px-4 py-2 border border-slate-200 dark:border-brand-navy-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 dark:bg-brand-gold-500 dark:text-brand-navy-950 dark:hover:bg-brand-gold-400 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>حفظ الملاحظة</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
