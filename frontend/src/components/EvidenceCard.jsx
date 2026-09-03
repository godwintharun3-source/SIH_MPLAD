import React from 'react';
import { Sparkles, FileText, CheckCircle2, AlertTriangle, ArrowUpRight, Scale } from 'lucide-react';

export const EvidenceCard = ({ project, reasons = [], advisoryActions = [] }) => {
  if (!project) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            WHY WAS THIS PROJECT FLAGGED?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective, evidence-based diagnostic signals identifying unusual patterns for officer verification
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
          Work ID: #{project.project_id}
        </span>
      </div>

      {/* Structured Evidence Items */}
      <div className="space-y-3">
        {reasons && reasons.length > 0 ? (
          reasons.map((reason, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:bg-slate-100/60 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gov-100 text-gov-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                {idx + 1}
              </div>
              <div className="space-y-1 flex-1 text-xs">
                <p className="font-semibold text-slate-900 leading-relaxed">{reason}</p>
                
                {/* Metric Context Pill if matching cost or completion */}
                {reason.toLowerCase().includes('cost') && project.cost_deviation_pct !== 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600 font-mono">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                      Sanctioned: ₹{Number(project.recommended_amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                      Certified: ₹{Number(project.final_amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
                      Variance: +{project.cost_deviation_pct}%
                    </span>
                  </div>
                )}

                {reason.toLowerCase().includes('peer') && (
                  <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-gov-600" />
                    <span>Cross-referenced against comparable works in sector cohort "{project.category}"</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs italic">
            This project operates within standard statistical baselines without elevated individual risk triggers.
          </div>
        )}
      </div>

      {/* Advisory Human Review Checklist */}
      <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-700" />
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            Prioritized Field Inspection Checklist:
          </h4>
        </div>
        <p className="text-[11px] text-amber-900">
          The AI system assists prioritization. Final compliance determinations require statutory on-site verification.
        </p>

        <ul className="space-y-2 text-xs text-slate-800">
          {(advisoryActions && advisoryActions.length > 0 ? advisoryActions : [
            "Verify physical asset completion on site with GPS-tagged photographs.",
            "Inspect detailed measurement book (MB) and verify bills against technical sanctions.",
            "Cross-examine vendor expenditure vouchers and completion certificates with the district IDA."
          ]).map((act, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-snug">{act}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default EvidenceCard;
