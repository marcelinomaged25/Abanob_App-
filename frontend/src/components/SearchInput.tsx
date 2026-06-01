import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = 'بحث عن فريق أو لاعب...' 
}) => {
  return (
    <div className="relative w-full max-w-sm" dir="rtl">
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pr-9 pl-3 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-900 dark:border-brand-navy-800 dark:text-slate-100 rounded-xl focus:border-brand-navy-500 focus:bg-white dark:focus:bg-brand-navy-900 focus:outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
      />
    </div>
  );
};
