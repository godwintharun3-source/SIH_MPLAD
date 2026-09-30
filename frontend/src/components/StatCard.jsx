import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue', featured = false, badge = null, onClick }) => {
  const iconStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const topBorderStyles = {
    blue: 'border-t-2 border-t-blue-600',
    emerald: 'border-t-2 border-t-emerald-600',
    amber: 'border-t-2 border-t-amber-500',
    red: 'border-t-2 border-t-red-600',
    purple: 'border-t-2 border-t-purple-600',
  };

  if (featured) {
    return (
      <div 
        onClick={onClick}
        className={`glass-panel rounded-2xl border-2 border-amber-400 dark:border-amber-500/50 p-4 xl:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full flex flex-col justify-between ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start justify-between gap-2.5 min-w-0 w-full">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] xl:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 truncate">
                {badge || 'HIGH PRIORITY ACTION'}
              </span>
            </div>
            <p className="text-[11px] xl:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-amber-200/80 truncate">{title}</p>
            <p className="text-2xl xl:text-3xl font-black text-amber-950 dark:text-amber-300 font-mono tracking-tight truncate">{value}</p>
            {subtitle && (
              <p className="text-[11px] xl:text-xs font-semibold text-amber-900 dark:text-amber-200/70 flex items-center gap-1 mt-1 truncate">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="p-2.5 xl:p-3 rounded-2xl bg-amber-500 text-slate-950 font-bold border border-amber-400 shrink-0 shadow-2xs self-start">
              <Icon className="w-5 h-5 xl:w-6 xl:h-6" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-3 pt-3 border-t border-amber-200/80 dark:border-white/10 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 font-medium">
            <span className="truncate mr-2">{trend.label}</span>
            <span className="font-bold text-amber-950 dark:text-white font-mono shrink-0">{trend.value}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-3.5 xl:p-4 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden ${topBorderStyles[color] || topBorderStyles.blue} ${onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-white/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0 w-full">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[10px] xl:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{title}</p>
          <p className="text-base sm:text-lg xl:text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap leading-snug">{value}</p>
          {subtitle && (
            <p className="text-[10px] xl:text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-xl border ${iconStyles[color] || iconStyles.blue} dark:bg-white/5 dark:border-white/10 shrink-0 self-start`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {trend ? (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span className="truncate mr-2 text-[11px]">{trend.label}</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono shrink-0 text-[11px]">{trend.value}</span>
        </div>
      ) : (
        <div className="mt-1 border-t border-transparent" />
      )}
    </div>
  );
};

export default StatCard;
