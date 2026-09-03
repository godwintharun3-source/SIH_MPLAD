import React from 'react';
import RiskBadge from './RiskBadge';

export const RiskScoreCard = ({ score = 0, level = 'LOW', breakdown = {}, maxWeights = null }) => {
  const defaults = {
    cost_anomaly_max: 30,
    completion_concern_max: 25,
    payment_anomaly_max: 20,
    duplicate_concern_max: 15,
    similarity_anomaly_max: 10,
    ml_boost_max: 8
  };

  const weights = maxWeights || defaults;

  const factors = [
    {
      id: 'cost_anomaly',
      label: 'Cost Deviation Indicator',
      pts: breakdown.cost_anomaly || 0,
      max: weights.cost_anomaly_max || 30,
      description: 'Variance vs sanctioned administrative approval'
    },
    {
      id: 'completion_concern',
      label: 'Completion Status & Duration',
      pts: breakdown.completion_concern || 0,
      max: weights.completion_concern_max || 25,
      description: 'Timeline overrun or unverified completion record'
    },
    {
      id: 'payment_anomaly',
      label: 'Payment Voucher Concentration',
      pts: breakdown.payment_anomaly || 0,
      max: weights.payment_anomaly_max || 20,
      description: 'Disbursement frequency & expenditure vs budget'
    },
    {
      id: 'duplicate_concern',
      label: 'Duplicate Transaction Signatures',
      pts: breakdown.duplicate_concern || 0,
      max: weights.duplicate_concern_max || 15,
      description: 'Repeated vendor/amount/MP payment vouchers'
    },
    {
      id: 'similarity_anomaly',
      label: 'Sector Peer Cohort Variance',
      pts: breakdown.similarity_anomaly || 0,
      max: weights.similarity_anomaly_max || 10,
      description: 'Cost disparity relative to sector median baseline'
    },
    {
      id: 'ml_anomaly_boost',
      label: 'Isolation Forest Multi-Vector Outlier',
      pts: breakdown.ml_anomaly_boost || 0,
      max: 8,
      description: 'Unsupervised multi-dimensional feature anomaly boost'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* Header with Large Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Composite Explainable Risk Assessment
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {score}
            </span>
            <span className="text-sm font-bold text-slate-400 font-mono">/ 100 Points</span>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <RiskBadge level={level} score={score} size="lg" />
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Contributing Factor Points:
        </h4>

        <div className="space-y-3">
          {factors.map((f) => {
            const pct = Math.min(100, Math.max(0, (f.pts / f.max) * 100));
            const hasPoints = f.pts > 0;

            return (
              <div key={f.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{f.label}</span>
                    <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">{f.description}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 shrink-0">
                    <span className={hasPoints ? 'text-gov-800 font-extrabold' : 'text-slate-400'}>
                      +{f.pts}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">/ {f.max} pts</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      f.pts === 0
                        ? 'bg-slate-200'
                        : pct >= 80
                        ? 'bg-red-500'
                        : pct >= 40
                        ? 'bg-amber-500'
                        : 'bg-gov-700'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary Strip */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Calculated Cumulative Score:</span>
          <span className="font-mono font-black text-slate-900 text-sm">{score} / 100</span>
        </div>
      </div>

    </div>
  );
};

export default RiskScoreCard;
