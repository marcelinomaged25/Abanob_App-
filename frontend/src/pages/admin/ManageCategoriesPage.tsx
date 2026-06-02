import React, { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useSeasonContext } from '@/context/SeasonContext';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import type { Category } from '@/types';
import { 
  ListPlus, Plus, Trash2, Edit2, ArrowUp, ArrowDown, 
  X, AlertTriangle 
} from 'lucide-react';

export const ManageCategoriesPage: React.FC = () => {
  const { selectedSeasonId, selectedSeason } = useSeasonContext();
  const { 
    categories, loading, createCategory, 
    updateCategory, deleteCategory, reorderCategories 
  } = useCategories(selectedSeasonId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [maxScore, setMaxScore] = useState(50);

  // Delete Target
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setMaxScore(50);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setMaxScore(cat.maxScore);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !maxScore || !selectedSeasonId) return;

    const payload = {
      name,
      maxScore,
      order: editingCategory ? editingCategory.order : categories.length + 1,
      seasonId: selectedSeasonId,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { 
          name: payload.name, 
          maxScore: payload.maxScore, 
          order: payload.order 
        });
      } else {
        await createCategory(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Recalculate orders (1-based index)
    const reorderPayload = newCategories.map((cat, i) => ({
      categoryId: cat.id,
      order: i + 1,
    }));

    try {
      await reorderCategories(reorderPayload);
    } catch (err) {
      console.error('Failed to reorder', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteCategory(deleteTargetId);
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && categories.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ListPlus className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>إدارة فئات التقييم والدرجات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة فئات درجات مثل (ألحان، طقس، سلوك، كرة قدم...) لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>، وتحديد الدرجات القصوى وترتيب ظهورها.
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-brand-gold-500 text-brand-navy-950 hover:bg-brand-gold-400 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة فئة جديدة</span>
        </button>
      </div>

      {/* Categories Entries List */}
      {categories.length > 0 ? (
        <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                <th className="py-4 px-6 w-20 text-center">الترتيب</th>
                <th className="py-4 px-6 w-52">اسم الفئة</th>
                <th className="py-4 px-6 text-center">الحد الأقصى للدرجة (Max Score)</th>
                <th className="py-4 px-6 text-center w-28">تغيير الترتيب</th>
                <th className="py-4 px-6 text-center w-48">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs text-slate-800 dark:text-slate-200">
              {categories.map((cat, index) => {
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/30 transition-colors">
                    
                    {/* Position order */}
                    <td className="py-4 px-6 text-center font-bold text-slate-400">
                      #{index + 1}
                    </td>

                    {/* Category Name */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      {cat.name}
                    </td>

                    {/* Max Score */}
                    <td className="py-4 px-6 text-center font-black text-slate-700 dark:text-slate-300">
                      {cat.maxScore} درجة
                    </td>

                    {/* Shift Rank order buttons */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="h-7 w-7 rounded-md border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-brand-navy-800 dark:text-slate-400 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={index === categories.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="h-7 w-7 rounded-md border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-brand-navy-800 dark:text-slate-400 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(cat)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-brand-navy-800 dark:text-slate-300 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
                          title="تعديل اسم الفئة والدرجة"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteTargetId(cat.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          title="حذف الفئة"
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
          title="لا توجد فئات مدرجة بعد" 
          description="يرجى النقر على زر إضافة فئة جديدة بالأعلى لتسجيل أول فئة درجات يتم التقييم بناءً عليها." 
        />
      )}

      {/* CRUD Dialog/Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-850 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingCategory ? 'تعديل فئة التقييم' : 'إضافة فئة درجات جديدة'}
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
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">اسم فئة التقييم</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ألحان وطقوس"
                  required
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                />
              </div>

              {/* Max Score */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">الحد الأقصى للدرجة</label>
                <input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                  placeholder="مثال: 50"
                  required
                  min={1}
                  max={10000}
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                />
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
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">هل أنت متأكد من حذف الفئة؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              ⚠️ <strong>تحذير:</strong> سيؤدي حذف فئة التقييم إلى مسح جميع درجات التقييم المقيدة للفرق تحت هذه الفئة نهائياً!
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
