import React, { useEffect, useState, useMemo } from 'react';
import { getAuditLogs } from '@/services/auditService';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import type { AuditLog } from '@/types';
import { History } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const auditData = await getAuditLogs();
        setLogs(auditData);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تحميل سجل العمليات');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  // Filter logs by search query (name or email or action)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => 
      log.userFullName.toLowerCase().includes(q) ||
      log.userEmail.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityName.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  // Pagination
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="w-full space-y-6 animate-fade-in" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-brand-navy-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5.5 w-5.5 text-brand-gold-500" />
            <span>سجل العمليات الإدارية (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سجل إلكتروني متكامل يوضح العمليات التي أجراها المشرفون من رصد للدرجات وتغيير لأسماء الفئات والفرق لضمان الشفافية.
          </p>
        </div>
      </div>

      {/* Control Box */}
      {logs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-brand-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-800 shadow-sm">
          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="البحث بالاسم، البريد أو الإجراء..." 
          />
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            عدد العمليات المسجلة: <span className="text-brand-navy-600 dark:text-brand-gold-400 font-extrabold">{filteredLogs.length} عملية</span>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {logs.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto border border-slate-200 dark:border-brand-navy-800 rounded-2xl bg-white dark:bg-brand-navy-950 shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-brand-navy-900 border-b border-slate-200 dark:border-brand-navy-800 text-xs font-black text-slate-700 dark:text-slate-300">
                  <th className="py-4 px-6 w-32">التوقيت</th>
                  <th className="py-4 px-6 w-44">المشرف</th>
                  <th className="py-4 px-6 w-36">نوع الإجراء</th>
                  <th className="py-4 px-6">المُستهدَف (Entity)</th>
                  <th className="py-4 px-4 text-center">الدرجة السابقة</th>
                  <th className="py-4 px-4 text-center">الدرجة الجديدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-navy-900 text-xs text-slate-800 dark:text-slate-200">
                {paginatedLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-brand-navy-900/30 transition-colors">
                      
                      {/* Time */}
                      <td className="py-4 px-6 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString('ar-EG', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>

                      {/* Admin Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white">{log.userFullName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{log.userEmail}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6">
                        <span className="font-black text-brand-navy-700 dark:text-brand-gold-400">
                          {log.action}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                        {log.entityName}
                      </td>

                      {/* Old Value */}
                      <td className="py-4 px-4 text-center font-bold text-slate-400">
                        {log.oldValue || '-'}
                      </td>

                      {/* New Value */}
                      <td className="py-4 px-4 text-center font-black text-brand-navy-600 dark:text-brand-gold-400">
                        {log.newValue || '-'}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-brand-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-brand-navy-800 shadow-sm text-xs font-bold" dir="rtl">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3.5 py-2 border border-slate-200 dark:border-brand-navy-800 rounded-lg hover:bg-slate-50 dark:hover:bg-brand-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                السابق
              </button>
              <span className="text-slate-500 dark:text-slate-400">
                صفحة <span className="text-slate-800 dark:text-white font-extrabold">{currentPage}</span> من <span className="font-extrabold">{totalPages}</span>
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3.5 py-2 border border-slate-200 dark:border-brand-navy-800 rounded-lg hover:bg-slate-50 dark:hover:bg-brand-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                التالي
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState 
          title="سجل العمليات فارغ" 
          description="لا تتوفر أي عمليات إدارية مسجلة بعد في قاعدة البيانات." 
        />
      )}

    </div>
  );
};
