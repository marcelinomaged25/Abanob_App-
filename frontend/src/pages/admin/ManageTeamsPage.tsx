import React, { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useSeasonContext } from '@/context/SeasonContext';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import type { Team } from '@/types';
import { 
  Users, Plus, Trash2, Edit2, 
  X, AlertTriangle, UploadCloud 
} from 'lucide-react';

export const ManageTeamsPage: React.FC = () => {
  const { selectedSeasonId, selectedSeason } = useSeasonContext();
  const { teams, loading, createTeam, updateTeam, deleteTeam, uploadTeamLogo } = useTeams(selectedSeasonId);
  const maxTeamMembers = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>(['']);
  const [searchQuery, setSearchQuery] = useState('');

  // Logo Upload Fields
  const [uploadingLogoTeamId, setUploadingLogoTeamId] = useState<string | null>(null);

  // Delete Target
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingTeam(null);
    setName('');
    setDescription('');
    setMemberNames(['']);
    setModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setDescription(team.description);
    setModalOpen(true);
  };

  const updateMemberName = (index: number, value: string) => {
    setMemberNames((current) => current.map((item, currentIndex) => (currentIndex === index ? value : item)));
  };

  const addMemberField = () => {
    setMemberNames((current) => {
      if (current.length >= maxTeamMembers) {
        return current;
      }

      return [...current, ''];
    });
  };

  const removeMemberField = (index: number) => {
    setMemberNames((current) => {
      if (current.length === 1) {
        return [''];
      }

      return current.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeasonId) {
      alert('اختر موسمًا نشطًا أولًا قبل إضافة الفريق.');
      return;
    }

    if (!name.trim()) {
      alert('اكتب اسم الفريق أولًا.');
      return;
    }

    const normalizedMemberNames = memberNames
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, maxTeamMembers);

    const payload = {
      name,
      description,
      logoUrl: editingTeam ? editingTeam.logoUrl : '/uploads/logos/default-team.png',
      seasonId: selectedSeasonId,
      memberNames: editingTeam ? undefined : normalizedMemberNames,
    };

    try {
      if (editingTeam) {
        const updatePayload = {
          id: editingTeam.id,
          name: payload.name,
          description: payload.description,
          logoUrl: payload.logoUrl,
          seasonId: payload.seasonId,
        };
        await updateTeam(editingTeam.id, updatePayload);
      } else {
        await createTeam(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoChange = async (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogoTeamId(teamId);
    try {
      await uploadTeamLogo(teamId, file);
    } catch (err) {
      console.error('Failed to upload logo', err);
      alert('حدث خطأ أثناء تحميل الشعار. يرجى مراجعة حجم الملف وصيغته.');
    } finally {
      setUploadingLogoTeamId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteTeam(deleteTargetId);
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && teams.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>إدارة الفرق والمجموعات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة الفرق المتنافسة لـ <span className="font-extrabold text-brand-navy-600 dark:text-brand-gold-400">{selectedSeason?.name}</span>، تعديل تفاصيلها، ورفع شعاراتها المخصصة.
          </p>
        </div>
        
        <button
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-brand-gold-500 text-brand-navy-950 hover:bg-brand-gold-400 rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة فريق جديد</span>
        </button>
      </div>

      {/* Search and Stats */}
      {teams.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-brand-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-800 shadow-sm">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="البحث عن فريق مسجل..." 
          />
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            إجمالي الفرق المسجلة: <span className="text-brand-navy-600 dark:text-brand-gold-400 font-extrabold">{filteredTeams.length} فريق</span>
          </div>
        </div>
      )}

      {/* Teams Entries List */}
      {teams.length > 0 ? (
        <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                <th className="py-4 px-6 w-20 text-center">شعار الفريق</th>
                <th className="py-4 px-6 w-52">اسم الفريق</th>
                <th className="py-4 px-6">الوصف والتفاصيل</th>
                <th className="py-4 px-4 text-center">تاريخ الإدراج</th>
                <th className="py-4 px-6 text-center w-48">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs text-slate-800 dark:text-slate-200">
              {filteredTeams.map((team) => {
                const initials = team.name.replace('فريق ', '').slice(0, 2);
                const isUploadingThis = uploadingLogoTeamId === team.id;

                return (
                  <tr key={team.id} className="hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/30 transition-colors">
                    
                    {/* Team Logo / Avatar */}
                    <td className="py-4 px-6 text-center">
                      <div className="relative group mx-auto h-12 w-12 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-brand-navy-900 font-black text-xs text-brand-gold-500 shadow-sm shrink-0">
                        {isUploadingThis ? (
                          <div className="h-5 w-5 border-2 border-brand-gold-500 border-t-transparent rounded-full animate-spin" />
                        ) : team.logoUrl && !team.logoUrl.includes('default') ? (
                          <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                        
                        {/* Hover Overlay: Upload Icon */}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                          <UploadCloud className="h-4 w-4 text-brand-gold-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoChange(team.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </td>

                    {/* Team Name */}
                    <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex flex-col gap-1">
                        <span>{team.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {team.memberCount ?? 0} أفراد
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {team.description || '-'}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-center text-slate-400">
                      {new Date(team.createdAt).toLocaleDateString('ar-EG')}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(team)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-brand-navy-800 dark:text-slate-300 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
                          title="تعديل الاسم والملخص"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteTargetId(team.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950/30 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                          title="حذف الفريق"
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
          title="لا يوجد فرق مسجلة بعد" 
          description="يرجى النقر على زر إضافة فريق جديد بالأعلى لتسجيل أول فريق متنافس في هذا الموسم." 
        />
      )}

      {/* CRUD Dialog/Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-navy-850 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingTeam ? 'تعديل تفاصيل الفريق' : 'إضافة فريق متنافس جديد'}
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
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">اسم الفريق / المجموعة</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فريق مارمرقس"
                  required
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">تفاصيل ونبذة</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملخص عن أعضاء الفريق ومشاركته..."
                  rows={3}
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                />
              </div>

              {!editingTeam && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                      أفراد الفريق
                    </label>
                    <button
                      type="button"
                      onClick={addMemberField}
                      disabled={memberNames.length >= maxTeamMembers}
                      className="inline-flex items-center gap-1 rounded-lg border border-brand-gold-500/40 px-3 py-1.5 text-[10px] font-extrabold text-brand-gold-600 hover:bg-brand-gold-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-gold-400 dark:hover:bg-brand-gold-500/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      إضافة فرد
                    </button>
                  </div>

                  <div className="space-y-2">
                    {memberNames.map((value, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateMemberName(index, e.target.value)}
                          placeholder={`اسم الفرد رقم ${index + 1}`}
                          className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeMemberField(index)}
                          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-brand-navy-800 dark:text-slate-300 dark:hover:bg-brand-navy-800"
                          title="حذف الفرد"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400">
                    يمكنك إضافة حتى {maxTeamMembers} أفراد للفريق الجديد.
                  </p>
                </div>
              )}

              {editingTeam && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                  تعديل أفراد الفريق من هذه الشاشة غير مفعل الآن حتى لا نحذف الأسماء الحالية بالخطأ. يمكنك تعديل اسم الفريق والوصف والشعار فقط.
                </p>
              )}

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
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">هل أنت متأكد من حذف الفريق؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              ⚠️ <strong>تحذير:</strong> سيؤدي حذف الفريق إلى حذف جميع درجاته المقيمة في كل فئات البطولة وتعديل ترتيب المتصدرين تلقائياً. لا يمكن التراجع!
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
