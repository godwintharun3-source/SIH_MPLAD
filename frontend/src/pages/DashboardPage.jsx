import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  IndianRupee, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Layers, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Scale,
  Sliders,
  Filter,
  Eye
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import IndiaMap from '../components/IndiaMap';
import ProjectCompareModal from '../components/ProjectCompareModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [highRiskSample, setHighRiskSample] = useState([]);
  const [statesAnalytics, setStatesAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Compare modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [compareSimilar, setCompareSimilar] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, hrData, stData] = await Promise.all([
        api.getDashboardSummary(),
        api.getHighRiskProjects(6),
        api.getStateAnalytics().catch(() => [])
      ]);
      setSummary(sumData);
      setHighRiskSample(hrData);
      setStatesAnalytics(stData);
    } catch (err) {
      console.error("Dashboard error:", err);
      if (retryCount < 4) {
        setError("Waking up Cloud AI Server... (Render free tier wakes up in ~30s). Retrying automatically...");
        setTimeout(() => {
          loadDashboard(retryCount + 1);
        }, 4000);
      } else {
        setError("Failed to load dashboard metrics. Ensure the backend server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompare = async (project) => {
    setCompareTarget(project);
    try {
      const sim = await api.getProjectSimilar(project.project_id);
      setCompareSimilar(sim);
      setCompareModalOpen(true);
    } catch (err) {
      console.error('Error fetching similar for compare:', err);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error || !summary) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-red-50 border border-red-200 rounded-2xl my-10 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-red-900">Dashboard Unavailable</h3>
        <p className="text-xs text-red-700 mt-1">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const stateChartData = (summary.top_states_by_expenditure || []).map(s => {
    const stateName = String(s.state || 'Unknown');
    return {
      name: stateName.length > 12 ? stateName.slice(0, 10) + '..' : stateName,
      fullState: stateName,
      Budget: Math.round((s.total_budget || 0) / 10000000),
      HighRisk: s.high_risk_count || 0
    };
  });

  const categoryChartData = (summary.top_categories_by_budget || []).map(c => {
    const catName = String(c.category || 'Normal/Others');
    return {
      name: catName.length > 16 ? catName.slice(0, 14) + '..' : catName,
      fullCategory: catName,
      BudgetCr: Math.round((c.total_budget || 0) / 10000000),
      Projects: c.project_count || 0
    };
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Executive Attention-First Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[11px] border border-amber-400/30 uppercase tracking-wider">
              Central Monitoring Desk
            </span>
            <span className="text-slate-500 text-xs">|</span>
            <span className="text-xs text-slate-300 font-mono">
              National Scheme Audit Sync: <strong>2026-08-28</strong>
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            MPLAD Scheme Implementation & Risk Intelligence
          </h2>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            AI-assisted decision-support platform answering: <strong className="text-amber-300">Where should an authorized officer look first?</strong> Prioritizing development works for human inspection across <strong>774 MPs</strong> and <strong>1,26,582 works</strong>.
          </p>
        </div>

        {/* Action Triage Ribbon */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => navigate('/high-risk?risk=CRITICAL')}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 shadow-2xs transition-all animate-pulse"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span>Critical Prioritization ({summary.risk_distribution.CRITICAL})</span>
          </button>

          <button
            onClick={() => navigate('/anomalies')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Anomaly Center</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Attention-First Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* PRIMARY HERO CARD (Spans 2 on xl for dominant attention) */}
        <div className="md:col-span-2 xl:col-span-2">
          <StatCard
            featured={true}
            badge="PRIMARY ATTENTION REQUIRED"
            title="Works Requiring Review"
            value={summary.projects_requiring_verification.toLocaleString()}
            subtitle={`${summary.risk_distribution.CRITICAL} Critical • ${summary.risk_distribution.HIGH} High Risk Flagged`}
            icon={AlertTriangle}
            color="amber"
            onClick={() => navigate('/high-risk?status=COMPLETION_VERIFICATION_REQUIRED')}
            trend={{ label: 'Unverified Completion in Registry', value: 'Action Required' }}
          />
        </div>

        {/* SECONDARY METRICS */}
        <StatCard
          title="Monitored Works"
          value={summary.total_projects.toLocaleString()}
          subtitle={`${summary.total_mps} Monitored MPs`}
          icon={Building2}
          color="blue"
          onClick={() => navigate('/high-risk')}
        />
        <StatCard
          title="Total Expenditure"
          value={`₹${(summary.total_expenditure / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`}
          subtitle={`${summary.utilization_percentage.toFixed(1)}% National Utilization`}
          icon={TrendingUp}
          color="blue"
          onClick={() => navigate('/mps')}
        />
        <StatCard
          title="Completed Works"
          value={summary.completed_projects.toLocaleString()}
          subtitle={`${summary.completion_rate_percentage.toFixed(1)}% Completion Ratio`}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/high-risk?status=COMPLETED')}
        />

        {/* SUPPORTING METRIC */}
        <StatCard
          title="Linked Transactions"
          value={summary.total_transactions.toLocaleString()}
          subtitle="Audit Payment Vouchers"
          icon={Layers}
          color="purple"
          onClick={() => navigate('/anomalies')}
        />
      </div>

      {/* 3. National Risk Tier Distribution Ribbon */}
      <div className="bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              National Risk Tier Distribution (0–100 Point Rubric + Isolation Forest)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deterministic factor point contributions + Unsupervised Isolation Forest Multi-Dimensional ML confirmation.
            </p>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
            Total Monitored: <strong className="text-slate-900 dark:text-white">{summary.total_projects.toLocaleString()}</strong> works
          </span>
        </div>

        {/* Proportional Risk Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${(summary.risk_distribution.LOW / summary.total_projects) * 100}%` }}
            className="bg-emerald-500 h-full transition-all" 
            title={`Low Risk: ${summary.risk_distribution.LOW}`}
          />
          <div 
            style={{ width: `${(summary.risk_distribution.MEDIUM / summary.total_projects) * 100}%` }}
            className="bg-amber-500 h-full transition-all" 
            title={`Medium Risk: ${summary.risk_distribution.MEDIUM}`}
          />
          <div 
            style={{ width: `${Math.max(1, (summary.risk_distribution.HIGH / summary.total_projects) * 100)}%` }}
            className="bg-orange-500 h-full transition-all" 
            title={`High Risk: ${summary.risk_distribution.HIGH}`}
          />
          <div 
            style={{ width: `${Math.max(1, (summary.risk_distribution.CRITICAL / summary.total_projects) * 100)}%` }}
            className="bg-red-600 h-full transition-all animate-pulse" 
            title={`Critical Risk: ${summary.risk_distribution.CRITICAL}`}
          />
        </div>

        {/* Risk Level Triage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div 
            onClick={() => navigate('/high-risk?risk=LOW')}
            className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">LOW (0–30 PTS)</p>
            <p className="text-xl font-black text-emerald-950 dark:text-white font-mono">{summary.risk_distribution.LOW?.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">Standard operational bounds</p>
          </div>
          <div 
            onClick={() => navigate('/high-risk?risk=MEDIUM')}
            className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">MEDIUM (31–60 PTS)</p>
            <p className="text-xl font-black text-amber-950 dark:text-white font-mono">{summary.risk_distribution.MEDIUM?.toLocaleString()}</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Single-factor audit signal</p>
          </div>
          <div 
            onClick={() => navigate('/high-risk?risk=HIGH')}
            className="p-3.5 bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-xl cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
          >
            <p className="text-[11px] font-bold text-orange-800 dark:text-orange-300">HIGH (61–80 PTS)</p>
            <p className="text-xl font-black text-orange-950 dark:text-white font-mono">{summary.risk_distribution.HIGH?.toLocaleString()}</p>
            <p className="text-[10px] text-orange-700 dark:text-orange-400 mt-0.5">Multiple concurrent flags</p>
          </div>
          <div 
            onClick={() => navigate('/high-risk?risk=CRITICAL')}
            className="p-3.5 bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <p className="text-[11px] font-bold text-red-800 dark:text-red-300">CRITICAL (81–100 PTS)</p>
            <p className="text-xl font-black text-red-950 dark:text-white font-mono">{summary.risk_distribution.CRITICAL?.toLocaleString()}</p>
            <p className="text-[10px] text-red-700 dark:text-red-400 mt-0.5">Prioritized human inspection</p>
          </div>
        </div>
      </div>

      {/* 4. HERO SECTION: PRIORITY REVIEW QUEUE TABLE */}
      <div className="table-card bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 dark:bg-slate-900/70">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Priority Review Queue
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-extrabold font-mono border border-red-200 dark:border-red-800/80 uppercase">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Projects with the strongest multi-vector risk indicators, prioritized dynamically for human officer review.
            </p>
          </div>

          <button
            onClick={() => navigate('/high-risk')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto shadow-xs cursor-pointer"
          >
            <span>Open Complete Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Triage Filter Pills */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-100/90 dark:bg-slate-900/85 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick Triage:
          </span>
          <button
            onClick={() => navigate('/high-risk?risk=CRITICAL')}
            className="px-3 py-1 bg-red-100/90 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-800 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            🚨 Critical Risk Works ({summary.risk_distribution.CRITICAL})
          </button>
          <button
            onClick={() => navigate('/anomalies')}
            className="px-3 py-1 bg-amber-100/90 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            📈 High Cost Escalations (&gt;25%)
          </button>
          <button
            onClick={() => navigate('/high-risk?status=COMPLETION_VERIFICATION_REQUIRED')}
            className="px-3 py-1 bg-blue-100/90 hover:bg-blue-200 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            🔍 Verification Required ({summary.projects_requiring_verification.toLocaleString()})
          </button>
          <button
            onClick={() => navigate('/anomalies')}
            className="px-3 py-1 bg-purple-100/90 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-800 rounded-full font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            📑 Duplicate Transaction Signatures
          </button>
        </div>

        {/* Prioritized Table with Sticky Header and Smooth Scrolling */}
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto scroll-smooth table-scroll">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead className="sticky top-0 z-10 app-table-th shadow-2xs">
              <tr>
                <th className="px-3.5 py-3.5 text-center w-[130px]">Risk Level & Score</th>
                <th className="px-3.5 py-3.5 max-w-[240px]">Project & Description</th>
                <th className="px-3.5 py-3.5 w-[160px]">Location & MP</th>
                <th className="px-3.5 py-3.5 max-w-[280px]">Primary Anomaly Indicator</th>
                <th className="px-3.5 py-3.5 text-center w-[95px]">Cost Dev %</th>
                <th className="px-3.5 py-3.5 text-right w-[110px]">Recommended</th>
                <th className="px-3.5 py-3.5 text-right w-[115px]">Final Amount</th>
                <th className="px-3.5 py-3.5 text-center w-[95px]">Inspect Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {highRiskSample.map((p) => (
                <tr key={p.project_id} className="app-table-row group">
                  <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                    <RiskBadge level={p.risk_level} score={p.risk_score} size="md" />
                  </td>
                  <td className="px-3.5 py-3.5 max-w-[240px]">
                    <div className="font-mono font-bold text-blue-700 dark:text-cyan-400 text-xs">#{p.project_id}</div>
                    <div className="app-table-title truncate mt-0.5" title={p.work_description}>
                      {p.work_description}
                    </div>
                  </td>
                  <td className="px-3.5 py-3.5 whitespace-nowrap">
                    <div className="app-table-location">{p.constituency}, {p.state}</div>
                    <div className="app-table-mp truncate max-w-[150px] mt-0.5">{p.mp_name}</div>
                  </td>
                  <td className="px-3.5 py-3.5 max-w-[280px]">
                    <span className="anomaly-pill truncate max-w-[270px] inline-block" title={p.primary_reason}>
                      {p.primary_reason}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5 text-center font-mono font-bold whitespace-nowrap">
                    {p.cost_deviation_pct !== 0 ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        p.cost_deviation_pct > 0 
                          ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40' 
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                      }`}>
                        {p.cost_deviation_pct > 0 ? `+${p.cost_deviation_pct}%` : `${p.cost_deviation_pct}%`}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                    <span className="app-table-amount">₹{p.recommended_amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                    {p.final_amount > 0 ? (
                      <span className="app-table-amount-bold">₹{p.final_amount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Pending</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenCompare(p)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer"
                        title="Compare against peer cohort"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/project/${p.project_id}`)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                      >
                        Inspect Work
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Geographic & Sector Intelligence Row */}
      <IndiaMap statesData={statesAnalytics} />

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* State Budget Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Top States by Recommended Budget (₹ Crores)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Allocation volume across major states</p>
            </div>
            <button 
              onClick={() => navigate('/states')}
              className="text-xs text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>State Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '12px' }}
                  formatter={(val, name) => [
                    name === 'Budget' ? `₹${val} Cr` : val, 
                    name === 'Budget' ? 'Budget Envelope' : 'High-Risk Works'
                  ]}
                  labelFormatter={(label, items) => items?.[0]?.payload?.fullState || label}
                />
                <Bar dataKey="Budget" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Category Breakdown */}
        <div className="bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Sector Budget Distribution
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Sanctioned works by category</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={75} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff', borderRadius: '12px' }}
                  formatter={(val) => [`₹${val} Cr`, 'Budget']}
                  labelFormatter={(label, items) => items?.[0]?.payload?.fullCategory || label}
                />
                <Bar dataKey="BudgetCr" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      <ProjectCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        targetProject={compareTarget}
        similarData={compareSimilar}
      />

    </div>
  );
};

export default DashboardPage;
