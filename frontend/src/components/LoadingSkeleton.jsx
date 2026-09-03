import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 6 }) => {
  const items = Array.from({ length: count });

  if (type === 'dashboard') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Top KPI Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-white/90 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-7 w-28 bg-slate-300 dark:bg-slate-700 rounded-md" />
              <div className="h-2.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Priority Review Queue Table Skeleton */}
        <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          {/* Table Header Bar Skeleton */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/60">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-red-200 dark:bg-red-900/50" />
                <div className="h-5 w-48 bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="h-4 w-24 bg-red-100 dark:bg-red-950/60 rounded-full" />
              </div>
              <div className="h-3 w-80 max-w-full bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-8 w-44 bg-blue-100 dark:bg-blue-950/60 rounded-xl" />
          </div>

          {/* Quick Triage Pills Skeleton */}
          <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 overflow-x-auto">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded shrink-0" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
            ))}
          </div>

          {/* Table Rows Skeleton */}
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-14 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between px-4 border border-slate-100 dark:border-white/5 gap-4"
              >
                <div className="h-6 w-24 bg-red-100 dark:bg-red-950/50 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 w-44 bg-slate-300 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded hidden md:block" />
                <div className="h-6 w-48 bg-amber-50 dark:bg-amber-950/40 rounded-lg hidden lg:block" />
                <div className="h-4 w-12 bg-red-100 dark:bg-red-950/50 rounded-md" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block" />
                <div className="h-7 w-24 bg-blue-600/30 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="h-4 w-52 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-56 bg-slate-100 dark:bg-slate-900/60 rounded-xl flex items-end justify-between p-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-200 dark:bg-blue-900/40 rounded-t w-full"
                  style={{ height: `${25 + (i * 12) % 65}%` }}
                />
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-56 rounded-full border-8 border-slate-200 dark:border-slate-800 border-t-blue-500 w-44 h-44 mx-auto my-auto animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'kpi') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-28 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 animate-pulse shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-5 w-56 bg-slate-300 dark:bg-slate-700 rounded-md" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-10 bg-slate-100 dark:bg-slate-900/80 rounded-xl" />
        <div className="space-y-2.5 pt-2">
          {items.map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-between px-4 gap-4 border border-slate-100 dark:border-white/5">
              <div className="h-5 w-24 bg-red-100 dark:bg-red-950/50 rounded-full shrink-0" />
              <div className="h-3.5 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block" />
              <div className="h-5 w-36 bg-amber-50 dark:bg-amber-950/40 rounded hidden md:block" />
              <div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-7 w-20 bg-blue-600/30 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 animate-pulse space-y-4 shadow-xs">
        <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="h-56 bg-slate-100 dark:bg-slate-900/60 rounded-xl flex items-end justify-between p-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-blue-200 dark:bg-blue-900/40 rounded-t w-full"
              style={{ height: `${20 + (i * 10) % 70}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0e1424] p-6 rounded-2xl border border-slate-200 dark:border-white/10 animate-pulse space-y-4 shadow-xs">
      <div className="h-5 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
  );
};

export default LoadingSkeleton;
