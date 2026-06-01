import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';

interface ExportButtonProps {
  onExportPdf: () => void;
  onExportExcel: () => void;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportPdf,
  onExportExcel,
  label = 'تصدير البيانات',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-right" dir="rtl">
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold bg-brand-gold-500 text-brand-navy-950 hover:bg-brand-gold-400 rounded-xl shadow-sm transition-colors duration-200 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 z-50 animate-scale-in">
            <div className="py-1">
              <button
                onClick={() => {
                  onExportExcel();
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>تحميل كملف Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => {
                  onExportPdf();
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full text-right px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-navy-800 transition-colors cursor-pointer"
              >
                <FileText className="h-4 w-4 text-red-600" />
                <span>تحميل كتقرير PDF (.pdf)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
