import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  ExternalLink, 
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Scale,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ProjectCompareModal from '../components/ProjectCompareModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const HighRiskProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All');
  const [category, setCategory] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortDir, setSortDir] = useState('desc');

  // Compare modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [compareSimilar, setCompareSimilar] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initialRisk = searchParams.get('risk');
    const initialState = searchParams.get('state');
    const initialStatus = searchParams.get('status');
    if (initialRisk) setRiskLevel(initialRisk);
    if (initialState) setState(initialState);
    if (initialStatus) setStatus(initialStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchProjects();
  }, [page, state, category, riskLevel, status, sortBy, sortDir]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects({
        page,
        page_size: 25,
        state: state !== 'All' ? state : undefined,
        category: category !== 'All' ? category : undefined,
        risk_level: riskLevel !== 'All' ? riskLevel : undefined,
        completion_status: status !== 'All' ? status : undefined,
        search: search.trim() ? search.trim() : undefined,
        sort_by: sortBy,
        sort_dir: sortDir
      });
      setProjects(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
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

  const handleExportCSV = () => {
    if (!projects || projects.length === 0) return;
    const headers = ["Project ID", "Work Description", "MP Name", "Constituency", "State", "Category", "Recommended (INR)", "Final (INR)", "Cost Deviation %", "Risk Score", "Risk Level", "Primary Reason"];
    const rows = projects.map(p => [
      p.project_id,
      `"${(p.work_description || '').replace(/"/g, '""')}"`,
      `"${p.mp_name}"`,
      `"${p.constituency}"`,
      `"${p.state}"`,
      `"${p.category}"`,
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
    link.setAttribute("download", `MPLAD_Priority_Review_Queue_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statesList = [
    "All", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ];

  const categoriesList = [
    "All",
    "Community Centers & Halls",
    "Roads, Bridges & Culverts",
    "Drinking Water & Hand Pumps",
    "Public Lighting & Solar Electricity",
    "Education & Public Libraries",
    "Health & Medical Facilities",
    "Sanitation & Drainage",
    "Irrigation & Water Conservation",
    "Sports, Stadiums & Gyms",
    "Repair and Renovation",
    "Trust and Society"
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Priority Review Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Projects with the strongest risk indicators, prioritized dynamically for human review across 1,26,582 works
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#0e1424] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="w-full lg:w-96 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Work ID, Description, MP, Location..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Filter
            </button>
          </form>

          {/* Quick Metrics Count */}
          <div className="flex items-center gap-2 self-start lg:self-auto text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span>Showing <strong className="text-slate-900 dark:text-white font-bold">{projects.length}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{total.toLocaleString()}</strong> matched works</span>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
          
          {/* Risk Level Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Risk Level</label>
            <select
              value={riskLevel}
              onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              <option value="All">All Risk Levels</option>
              <option value="CRITICAL">Critical (81–100)</option>
              <option value="HIGH">High (61–80)</option>
              <option value="MEDIUM">Medium (31–60)</option>
              <option value="LOW">Low (0–30)</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Sector</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Completion Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="COMPLETION_VERIFICATION_REQUIRED">Verification Required</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Sort Metric</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              <option value="risk_score">Risk Score</option>
              <option value="cost_deviation_pct">Cost Deviation %</option>
              <option value="recommended_amount">Sanction Amount</option>
              <option value="final_amount">Final Amount</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Order</label>
            <select
              value={sortDir}
              onChange={(e) => { setSortDir(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              <option value="desc">Descending (High to Low)</option>
              <option value="asc">Ascending (Low to High)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table (Hierarchy: Risk Score First Column) */}
      <div className="table-card bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <LoadingSkeleton type="table" count={8} />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-100">No projects match the selected filter criteria.</p>
            <p className="mt-1 text-slate-400 dark:text-slate-400">Try broadening your search or resetting the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[620px] overflow-y-auto scroll-smooth table-scroll">
            <table className="w-full text-left text-xs border-collapse min-w-[980px]">
              <thead className="sticky top-0 z-10 app-table-th shadow-2xs">
                <tr>
                  <th className="px-3.5 py-3.5 text-center w-[130px]">Risk Level & Score</th>
                  <th className="px-3.5 py-3.5 max-w-[240px]">Project ID & Description</th>
                  <th className="px-3.5 py-3.5 w-[160px]">Location & MP</th>
                  <th className="px-3.5 py-3.5 max-w-[280px]">Primary Anomaly Reason</th>
                  <th className="px-3.5 py-3.5 text-center w-[95px]">Cost Dev %</th>
                  <th className="px-3.5 py-3.5 text-right w-[110px]">Recommended</th>
                  <th className="px-3.5 py-3.5 text-right w-[115px]">Final Amount</th>
                  <th className="px-3.5 py-3.5 text-center w-[95px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {projects.map((p) => (
                  <tr key={p.project_id} className="app-table-row group">
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="md" />
                    </td>
                    <td className="px-3.5 py-3.5 max-w-[240px]">
                      <div className="font-mono font-bold text-blue-700 dark:text-cyan-400 text-xs">#{p.project_id}</div>
                      <div className="app-table-title truncate mt-0.5" title={p.work_description}>
                        {p.work_description}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.category}</div>
                    </td>
                    <td className="px-3.5 py-3.5 whitespace-nowrap">
                      <div className="app-table-location">{p.constituency}, {p.state}</div>
                      <div className="app-table-mp truncate max-w-[140px] mt-0.5">{p.mp_name}</div>
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
                        <span className="text-slate-400 italic text-[11px]">Pending Registry</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenCompare(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/10 cursor-pointer"
                          title="Compare with peer cohort"
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/project/${p.project_id}`)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
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
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Page <strong className="text-slate-900 dark:text-white font-bold">{page}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{totalPages}</strong> (25 works per page)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 font-bold flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 font-bold flex items-center gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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

export default HighRiskProjectsPage;
