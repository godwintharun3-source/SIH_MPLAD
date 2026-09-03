import React from 'react';

export const RiskBadge = ({ level = 'LOW', score = null, size = 'md' }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const styles = {
    CRITICAL: {
      bg: 'bg-red-50 text-red-800 border-red-200 ring-red-500/10',
      dot: 'bg-red-600',
      symbol: '🔴',
      label: 'CRITICAL',
    },
    HIGH: {
      bg: 'bg-orange-50 text-orange-800 border-orange-200 ring-orange-500/10',
      dot: 'bg-orange-600',
      symbol: '🟠',
      label: 'HIGH',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/10',
      dot: 'bg-amber-500',
      symbol: '🟡',
      label: 'MEDIUM',
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/10',
      dot: 'bg-emerald-600',
      symbol: '🟢',
      label: 'LOW',
    },
  };

  const current = styles[normLevel] || styles.LOW;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-md border ring-1 ${current.bg} ${sizeClasses[size] || sizeClasses.md}`}
      role="status"
      aria-label={`Risk Level: ${current.label}${score !== null ? `, Score: ${score}` : ''}`}
    >
      <span className="text-[10px] leading-none" aria-hidden="true">{current.symbol}</span>
      <span className="font-extrabold uppercase tracking-wide">{current.label}</span>
      {score !== null && (
        <span className="font-mono opacity-80 font-normal">
          ({score})
        </span>
      )}
    </span>
  );
};

export default RiskBadge;
