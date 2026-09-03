import React from 'react';

export const RiskGauge = ({ score = 0, size = 120, strokeWidth = 10, showLabel = true }) => {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#10b981'; // Emerald Low
  let textColor = 'text-emerald-700';
  let bgColor = 'bg-emerald-50';
  let borderColor = 'border-emerald-200';
  let level = 'LOW';

  if (normalizedScore >= 81) {
    color = '#dc2626'; // Red Critical
    textColor = 'text-red-700';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    level = 'CRITICAL';
  } else if (normalizedScore >= 61) {
    color = '#ea580c'; // Orange High
    textColor = 'text-orange-700';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    level = 'HIGH';
  } else if (normalizedScore >= 31) {
    color = '#ca8a04'; // Yellow Medium
    textColor = 'text-amber-700';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-200';
    level = 'MEDIUM';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white tracking-tight font-mono drop-shadow-xs">
            {normalizedScore}
          </span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            /100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className={`mt-2 px-3 py-0.5 rounded-full border text-xs font-black uppercase tracking-wider ${bgColor} ${textColor} ${borderColor}`}>
          {level} RISK
        </div>
      )}
    </div>
  );
};

export default RiskGauge;
