import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldAlert, 
  Users, 
  MapPin, 
  FileSpreadsheet, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [highRiskSample, setHighRiskSample] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [sum, hr, st] = await Promise.all([
        api.getDashboardSummary(),
        api.getHighRiskProjects(10),
        api.getStateAnalytics().catch(() => [])
      ]);
      setSummary(sum);
      setHighRiskSample(hr);
      setStates(st);
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportHighRiskCSV = async () => {
    setGeneratingReport('high-risk-csv');
    try {
      const res = await api.getProjects({ risk_level: 'HIGH,CRITICAL', page: 1, page_size: 100 });
      const items = res.items || [];
      const headers = ["Project ID", "Work Description", "Category", "MP Name", "Constituency", "State", "Sanction Amount", "Final Amount", "Cost Deviation %", "Risk Score", "Risk Level", "Primary Reason"];
      const rows = items.map(p => [
        p.project_id,
        `"${(p.work_description || '').replace(/"/g, '""')}"`,
        p.category,
        `"${p.mp_name}"`,
        p.constituency,
        p.state,
        p.recommended_amount,
        p.final_amount,
        p.cost_deviation_pct,
        p.risk_score,
        p.risk_level,
        `"${(p.primary_reason || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `MPLAD_High_Risk_Prioritization_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleExportStateCSV = () => {
    if (!states || states.length === 0) return;
    const headers = ["State", "Total Works", "Sanction Budget (INR)", "Certified Final (INR)", "Completed Works", "Unverified Works", "High Risk Works", "Average Risk Score"];
    const rows = states.map(s => [
      `"${s.state}"`,
      s.total_projects,
      s.total_recommended,
      s.total_final,
      s.completed_count,
      s.unverified_count,
      s.high_risk_count,
      s.avg_risk_score
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MPLAD_State_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gov-100 text-gov-800 border border-gov-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Official Scheme Intelligence Reports</h2>
              <p className="text-xs text-slate-500">
                Generate structured audit dossiers, constituency risk distribution digests, and state-level spreadsheets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. High Risk Prioritization Report */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-gov-400 transition-all">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 w-fit border border-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">High-Risk Prioritization Registry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consolidated registry of all works with composite risk scores &gt;60, complete with cost deviation metrics, peer comparisons, and advisory audit actions.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleExportHighRiskCSV}
              disabled={generatingReport === 'high-risk-csv'}
              className="w-full px-4 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              {generatingReport === 'high-risk-csv' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export Prioritized Works (CSV)</span>
            </button>
            <button
              onClick={() => navigate('/high-risk?risk=CRITICAL')}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View In Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. State & Regional Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-gov-400 transition-all">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-gov-100 text-gov-800 w-fit border border-gov-200">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">National State & Regional Digest</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comprehensive performance matrix across all 36 States/UTs including sanctioned envelope, certified amounts, completion counts, and high-risk clusters.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleExportStateCSV}
              className="w-full px-4 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export State Analytics (CSV)</span>
            </button>
            <button
              onClick={() => navigate('/states')}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View State Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Project Investigation Dossier */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-gov-400 transition-all">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 w-fit border border-purple-200">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Single-Work Investigation Dossier</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official printable intelligence dossier for specific projects featuring the 0–100 risk score breakdown, factual evidence points, and field inspection checklist.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => navigate('/project/80673')}
              className="w-full px-4 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Open Sample Dossier (#80673)</span>
            </button>
            <button
              onClick={() => navigate('/high-risk')}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Select Any Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Top Flagged Works Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              High-Risk Prioritization Registry Preview
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time snapshot of the highest-ranked development works flagged for verification
            </p>
          </div>
          <button
            onClick={() => navigate('/high-risk')}
            className="text-xs text-gov-700 hover:text-gov-900 font-bold flex items-center gap-1"
          >
            <span>Open All Works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Work ID</th>
                <th className="px-4 py-3">Work Description</th>
                <th className="px-4 py-3">Location & MP</th>
                <th className="px-4 py-3 text-right">Sanction Amount</th>
                <th className="px-4 py-3 text-right">Final Amount</th>
                <th className="px-4 py-3 text-center">Deviation</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-4 py-3 text-center">Official Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highRiskSample.map((p) => (
                <tr key={p.project_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-gov-800">#{p.project_id}</td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-900" title={p.work_description}>
                    {p.work_description}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="font-semibold text-slate-800">{p.constituency}, {p.state}</div>
                    <div className="text-[11px] text-slate-500">{p.mp_name}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {p.final_amount > 0 ? `₹${Number(p.final_amount).toLocaleString('en-IN')}` : 'Pending'}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-red-600">
                    {p.cost_deviation_pct > 0 ? `+${p.cost_deviation_pct}%` : `${p.cost_deviation_pct}%`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/project/${p.project_id}`)}
                      className="px-2.5 py-1 rounded bg-gov-50 hover:bg-gov-100 text-gov-800 border border-gov-200 text-[11px] font-bold"
                    >
                      Print Dossier
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

export default ReportsPage;
