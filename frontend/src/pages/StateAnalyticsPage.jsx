import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  IndianRupee, 
  Building2, 
  ShieldAlert, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export const StateAnalyticsPage = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const res = await api.getStateAnalytics();
      setStates(res);
      if (res.length > 0) {
        setSelectedState(res[0]);
      }
    } catch (err) {
      console.error('Error fetching state analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-700">Loading State & Geographic Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Geographic State & Regional Intelligence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                State-level allocation aggregates, completion ratios, and concentrated risk distributions across India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Key States Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {states.slice(0, 4).map((st) => (
          <div 
            key={st.state}
            onClick={() => setSelectedState(st)}
            className={`p-5 bg-white rounded-2xl border cursor-pointer transition-all shadow-2xs ${
              selectedState?.state === st.state ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">{st.state}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200 font-mono">
                {st.total_projects.toLocaleString()} Works
              </span>
            </div>
            <p className="text-2xl font-black font-mono text-slate-900 mt-2">
              ₹{(st.total_recommended / 10000000).toFixed(1)} Cr
            </p>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100 font-medium">
              <span>Completed: <strong className="text-emerald-700 font-mono">{st.completed_count}</strong></span>
              <span className="text-red-600 font-bold font-mono">{st.high_risk_count} Flagged</span>
            </div>
          </div>
        ))}
      </div>

      {/* All States Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All 36 States & Union Territories ({states.length} Active Jurisdictions)
          </h3>
          <span className="text-[11px] text-slate-500">Sorted by Sanctioned Budget</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">State / Union Territory</th>
                <th className="px-4 py-3 text-right">Total Works</th>
                <th className="px-4 py-3 text-right">Sanction Budget</th>
                <th className="px-4 py-3 text-right">Certified Final</th>
                <th className="px-4 py-3 text-center">Completed</th>
                <th className="px-4 py-3 text-center">Unverified</th>
                <th className="px-4 py-3 text-center">High-Risk Indicators</th>
                <th className="px-4 py-3 text-center">Avg Risk Score</th>
                <th className="px-4 py-3 text-center">Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {states.map((st) => (
                <tr key={st.state} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {st.state}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {st.total_projects.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{(st.total_recommended / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">
                    ₹{(st.total_final / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-700 font-bold">
                    {st.completed_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-amber-700">
                    {st.unverified_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {st.high_risk_count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[11px] border border-red-200 font-mono">
                        {st.high_risk_count} Flagged
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold">
                    {st.avg_risk_score} / 100
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/high-risk?state=${encodeURIComponent(st.state)}`)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200 transition-colors shadow-2xs"
                    >
                      View Works
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StateAnalyticsPage;
