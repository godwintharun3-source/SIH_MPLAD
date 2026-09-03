import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  IndianRupee, 
  Calendar, 
  ShieldAlert, 
  TrendingUp, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Layers,
  Clock,
  Sliders,
  Scale,
  RefreshCw,
  FileCheck,
  Download,
  Share2,
  Copy,
  Bot,
  ArrowRight,
  User,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import RiskGauge from '../components/RiskGauge';
import ProjectCompareModal from '../components/ProjectCompareModal';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [similarData, setSimilarData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Dynamic slider weights
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [weights, setWeights] = useState({
    cost_anomaly_max: 30,
    completion_concern_max: 25,
    payment_anomaly_max: 20,
    duplicate_concern_max: 15,
    similarity_anomaly_max: 10
  });
  const [recalculatedRisk, setRecalculatedRisk] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, sim, tx] = await Promise.all([
        api.getProjectDetail(id),
        api.getProjectSimilar(id, 5).catch(() => null),
        api.getProjectTransactions(id).catch(() => [])
      ]);
      setProject(p);
      setSimilarData(sim);
      setTransactions(tx);
      setRecalculatedRisk(null);
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Project record not found or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateWeights = async () => {
    setRecalculating(true);
    try {
      const res = await api.recalculateRisk(id, weights);
      setRecalculatedRisk(res);
    } catch (err) {
      console.error("Error recalculating risk:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleAskAI = (queryText) => {
    window.dispatchEvent(new CustomEvent('open-ai-context', {
      detail: {
        query: queryText,
        contextProjectId: id
      }
    }));
  };

  const handlePrintDossier = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-700">Retrieving official intelligence dossier for Project #{id}...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center bg-red-50 border border-red-200 rounded-2xl my-10 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-red-900">Project Not Found</h3>
        <p className="text-xs text-red-700 mt-1">{error}</p>
        <button
          onClick={() => navigate('/high-risk')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Back to Priority Queue
        </button>
      </div>
    );
  }

  const activeRisk = recalculatedRisk || project;
  const breakdown = activeRisk.point_breakdown || {};

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Previous View</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showWeightSliders 
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-2xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Adjust factor weights dynamically to simulate sensitivity testing"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sensitivity Calibration</span>
          </button>

          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Peer Comparison</span>
          </button>

          <button
            onClick={handlePrintDossier}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Officer Dossier</span>
          </button>
        </div>
      </div>

      {/* Primary Investigation Dossier Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-950 text-white p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-xs border border-blue-400/30">
                PROJECT #{project.project_id}
              </span>
              {project.work_id && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  Work ID: {project.work_id}
                </span>
              )}
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                Sector: {project.category}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {project.work_description}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white">{project.mp_name}</strong>
                <span className="text-slate-500 font-mono">({project.house})</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{project.constituency}, <strong>{project.state}</strong></span>
              </div>
              {project.ida && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">IDA: <strong className="text-slate-200">{project.ida}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Risk Gauge Header Widget */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center shrink-0 min-w-[170px] shadow-inner">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
              Decision Risk Score
            </p>
            <RiskGauge score={activeRisk.risk_score} size={110} strokeWidth={9} showLabel={true} />
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              Multi-Vector Rubric + ML
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Risk Weight Calibration Sliders */}
      {showWeightSliders && (
        <div className="no-print bg-amber-50/80 p-5 rounded-2xl border border-amber-300 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Dynamic Risk Weight Calibration (Sensitivity Testing)
              </h3>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold">Simulate custom scheme audit thresholds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700">Cost Anomaly: {weights.cost_anomaly_max} pts</label>
              <input
                type="range" min="0" max="50" value={weights.cost_anomaly_max}
                onChange={(e) => setWeights({ ...weights, cost_anomaly_max: Number(e.target.value) })}
                className="w-full mt-1 accent-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700">Completion Concern: {weights.completion_concern_max} pts</label>
              <input
                type="range" min="0" max="50" value={weights.completion_concern_max}
                onChange={(e) => setWeights({ ...weights, completion_concern_max: Number(e.target.value) })}
                className="w-full mt-1 accent-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700">Payment Frequency: {weights.payment_anomaly_max} pts</label>
              <input
                type="range" min="0" max="50" value={weights.payment_anomaly_max}
                onChange={(e) => setWeights({ ...weights, payment_anomaly_max: Number(e.target.value) })}
                className="w-full mt-1 accent-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700">Duplicate Vouchers: {weights.duplicate_concern_max} pts</label>
              <input
                type="range" min="0" max="50" value={weights.duplicate_concern_max}
                onChange={(e) => setWeights({ ...weights, duplicate_concern_max: Number(e.target.value) })}
                className="w-full mt-1 accent-amber-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700">Sector Deviation: {weights.similarity_anomaly_max} pts</label>
              <input
                type="range" min="0" max="50" value={weights.similarity_anomaly_max}
                onChange={(e) => setWeights({ ...weights, similarity_anomaly_max: Number(e.target.value) })}
                className="w-full mt-1 accent-amber-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              onClick={() => {
                setWeights({
                  cost_anomaly_max: 30,
                  completion_concern_max: 25,
                  payment_anomaly_max: 20,
                  duplicate_concern_max: 15,
                  similarity_anomaly_max: 10
                });
                setRecalculatedRisk(null);
              }}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleRecalculateWeights}
              disabled={recalculating}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-2xs flex items-center gap-1.5"
            >
              {recalculating && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Apply & Recalculate Score</span>
            </button>
          </div>
        </div>
      )}

      {/* Financial & Timeline Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Recommended Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sanctioned Amount</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{project.recommended_amount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Sanction: {project.recommendation_date || 'Approved'}
          </p>
        </div>

        {/* Final Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certified Final Amount</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {project.final_amount > 0 ? `₹${project.final_amount.toLocaleString('en-IN')}` : (
              <span className="text-amber-600 text-lg font-bold">Pending Registry</span>
            )}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {project.completed_date ? `Completed: ${project.completed_date}` : 'Status: Verification Required'}
          </p>
        </div>

        {/* Cost Deviation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cost Escalation Variance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black font-mono ${
              project.cost_deviation_pct > 25 ? 'text-red-600' :
              project.cost_deviation_pct < -25 ? 'text-blue-600' : 'text-slate-900'
            }`}>
              {project.cost_deviation_pct > 0 ? `+${project.cost_deviation_pct}%` : `${project.cost_deviation_pct}%`}
            </span>
            {project.cost_deviation_amount !== 0 && (
              <span className="text-xs text-slate-500 font-mono">
                ({project.cost_deviation_amount > 0 ? '+' : ''}₹{(project.cost_deviation_amount / 100000).toFixed(1)}L)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {project.cost_deviation_pct > 25 ? 'Significant Cost Deviation' : 'Within normal variance'}
          </p>
        </div>

        {/* Timeline Duration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Execution Duration</p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {project.project_duration_days > 0 ? `${project.project_duration_days} Days` : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Timeline Status: <strong>{project.delay_status}</strong>
          </p>
        </div>

      </div>

      {/* 2. Explainable AI Risk Diagnostic Breakdown (Horizontal Factor Contributions) */}
      <div id="ai-breakdown" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Explainable AI: Why Was This Project Flagged?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic factor point contributions with verifiable evidence signals
            </p>
          </div>
          <span className="text-xs font-mono font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Composite Score: {activeRisk.risk_score}/100
          </span>
        </div>

        {/* Horizontal Factor Contribution Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Cost Anomaly</p>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">+{breakdown.cost_anomaly || 0} pts</p>
            <span className="text-[10px] text-slate-400">Max: {weights.cost_anomaly_max}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Completion Concern</p>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">+{breakdown.completion_concern || 0} pts</p>
            <span className="text-[10px] text-slate-400">Max: {weights.completion_concern_max}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Payment Pattern</p>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">+{breakdown.payment_anomaly || 0} pts</p>
            <span className="text-[10px] text-slate-400">Max: {weights.payment_anomaly_max}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Duplicate Risk</p>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">+{breakdown.duplicate_concern || 0} pts</p>
            <span className="text-[10px] text-slate-400">Max: {weights.duplicate_concern_max}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Sector Deviation</p>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">+{breakdown.similarity_anomaly || 0} pts</p>
            <span className="text-[10px] text-slate-400">Max: {weights.similarity_anomaly_max}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-500">Isolation Forest ML</p>
            <p className="text-lg font-black text-slate-900 font-mono mt-0.5">+{breakdown.ml_anomaly_boost || 0} pts</p>
            <span className="text-[10px] text-slate-400">Multi-Dim Anomaly</span>
          </div>
        </div>

        {/* Factual Explanations List */}
        <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identified Risk Evidence Signals:</h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {(activeRisk.reasons || []).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Advisory Review Actions for Human Officers */}
        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-1.5">
            <FileCheck className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Advisory Human Inspection Actions (Prioritized Checklist)
            </h4>
          </div>
          <p className="text-[11px] text-amber-900 mb-2">
            The AI system assists authorized officers. Final audit conclusions require field verification.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
            {(activeRisk.advisory_actions || []).map((act, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. CONTEXTUAL AI INVESTIGATION ASSISTANT INTEGRATION CARD */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-white tracking-tight">
              Investigate Project #{project.project_id} with AI Assistant
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
              Grounded on Record
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Ask targeted questions regarding cost escalations, peer variance, or payment signatures for this specific project.
          </p>
        </div>

        {/* 1-Click Contextual Inquiry Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAskAI(`Why was Project #${project.project_id} flagged with risk score ${activeRisk.risk_score}/100?`)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Why Flagged?</span>
            <ArrowRight className="w-3 h-3 text-amber-400" />
          </button>
          <button
            onClick={() => handleAskAI(`Compare Project #${project.project_id} (${project.work_description}) with peer works in ${project.category}.`)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Compare Peers</span>
            <ArrowRight className="w-3 h-3 text-blue-400" />
          </button>
          <button
            onClick={() => handleAskAI(`Show transaction anomalies and duplicate payment vouchers for Project #${project.project_id}.`)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Check Vouchers</span>
            <ArrowRight className="w-3 h-3 text-purple-400" />
          </button>
        </div>
      </div>

      {/* 4. Comparable Works & Sector Peer Benchmark Visualization */}
      <div id="comparable" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-700" />
              Comparable Project Benchmark & Peer Range Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmarked against peer works in sector category <strong className="text-slate-800">"{project.category}"</strong>
            </p>
          </div>
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Open Side-by-Side Comparison</span>
          </button>
        </div>

        {/* Visual Benchmark Comparison Range Bar */}
        {similarData?.benchmark && (
          <div className="space-y-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Current Project</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">₹{project.recommended_amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Peer Category Median</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">₹{similarData.benchmark.peer_median_amount?.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Deviation vs Peers</p>
                <p className={`text-base font-black font-mono mt-0.5 ${
                  similarData.benchmark.current_vs_peer_median_pct > 50 ? 'text-red-600' : 'text-slate-900'
                }`}>
                  {similarData.benchmark.current_vs_peer_median_pct > 0 ? `+${similarData.benchmark.current_vs_peer_median_pct}%` : `${similarData.benchmark.current_vs_peer_median_pct}%`}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500">Peer Cost Range</p>
                <p className="text-xs font-bold font-mono text-slate-800 mt-1">
                  ₹{(similarData.benchmark.peer_min_amount/100000).toFixed(1)}L – ₹{(similarData.benchmark.peer_max_amount/100000).toFixed(1)}L
                </p>
              </div>
            </div>

            {/* Visual Relative Cost Marker Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Peer Min: ₹{(similarData.benchmark.peer_min_amount/100000).toFixed(1)}L</span>
                <span className="text-blue-700">Peer Median: ₹{(similarData.benchmark.peer_median_amount/100000).toFixed(1)}L</span>
                <span className="text-red-600 font-bold">Current Work: ₹{(project.recommended_amount/100000).toFixed(1)}L</span>
                <span>Peer Max: ₹{(similarData.benchmark.peer_max_amount/100000).toFixed(1)}L</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                <div className="absolute inset-y-0 left-[20%] right-[30%] bg-blue-300 rounded-full opacity-60" title="Interquartile Peer Range" />
                <div 
                  style={{ left: `${Math.min(95, Math.max(5, (project.recommended_amount / (similarData.benchmark.peer_max_amount * 1.2 || 1)) * 100))}%` }}
                  className="absolute top-0 bottom-0 w-3 bg-red-600 rounded-full -ml-1.5 shadow-xs" 
                  title={`Target Project: ₹${(project.recommended_amount/100000).toFixed(1)}L`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Similar Projects List */}
        {similarData?.similar_projects && similarData.similar_projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Similar Work</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5 text-right">Sanction Amount</th>
                  <th className="px-3 py-2.5 text-right">Variance vs Target</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {similarData.similar_projects.map((sim) => (
                  <tr key={sim.project_id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 max-w-xs font-medium text-slate-900 truncate" title={sim.work_description}>
                      #{sim.project_id} - {sim.work_description}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {sim.constituency}, {sim.state}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      ₹{sim.recommended_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold">
                      <span className={sim.deviation_pct > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        {sim.deviation_pct > 0 ? `+${sim.deviation_pct}%` : `${sim.deviation_pct}%`}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {sim.completion_status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => navigate(`/project/${sim.project_id}`)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-700 font-bold text-[11px] border border-slate-200 shadow-2xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No comparable projects found in this immediate sector cohort.</p>
        )}
      </div>

      {/* 5. Linked Transactions & Payment Voucher Intelligence */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-700" />
              Linked Transaction Audit Records ({transactions.length} Vouchers)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified payment transactions and duplicate signature screening
            </p>
          </div>
          <span className="text-xs text-slate-600 font-mono font-bold">
            Total Disbursed: ₹{transactions.reduce((acc, t) => acc + (t.expenditure_amount || 0), 0).toLocaleString('en-IN')}
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5">Voucher ID</th>
                  <th className="px-3 py-2.5">Disbursement Date</th>
                  <th className="px-3 py-2.5">Vendor / Payee</th>
                  <th className="px-3 py-2.5 text-right">Amount (₹)</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-center">Signature Duplicate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono font-bold text-slate-900">
                      {tx.transaction_id}
                    </td>
                    <td className="px-3 py-2 text-slate-600 font-mono">
                      {tx.expenditure_date || 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-slate-800 max-w-xs truncate">
                      {tx.vendor || 'Disbursed Payee'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                      ₹{Number(tx.expenditure_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tx.payment_status || 'PAID'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {tx.is_repeated_signature ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                          Repeat ({tx.sig_repeat_count}x)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">Unique</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No linked transaction vouchers found for this project record.</p>
        )}
      </div>

      {/* Compare Modal */}
      <ProjectCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        targetProject={project}
        similarData={similarData}
      />

    </div>
  );
};

export default ProjectDetailPage;
