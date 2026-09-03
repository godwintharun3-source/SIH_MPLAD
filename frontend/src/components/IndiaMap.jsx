import React, { useState } from 'react';
import { MapPin, ShieldAlert, IndianRupee, ArrowRight, ExternalLink, Filter, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IndiaMap = ({ statesData = [], onSelectState }) => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [metricView, setMetricView] = useState('risk'); // 'risk', 'budget', 'completion', 'projects'
  const navigate = useNavigate();

  const regions = {
    NORTH: ["Uttar Pradesh", "Punjab", "Haryana", "Rajasthan", "Himachal Pradesh", "Jammu and Kashmir", "Uttarakhand", "Delhi", "Chandigarh"],
    SOUTH: ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Kerala", "Puducherry"],
    WEST: ["Maharashtra", "Gujarat", "Goa"],
    EAST: ["West Bengal", "Bihar", "Odisha", "Jharkhand"],
    CENTRAL: ["Madhya Pradesh", "Chhattisgarh"],
    NORTHEAST: ["Assam", "Meghalaya", "Tripura", "Manipur", "Nagaland", "Arunachal Pradesh", "Mizoram", "Sikkim"]
  };

  const regionFiltered = selectedRegion === 'ALL' 
    ? statesData 
    : statesData.filter(s => regions[selectedRegion]?.some(r => r.toLowerCase() === (s.state || '').toLowerCase()));

  // Sort based on active metric
  const sortedStates = [...regionFiltered].sort((a, b) => {
    if (metricView === 'risk') return (b.high_risk_count || 0) - (a.high_risk_count || 0);
    if (metricView === 'budget') return (b.total_recommended || 0) - (a.total_recommended || 0);
    if (metricView === 'completion') {
      const rateA = a.total_projects > 0 ? (a.completed_count / a.total_projects) : 0;
      const rateB = b.total_projects > 0 ? (b.completed_count / b.total_projects) : 0;
      return rateB - rateA;
    }
    return (b.total_projects || 0) - (a.total_projects || 0);
  });

  const getRiskColor = (highRiskCount) => {
    if (highRiskCount >= 3) return 'bg-red-600 text-white';
    if (highRiskCount >= 1) return 'bg-orange-500 text-white';
    return 'bg-emerald-600 text-white';
  };

  const getCardBorder = (highRiskCount) => {
    if (highRiskCount >= 3) return 'border-red-300 bg-red-50/40 hover:border-red-500';
    if (highRiskCount >= 1) return 'border-orange-200 bg-orange-50/30 hover:border-orange-400';
    return 'border-slate-200 bg-white hover:border-blue-400';
  };

  // Top risk concentration list
  const topRiskStates = [...statesData].filter(s => s.high_risk_count > 0).sort((a, b) => b.high_risk_count - a.high_risk_count);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
      
      {/* Top Header & Switchable Metric Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            National Geographic State Intelligence Matrix
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Jurisdiction risk concentration & allocation health across all 36 States & UTs.
          </p>
        </div>

        {/* Switchable Metric Views */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Metric View:</span>
          <button
            onClick={() => setMetricView('risk')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              metricView === 'risk'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🚨 Risk Concentration
          </button>
          <button
            onClick={() => setMetricView('budget')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              metricView === 'budget'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ₹ Sanction Volume
          </button>
          <button
            onClick={() => setMetricView('completion')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              metricView === 'completion'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ✓ Completion Ratio
          </button>
          <button
            onClick={() => setMetricView('projects')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              metricView === 'projects'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📊 Work Count
          </button>
        </div>
      </div>

      {/* State Risk Concentration Leaderboard Bar (Answers "Which regions require attention?") */}
      {metricView === 'risk' && topRiskStates.length > 0 && (
        <div className="bg-red-50/70 p-4 rounded-xl border border-red-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Prioritized Jurisdictions with High-Risk Flagged Works
            </span>
            <span className="text-[11px] text-red-800 font-mono font-bold">
              {topRiskStates.reduce((acc, s) => acc + s.high_risk_count, 0)} Total Flags
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {topRiskStates.map((st) => (
              <div 
                key={st.state}
                onClick={() => navigate(`/high-risk?state=${encodeURIComponent(st.state)}`)}
                className="p-2.5 bg-white rounded-lg border border-red-200 flex items-center justify-between cursor-pointer hover:border-red-400 transition-colors shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-xs block">{st.state}</span>
                  <span className="text-[10px] text-slate-500 font-mono">₹{((st.total_recommended || 0)/10000000).toFixed(1)} Cr</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-black text-xs">
                  {st.high_risk_count} Flags
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Region Filter Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Zone:</span>
          {['ALL', 'NORTH', 'SOUTH', 'WEST', 'EAST', 'CENTRAL', 'NORTHEAST'].map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedRegion === reg
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
          Showing {sortedStates.length} Jurisdictions
        </span>
      </div>

      {/* State Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sortedStates.map((st) => {
          const compPct = st.total_projects > 0 ? ((st.completed_count / st.total_projects) * 100).toFixed(1) : 0;
          return (
            <div
              key={st.state}
              onClick={() => {
                if (onSelectState) onSelectState(st.state);
                navigate(`/high-risk?state=${encodeURIComponent(st.state)}`);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${getCardBorder(st.high_risk_count)}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-700" title={st.state}>
                  {st.state}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${getRiskColor(st.high_risk_count)} font-mono`}>
                  {st.high_risk_count} Flags
                </span>
              </div>

              <div className="mt-2 text-[11px] font-mono font-bold text-slate-900">
                {metricView === 'completion' ? (
                  <span className="text-emerald-700">{compPct}% Complete</span>
                ) : metricView === 'projects' ? (
                  <span>{st.total_projects.toLocaleString()} Works</span>
                ) : (
                  <span>₹{((st.total_recommended || 0) / 10000000).toFixed(1)} Cr</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <span>{st.total_projects} Works</span>
                <span className="text-emerald-700 font-semibold">{st.completed_count} Done</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Standard Operations</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Moderate Risk Signal</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical Prioritized State</span>
        </div>
        <button
          onClick={() => navigate('/states')}
          className="text-blue-700 hover:text-blue-900 font-bold text-[11px] flex items-center gap-1"
        >
          <span>Open 36-State Matrix Table</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};

export default IndiaMap;
