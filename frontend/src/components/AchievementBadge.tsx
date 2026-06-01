import React from 'react';
import { Award, ShieldAlert, Star, TrendingUp, Zap, Sparkles } from 'lucide-react';

interface AchievementBadgeProps {
  type: 'highest' | 'lowest' | 'consistent' | 'strongest' | 'competitive' | 'generic';
  title: string;
  subtitle?: string;
  valueText?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  title,
  subtitle,
  valueText,
}) => {
  const badgeConfig = {
    highest: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/40',
      iconBg: 'shiny-gold-bg text-brand-navy-950',
      icon: Star,
      accentText: 'text-amber-600 dark:text-amber-400',
    },
    lowest: {
      bg: 'bg-rose-50 dark:bg-rose-950/10',
      border: 'border-rose-200 dark:border-rose-900/30',
      iconBg: 'bg-rose-500 text-white',
      icon: ShieldAlert,
      accentText: 'text-rose-600 dark:text-rose-400',
    },
    consistent: {
      bg: 'bg-teal-50 dark:bg-teal-950/10',
      border: 'border-teal-200 dark:border-teal-900/30',
      iconBg: 'bg-teal-500 text-white',
      icon: TrendingUp,
      accentText: 'text-teal-600 dark:text-teal-400',
    },
    strongest: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/15',
      border: 'border-indigo-200 dark:border-indigo-900/40',
      iconBg: 'bg-indigo-600 text-white',
      icon: Zap,
      accentText: 'text-indigo-600 dark:text-indigo-400',
    },
    competitive: {
      bg: 'bg-violet-50 dark:bg-violet-950/15',
      border: 'border-violet-200 dark:border-violet-900/40',
      iconBg: 'bg-violet-600 text-white',
      icon: Sparkles,
      accentText: 'text-violet-600 dark:text-violet-400',
    },
    generic: {
      bg: 'bg-slate-50 dark:bg-slate-900/50',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-slate-500 text-white',
      icon: Award,
      accentText: 'text-slate-600 dark:text-slate-400',
    },
  };

  const config = badgeConfig[type] || badgeConfig.generic;
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-2xl border ${config.bg} ${config.border} flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] shadow-sm`} dir="rtl">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-extrabold shadow-md shrink-0 ${config.iconBg}`}>
        <Icon className="h-5.5 w-5.5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </h4>
        {subtitle && (
          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {subtitle}
          </p>
        )}
        {valueText && (
          <p className={`text-xs font-bold mt-1 ${config.accentText}`}>
            {valueText}
          </p>
        )}
      </div>
    </div>
  );
};
