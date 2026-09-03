import React from 'react';
import { X, Scale, ArrowRight, ShieldAlert, CheckCircle, TrendingUp, IndianRupee } from 'lucide-react';
import RiskBadge from './RiskBadge';

export const ProjectCompareModal = ({ isOpen, onClose, targetProject, similarData }) => {
  if (!isOpen || !targetProject) return null;

  const peerBenchmark = similarData?.benchmark || {};
  const currentRec = Number(targetProject.recommended_amount || 0);
  const currentFin = Number(targetProject.final_amount || 0);
  const peerMedian = Number(peerBenchmark.peer_median_amount || currentRec);

  const varianceVsMedian = peerMedian > 0 
    ? Math.round(((currentRec - peerMedian) / peerMedian) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gov-900 text-white flex items-center justify-between border-b border-gov-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gov-800 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Comparable Project Peer Comparison Matrix
                <span className="text-[10px] px-2 py-0.5 rounded bg-gov-800 text-slate-300 font-mono">
                  #{targetProject.project_id}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Benchmarking against peer cohort in sector "{targetProject.category}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gov-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Target Project Card */}
            <div className="p-5 rounded-xl border-2 border-gov-600 bg-gov-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-gov-800">
                  Target Flagged Work
                </span>
                <RiskBadge level={targetProject.risk_level} score={targetProject.risk_score} size="sm" />
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {targetProject.work_description}
              </h4>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-gov-200/60">
                <div><strong>Location:</strong> {targetProject.constituency}, {targetProject.state}</div>
                <div><strong>MP:</strong> {targetProject.mp_name}</div>
                <div><strong>Status:</strong> {targetProject.completion_status}</div>
              </div>

              <div className="pt-2 border-t border-gov-200/60 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Sanctioned Budget:</span>
                  <strong className="font-mono text-slate-900">₹{currentRec.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Final Certified Amount:</span>
                  <strong className="font-mono text-slate-900">
                    {currentFin > 0 ? `₹${currentFin.toLocaleString('en-IN')}` : 'Pending'}
                  </strong>
                </div>
                {targetProject.cost_deviation_pct !== 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Cost Escalation:</span>
                    <strong className="font-mono text-red-600">+{targetProject.cost_deviation_pct}%</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Peer Benchmark Cohort Card */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sector Peer Median Baseline
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Sector Cohort
                </span>
              </div>

              <h4 className="text-sm font-semibold text-slate-700 leading-snug">
                Median of Comparable Works in "{targetProject.category}"
              </h4>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                <div><strong>Jurisdiction:</strong> {targetProject.state} / National Sector</div>
                <div><strong>Cohort Size:</strong> {similarData?.similar_projects?.length || 5} Nearest Peers</div>
                <div><strong>Variance vs Peer Median:</strong> <strong className={varianceVsMedian > 50 ? 'text-red-600' : 'text-slate-900'}>+{varianceVsMedian}%</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Peer Median Sanction:</span>
                  <strong className="font-mono text-slate-900">₹{peerMedian.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Peer Range:</span>
                  <strong className="font-mono text-slate-700">
                    ₹{((peerBenchmark.peer_min_amount || 0)/100000).toFixed(1)}L - ₹{((peerBenchmark.peer_max_amount || 0)/100000).toFixed(1)}L
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* Peer Cohort Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Individual Comparable Works in Peer Cohort:
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Peer Work</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2 text-right">Sanction Amount</th>
                    <th className="px-3 py-2 text-right">Target Variance</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(similarData?.similar_projects || []).map((sim) => (
                    <tr key={sim.project_id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-900 max-w-xs truncate" title={sim.work_description}>
                        #{sim.project_id} - {sim.work_description}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {sim.constituency}, {sim.state}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        ₹{sim.recommended_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">
                        <span className={sim.deviation_pct > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {sim.deviation_pct > 0 ? `+${sim.deviation_pct}%` : `${sim.deviation_pct}%`}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                          {sim.completion_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectCompareModal;
