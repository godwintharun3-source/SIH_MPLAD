import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  TrendingUp, 
  Copy, 
  CreditCard, 
  ShieldAlert, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight, 
  AlertTriangle, 
  Scale, 
  FileCheck, 
  X, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Zap,
  Info,
  Sliders,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import { ProjectCompareModal } from '../components/ProjectCompareModal';

export const AnomaliesPage = () => {
  const [tab, setTab] = useState('cost'); // 'cost', 'completion', 'sector', 'duplicate', 'payment'
  const [costAnomalies, setCostAnomalies] = useState([]);
  const [compAnomalies, setCompAnomalies] = useState([]);
  const [sectorAnomalies, setSectorAnomalies] = useState([]);
  const [dupAnomalies, setDupAnomalies] = useState([]);
  const [payAnomalies, setPayAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals for evidence inspection
  const [selectedBurst, setSelectedBurst] = useState(null);
  const [selectedComp, setSelectedComp] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);

  // Peer Comparison Matrix Modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [compareSimilarData, setCompareSimilarData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const navigate = useNavigate();

  const handleOpenPeerMatrix = async (projectItem) => {
    setCompareTarget(projectItem);
    setCompareModalOpen(true);
    setCompareLoading(true);
    try {
      const sim = await api.getProjectSimilar(projectItem.project_id, 5);
      setCompareSimilarData(sim);
    } catch (err) {
      console.error("Error loading peer matrix data:", err);
      setCompareSimilarData({
        current_project: projectItem,
        similar_projects: [],
        benchmark: {
          peer_median_amount: projectItem.peer_median_amount || projectItem.recommended_amount,
          peer_min_amount: projectItem.peer_min_amount,
          peer_max_amount: projectItem.peer_max_amount,
          comparable_works_count: projectItem.comparable_works_count
        }
      });
    } finally {
      setCompareLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    setLoading(true);
    try {
      const [c, comp, sec, d, p] = await Promise.all([
        api.getCostAnomalies(50),
        api.getCompletionAnomalies(50),
        api.getSectorAnomalies(50),
        api.getDuplicateAnomalies(50),
        api.getPaymentAnomalies(50)
      ]);
      setCostAnomalies(c);
      setCompAnomalies(comp);
      setSectorAnomalies(sec);
      setDupAnomalies(d);
      setPayAnomalies(p);
    } catch (err) {
      console.error('Error loading anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">MPLAD Anomaly Intelligence Center</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pattern intelligence across Cost Deviations, Completion Verification, Granular Sector Benchmarks, Repeated Duplicate Signatures, and Payment Bursts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
              50 Top Outliers Loaded per Module
            </span>
          </div>
        </div>

        {/* Tab Selection (Final 5-Tab Order) */}
        <div className="flex gap-2 mt-5 border-b border-slate-100 pb-2 overflow-x-auto">
          
          {/* TAB 1: Cost Deviations */}
          <button
            onClick={() => setTab('cost')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              tab === 'cost'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Cost Deviations ({costAnomalies.length})</span>
          </button>

          {/* TAB 2: Completion Concern */}
          <button
            onClick={() => setTab('completion')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              tab === 'completion'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Completion Concern ({compAnomalies.length})</span>
          </button>

          {/* TAB 3: Sector Deviation */}
          <button
            onClick={() => setTab('sector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              tab === 'sector'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Sector Deviation ({sectorAnomalies.length})</span>
          </button>

          {/* TAB 4: Potential Duplicate Transactions */}
          <button
            onClick={() => setTab('duplicate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              tab === 'duplicate'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Potential Duplicate Transactions ({dupAnomalies.length})</span>
          </button>

          {/* TAB 5: Payment & Frequency Patterns */}
          <button
            onClick={() => setTab('payment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              tab === 'payment'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment & Frequency Patterns ({payAnomalies.length})</span>
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700">Filtering multi-vector anomaly clusters across dataset...</p>
        </div>
      )}

      {/* TAB 1: Cost Deviations */}
      {!loading && tab === 'cost' && (
        <div className="space-y-4">
          
          {/* Executive Cost Intelligence Card */}
          <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-300 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Cost Escalation Intelligence Overview
                </h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Projects with certified final expenditures exceeding their own sanctioned budget by &gt;25% (comparing work against its own baseline).
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-amber-800 uppercase font-bold">Strongest Outlier</span>
                <p className="font-mono font-black text-red-600 text-base">+172.0%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Project ID</th>
                    <th className="px-4 py-3">Work Description</th>
                    <th className="px-4 py-3">Location & MP</th>
                    <th className="px-4 py-3 text-right">Sanctioned</th>
                    <th className="px-4 py-3 text-right">Certified Final</th>
                    <th className="px-4 py-3 text-center">Cost Dev %</th>
                    <th className="px-4 py-3 text-center">Risk Score</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {costAnomalies.map((p) => (
                    <tr key={p.project_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        #{p.project_id}
                      </td>
                      <td className="px-4 py-3 max-w-sm text-slate-900 truncate" title={p.work_description}>
                        {p.work_description}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-bold text-slate-800">{p.constituency}, {p.state}</div>
                        <div className="text-[10px] text-slate-500">{p.mp_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        ₹{p.recommended_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ₹{p.final_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-black text-red-600">
                        +{p.cost_deviation_pct}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/project/${p.project_id}`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Completion Concern */}
      {!loading && tab === 'completion' && (
        <div className="space-y-4">
          
          {/* Executive Overview Banner */}
          <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-300 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Completion Status Verification Queue
                </h4>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Identifies works where certified completion records are not yet linked in the central registry. Neutral administrative verification required.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-right">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase">National Unverified Pool</span>
                <p className="font-mono font-black text-amber-950 text-base">80,816 Works</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Project ID</th>
                    <th className="px-4 py-3">Work Description</th>
                    <th className="px-4 py-3">Location & MP</th>
                    <th className="px-4 py-3 text-right">Sanction Amount</th>
                    <th className="px-4 py-3 text-center">Sanction Date</th>
                    <th className="px-4 py-3 text-center">Registry Status</th>
                    <th className="px-4 py-3 text-center">Linkage</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {compAnomalies.map((p) => (
                    <tr key={p.project_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        #{p.project_id}
                      </td>
                      <td className="px-4 py-3 max-w-sm text-slate-900 truncate" title={p.work_description}>
                        {p.work_description}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-bold text-slate-800">{p.constituency}, {p.state}</div>
                        <div className="text-[10px] text-slate-500">{p.mp_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {p.recommendation_date || 'Approved'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap">
                          Verification Required
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {p.linkage_status || 'UNMATCHED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/project/${p.project_id}`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sector Deviation (Granular Benchmarks) */}
      {!loading && tab === 'sector' && (
        <div className="space-y-4">
          
          {/* Executive Overview Banner */}
          <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                  Granular Sector Benchmark & Peer Cohort Deviations
                </h4>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                Evaluates work sanctions against verified peer medians within specific development sectors (e.g. Sports & Stadiums, Community Infrastructure, Health, Public Lighting).
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-right">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase">Peer Cohort Criterion</span>
                <p className="font-mono font-black text-blue-950 text-base">Granular Sector Taxonomy</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Project ID</th>
                    <th className="px-4 py-3">Work Description</th>
                    <th className="px-4 py-3">Sector</th>
                    <th className="px-4 py-3">Location & MP</th>
                    <th className="px-4 py-3 text-right">Sanctioned Cost</th>
                    <th className="px-4 py-3 text-right">Sector Median</th>
                    <th className="px-4 py-3 text-center">Deviation Ratio</th>
                    <th className="px-4 py-3 text-center">Peer Cohort</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sectorAnomalies.map((p) => (
                    <tr key={p.project_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        #{p.project_id}
                      </td>
                      <td className="px-4 py-3 max-w-sm text-slate-900 truncate" title={p.work_description}>
                        {p.work_description}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                          {p.sector || p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-bold text-slate-800">{p.constituency}, {p.state}</div>
                        <div className="text-[10px] text-slate-500">{p.mp_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                        ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        ₹{Number(p.peer_median_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-purple-100 text-purple-950 border border-purple-300 font-mono shadow-2xs">
                          {p.deviation_ratio || (p.recommended_amount / p.peer_median_amount).toFixed(1)}x
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">+{Number(p.sector_deviation_pct || 0).toLocaleString('en-IN')}%</div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-500 font-mono text-[11px]">
                        {p.comparable_works_count ? `${p.comparable_works_count.toLocaleString()} Works` : 'Cohort'}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPeerMatrix(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors shadow-2xs flex items-center gap-1.5 text-[11px] font-bold"
                            title="Open Comparable Project Peer Comparison Matrix"
                          >
                            <Scale className="w-3.5 h-3.5 text-purple-700" />
                            <span>Peer Matrix</span>
                          </button>
                          <button
                            onClick={() => navigate(`/project/${p.project_id}`)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shadow-2xs"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Potential Duplicate Transactions */}
      {!loading && tab === 'duplicate' && (
        <div className="space-y-4">
          <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-purple-700" />
              <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                Repeated Voucher Signature Clusters
              </h4>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed font-medium">
              Vouchers sharing identical payee / vendor, disbursement amounts, and project codes repeated multiple times within identical billing periods.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Cluster / Voucher ID</th>
                    <th className="px-4 py-3">Payee / Vendor</th>
                    <th className="px-4 py-3">MP & Location</th>
                    <th className="px-4 py-3 text-right">Per Voucher</th>
                    <th className="px-4 py-3 text-center">Repeat Frequency</th>
                    <th className="px-4 py-3 text-right">Total Cluster Exposure</th>
                    <th className="px-4 py-3 text-center">Disbursement Date</th>
                    <th className="px-4 py-3 text-center">Matched Work</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dupAnomalies.map((tx, idx) => {
                    const count = tx.repeat_count || tx.sig_repeat_count || 2;
                    const totalAmt = tx.total_amount || (tx.expenditure_amount * count);
                    const voucherCode = tx.transaction_id ? `VCH-${tx.transaction_id}` : `VCH-CL-${idx + 101}`;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                          {voucherCode}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="font-bold text-slate-900 truncate" title={tx.vendor}>{tx.vendor}</div>
                          {tx.work_description && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5" title={tx.work_description}>
                              {tx.work_description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="font-bold text-slate-800">{tx.mp_name}</div>
                          <div className="text-[10px] text-slate-500">{tx.constituency}, {tx.state}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                          ₹{Number(tx.expenditure_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 font-mono inline-block shadow-2xs">
                            {count}x Repeated
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-purple-950">
                          ₹{Number(totalAmt).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                          {tx.expenditure_date || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {tx.matched_project_id ? (
                            <button
                              onClick={() => navigate(`/project/${tx.matched_project_id}`)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-700 font-bold text-[11px] border border-slate-200 shadow-2xs"
                            >
                              Project #{tx.matched_project_id}
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">Unmatched</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Payment Burst Densities & Frequency Patterns */}
      {!loading && tab === 'payment' && (
        <div className="space-y-4">
          
          {/* Executive Overview Banner */}
          <div className="bg-blue-50/90 p-5 rounded-2xl border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-700" />
                <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                  Payment Burst Density & Temporal Concentration Intelligence
                </h4>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                Identifies works where vouchers are abnormally clustered in time (e.g. 50+ vouchers processed in &le;3 days vs national peer median of 0.1 vouchers/day).
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-right">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase">National Baseline</span>
                <p className="font-mono font-bold text-slate-700 text-xs">0.1 Vouchers / Day</p>
              </div>
              <div className="border-l border-blue-200 pl-3">
                <span className="text-[10px] font-bold text-blue-800 uppercase">Highest Burst Ratio</span>
                <p className="font-mono font-black text-blue-950 text-base">1,240x Peer Density</p>
              </div>
            </div>
          </div>

          {/* Payment Bursts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Cluster ID</th>
                    <th className="px-4 py-3">Payee / Vendor</th>
                    <th className="px-4 py-3">MP & Location</th>
                    <th className="px-4 py-3 text-center">Vouchers</th>
                    <th className="px-4 py-3 text-right">Total Disbursed</th>
                    <th className="px-4 py-3 text-center">Disbursement Period</th>
                    <th className="px-4 py-3 text-center">Payment Density Ratio</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payAnomalies.map((p) => (
                    <tr key={p.cluster_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {p.cluster_id}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={p.vendor}>{p.vendor}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.work_description}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-bold text-slate-800">{p.mp_name}</div>
                        <div className="text-[10px] text-slate-500">{p.constituency}, {p.state}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300 font-mono shadow-2xs">
                          {p.voucher_count} Vouchers
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                        ₹{Number(p.total_cluster_amount || 0).toLocaleString('en-IN')}
                        <div className="text-[10px] text-slate-400 font-normal">
                          (Avg: ₹{Math.round(p.avg_voucher_amount || 0).toLocaleString('en-IN')})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700 whitespace-nowrap">
                        <div>{p.start_date === p.end_date ? p.start_date : `${p.start_date} → ${p.end_date}`}</div>
                        <span className="text-[10px] text-slate-400">({p.span_days} Day{p.span_days > 1 ? 's' : ''})</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-950 border border-amber-300 font-mono shadow-2xs">
                          {p.density_ratio}x Peer
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{p.daily_rate} v/day</div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedBurst(p)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors"
                          >
                            Inspect Evidence
                          </button>
                          {p.matched_project_id && (
                            <button
                              onClick={() => navigate(`/project/${p.matched_project_id}`)}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] shadow-2xs"
                              title="Open Matched Project Dossier"
                            >
                              #{p.matched_project_id}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. COMPLETION CONCERN EVIDENCE INSPECTION MODAL */}
      {selectedComp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-xs border border-amber-200">
                    PROJECT #{selectedComp.project_id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black uppercase tracking-wider border border-amber-200">
                    COMPLETION VERIFICATION REQUIRED
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedComp.work_description}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedComp.mp_name} • {selectedComp.constituency}, {selectedComp.state}
                </p>
              </div>

              <button
                onClick={() => setSelectedComp(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sanction Amount</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">₹{(selectedComp.recommended_amount/100000).toFixed(1)}L</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sanction Date</p>
                <p className="text-sm font-bold text-slate-800 font-mono mt-1">{selectedComp.recommendation_date || 'Approved'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Registry Status</p>
                <p className="text-xs font-bold text-amber-700 font-mono mt-1.5">Unverified</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Source Linkage</p>
                <p className="text-xs font-bold text-slate-700 font-mono mt-1.5">{selectedComp.linkage_status || 'UNMATCHED'}</p>
              </div>
            </div>

            {/* Evidence Audit Details */}
            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-2">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                Administrative Evidence Rationale
              </h4>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {selectedComp.reason}
              </p>
              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 space-y-1 font-medium">
                <p><strong>Matching Fields Evaluated:</strong> <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">work_id</code>, <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">mp_name</code>, <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">constituency_code</code>, <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">sanction_amount</code>, <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">financial_year</code></p>
                <p><strong>Recommended Human Action:</strong> {selectedComp.review_action}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedComp(null);
                  navigate(`/project/${selectedComp.project_id}`);
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Open Full Project Dossier
              </button>
              <button
                onClick={() => setSelectedComp(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. SECTOR DEVIATION EVIDENCE INSPECTION MODAL */}
      {selectedSector && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono font-bold text-xs border border-blue-200">
                    PROJECT #{selectedSector.project_id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-950 font-black uppercase tracking-wider border border-purple-200">
                    SECTOR BENCHMARK DEVIATION
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedSector.work_description}
                </h3>
                <p className="text-xs text-slate-500">
                  Sector: <strong>{selectedSector.sector || selectedSector.category}</strong> • {selectedSector.constituency}, {selectedSector.state}
                </p>
              </div>

              <button
                onClick={() => setSelectedSector(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sanctioned Cost</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">₹{(selectedSector.recommended_amount/100000).toFixed(1)}L</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sector Peer Median</p>
                <p className="text-lg font-black text-slate-800 font-mono mt-0.5">₹{(selectedSector.peer_median_amount/100000).toFixed(2)}L</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Deviation Ratio</p>
                <p className="text-lg font-black text-purple-700 font-mono mt-0.5">{selectedSector.deviation_ratio}x</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Peer Cohort Size</p>
                <p className="text-sm font-bold text-slate-800 font-mono mt-1">{selectedSector.comparable_works_count?.toLocaleString()} Works</p>
              </div>
            </div>

            {/* Peer Distribution & IQR Comparison */}
            <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200 space-y-2">
              <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-purple-700" />
                Sector Peer Distribution (IQR Baseline)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-purple-950">
                <div>
                  <span className="font-semibold text-slate-600">Middle 50% Peer Range (IQR):</span>
                  <p className="font-mono font-bold text-slate-800">
                    ₹{Number(selectedSector.peer_q25_amount || 0).toLocaleString('en-IN')} – ₹{Number(selectedSector.peer_q75_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Absolute Sector Range:</span>
                  <p className="font-mono font-bold text-slate-800">
                    ₹{Number(selectedSector.peer_min_amount || 0).toLocaleString('en-IN')} – ₹{Number(selectedSector.peer_max_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-purple-200/60 text-[11px] text-purple-900 space-y-1 font-medium">
                <p><strong>Mathematical Deviation Formula:</strong> <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">((Current Cost - Peer Median) / Peer Median) * 100</code></p>
                <p><strong>Review Recommendation:</strong> {selectedSector.review_action}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedSector(null);
                  navigate(`/project/${selectedSector.project_id}`);
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Open Full Project Dossier
              </button>
              <button
                onClick={() => setSelectedSector(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. PAYMENT DENSITY EVIDENCE INSPECTION MODAL */}
      {selectedBurst && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-mono font-bold text-xs border border-blue-200">
                    CLUSTER {selectedBurst.cluster_id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black uppercase tracking-wider border border-amber-200">
                    HIGH PAYMENT DENSITY
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {selectedBurst.vendor}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBurst.mp_name} • {selectedBurst.constituency}, {selectedBurst.state}
                </p>
              </div>

              <button
                onClick={() => setSelectedBurst(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Cluster Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Voucher Count</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">{selectedBurst.voucher_count}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Disbursed</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">₹{(selectedBurst.total_cluster_amount/100000).toFixed(1)}L</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Disbursement Window</p>
                <p className="text-sm font-bold text-slate-800 font-mono mt-1">{selectedBurst.span_days} Day{selectedBurst.span_days > 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Burst Density</p>
                <p className="text-lg font-black text-amber-600 font-mono mt-0.5">{selectedBurst.density_ratio}x</p>
              </div>
            </div>

            {/* Peer Comparison Baseline */}
            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-2">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                Peer Baseline Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-amber-900">
                <div>
                  <span className="font-semibold text-slate-600">National Peer Median Frequency:</span>
                  <p className="font-mono font-bold text-slate-800">0.1 vouchers / active day (~1 voucher per 10 days)</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Current Cluster Frequency:</span>
                  <p className="font-mono font-black text-red-600">{selectedBurst.daily_rate} vouchers / day ({selectedBurst.density_ratio}x Peer Median)</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-900/80 pt-1 border-t border-amber-200/60 leading-relaxed font-medium">
                ⚠️ <strong>Audit Recommendation:</strong> Rapid multi-voucher processing within narrow windows is an audit indicator to confirm whether milestone certificates were verified before batch disbursement.
              </p>
            </div>

            {/* Itemized Voucher Audit Stream */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Itemized Sample Vouchers ({selectedBurst.sample_vouchers?.length || 0} Records)
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Verified Database Records</span>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Voucher ID</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium font-mono">
                    {(selectedBurst.sample_vouchers || []).map((v) => (
                      <tr key={v.transaction_id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-blue-900">{v.transaction_id}</td>
                        <td className="px-3 py-2 text-slate-600">{v.expenditure_date}</td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">₹{Number(v.expenditure_amount).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {v.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close / Action Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBurst(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Evidence Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. COMPARABLE PROJECT PEER COMPARISON MATRIX MODAL */}
      <ProjectCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        targetProject={compareTarget}
        similarData={compareSimilarData}
      />

    </div>
  );
};

export default AnomaliesPage;
