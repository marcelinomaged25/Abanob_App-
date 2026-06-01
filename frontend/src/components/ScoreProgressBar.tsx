import React from 'react';

interface ScoreProgressBarProps {
  score: number;
  maxScore: number;
  showText?: boolean;
}

export const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({ 
  score, 
  maxScore, 
  showText = true 
}) => {
  const percentage = maxScore > 0 ? Math.min(Math.round((score / maxScore) * 100), 100) : 0;

  // Determine dynamic glow colors
  let barColor = 'bg-red-500';
  let textColor = 'text-red-500 dark:text-red-400';
  if (percentage >= 85) {
    barColor = 'bg-brand-gold-500';
    textColor = 'text-brand-gold-600 dark:text-brand-gold-400 font-extrabold';
  } else if (percentage >= 60) {
    barColor = 'bg-brand-navy-500 dark:bg-brand-navy-400';
    textColor = 'text-brand-navy-600 dark:text-brand-navy-300';
  }

  return (
    <div className="w-full flex flex-col gap-1">
      {showText && (
        <div className="flex items-center justify-between text-xs font-bold" dir="rtl">
          <span className="text-slate-600 dark:text-slate-400">الدرجة المحققة</span>
          <span className={textColor}>
            {score} من {maxScore} ({percentage}%)
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-brand-navy-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-brand-navy-800">
        <div 
          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
