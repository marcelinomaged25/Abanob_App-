import React, { useState } from 'react';
import { useSeasons } from '@/hooks/useSeasons';
import { useSeasonContext } from '@/context/SeasonContext';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import type { Season } from '@/types';
import { 
  Calendar, Plus, Trash2, Edit2, 
  X, AlertTriangle, Play 
} from 'lucide-react';

export const ManageSeasonsPage: React.FC = () => {
  const { seasons, loading, createSeason, updateSeason, activateSeason, deleteSeason } = useSeasons();
  const { refreshSeasons } = useSeasonContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Delete Dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSeason(null);
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const openEditModal = (season: Season) => {
    setEditingSeason(season);
    setName(season.name);
    setDescription(season.description);
    setStartDate(new Date(season.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(season.endDate).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;

    const payload = {
      name,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive: editingSeason ? editingSeason.isActive : false,
    };

    try {
      if (editingSeason) {
        await updateSeason(editingSeason.id, { id: editingSeason.id, ...payload });
      } else {
        await createSeason(payload);
      }
      setModalOpen(false);
      await refreshSeasons(); // Sync global season dropdown
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من تفعيل هذا الموسم؟ سيؤدي ذلك لإلغاء تفعيل أي مواسم أخرى نشطة.')) return;
    try {
      await activateSeason(id);
      await refreshSeasons();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'فشل تفعيل الموسم. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteSeason(deleteTargetId);
      setDeleteTargetId(null);
      await refreshSeasons();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'فشل حذف الموسم. يرجى المحاولة مرة أخرى.');
    }
  };

  if (loading && seasons.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>إدارة مواسم البطولة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة مواسم جديدة للبطولات، تعديل الفترات الزمنية، وتفعيل الموسم الرسمي لبدء رصد درجات المجموعات.
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-brand-gold-500 text-brand-navy-950 hover:bg-brand-gold-400 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إنشاء موسم جديد</span>
        </button>
      </div>

      {/* Season Entries List */}
      {seasons.length > 0 ? (
        <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                <th className="py-4 px-6 w-52">اسم الموسم</th>
                <th className="py-4 px-6">الوصف والتفاصيل</th>
                <th className="py-4 px-4 text-center">تاريخ البدء</th>
                <th className="py-4 px-4 text-center">تاريخ الانتهاء</th>
                <th className="py-4 px-4 text-center w-24">الحالة</th>
                <th className="py-4 px-6 text-center w-48">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs text-slate-800 dark:text-slate-200">
              {seasons.map((season) => {
                return (
                  <tr key={season.id} className="hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/30 transition-colors">
                    
                    {/* Season Name */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      {season.name}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {season.description || '-'}
                    </td>

                    {/* Start Date */}
                    <td className="py-4 px-4 text-center">
                      {new Date(season.startDate).toLocaleDateString('ar-EG')}
                    </td>

                    {/* End Date */}
                    <td className="py-4 px-4 text-center">
                      {new Date(season.endDate).toLocaleDateString('ar-EG')}
                    </td>

                    {/* Is Active Status */}
                    <td className="py-4 px-4 text-center">
                      {season.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                          نشط حالياً
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 dark:bg-brand-navy-900">
                          مؤرشف
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Activate Button */}
                        {!season.isActive && (
                          <button
                            onClick={() => handleActivate(season.id)}
                            className="inline-flex h-8 px-2.5 items-center justify-center gap-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 transition-colors cursor-pointer"
                            title="تفعيل هذا الموسم للجميع"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            تفعيل
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(season)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-brand-navy-800 dark:text-slate-300 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteTargetId(season.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState 
          title="لا توجد مواسم مدرجة" 
          description="يرجى النقر على زر إنشاء موسم جديد بالأعلى لتسجيل أول موسم للبطولة وتعيين التواريخ الخاصة به." 
        />
      )}

      {/* CRUD Dialog/Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-lg bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-850 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingSeason ? 'تعديل بيانات الموسم' : 'إنشاء موسم جديد'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-navy-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-right">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">اسم الموسم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: دوري القديس أبانوب 2026"
                  required
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 font-medium">الوصف والملخص</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملخص الموسم والمشاركين فيه..."
                  rows={2}
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">تاريخ بدء المسابقة</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">تاريخ انتهاء المسابقة</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-brand-navy-850">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-brand-navy-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-navy-950 hover:bg-brand-navy-900 dark:bg-brand-gold-500 dark:text-brand-navy-950 dark:hover:bg-brand-gold-400 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-sm bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-scale-in">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">هل أنت متأكد من حذف الموسم؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              ⚠️ <strong>تحذير:</strong> سيؤدي حذف الموسم إلى حذف جميع المجموعات والفرق المسجلة فيه وفئات التقييم ومصفوفات الدرجات المرتبطة به نهائياً!
            </p>
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-brand-navy-850">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-brand-navy-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
