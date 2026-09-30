import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import ProjectCompareModal from '../components/ProjectCompareModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { exportToExcel } from '../utils/excelExport';

export const HighRiskProjectsPage = () => {
  const { selectedHouse, setSelectedHouse, selectedState, setSelectedState } = useAuth();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [house, setHouse] = useState(selectedHouse || 'All');
  const [state, setState] = useState(selectedState !== 'All' ? selectedState : 'All');
  const [mpName, setMpName] = useState('All');
  const [category, setCategory] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortDir, setSortDir] = useState('desc');
  const [mpList, setMpList] = useState([]);

  // Compare modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [compareSimilar, setCompareSimilar] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load MP filter options
  useEffect(() => {
    api.getMpFilterOptions().then((res) => {
      if (res && res.mps) setMpList(res.mps);
    }).catch(console.error);
  }, []);

  // Filter MPs based on chosen house and state
  const filteredMps = useMemo(() => {
    return mpList.filter((m) => {
      if (house !== 'All' && m.house !== house) return false;
      if (state !== 'All' && m.state !== state) return false;
      return true;
    });
  }, [mpList, house, state]);

  // Sync with global header state changes
  useEffect(() => {
    if (selectedHouse) setHouse(selectedHouse);
  }, [selectedHouse]);

  useEffect(() => {
    if (selectedState && selectedState !== 'All') setState(selectedState);
  }, [selectedState]);

  useEffect(() => {
    const initialRisk = searchParams.get('risk');
    const initialState = searchParams.get('state');
    const initialHouse = searchParams.get('house');
    const initialMp = searchParams.get('mp');
    const initialStatus = searchParams.get('status');

    if (initialRisk) setRiskLevel(initialRisk);
    if (initialState) setState(initialState);
    if (initialHouse) setHouse(initialHouse);
    if (initialMp) setMpName(initialMp);
    if (initialStatus) setStatus(initialStatus);
  }, [searchParams]);

  useEffect(() => {
    fetchProjects();
  }, [page, house, state, mpName, category, riskLevel, status, sortBy, sortDir]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects({
        page,
        page_size: 25,
        house: house !== 'All' ? house : undefined,
        state: state !== 'All' ? state : undefined,
        mp_name: mpName !== 'All' ? mpName : undefined,
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

  const handleExportXLS = () => {
    if (!projects || projects.length === 0) return;
    const excelData = projects.map(p => ({
      "Project ID": p.project_id,
      "Work ID": p.work_id || p.project_id,
      "Work Description": p.work_description || '',
      "MP Name": p.mp_name || '',
      "House": p.house || '',
      "Constituency": p.constituency || '',
      "State": p.state || '',
      "Category": p.category || '',
      "Recommended (₹)": p.recommended_amount || 0,
      "Final (₹)": p.final_amount || 0,
      "Cost Deviation %": p.cost_deviation_pct || 0,
      "Risk Score": p.risk_score || 0,
      "Risk Level": p.risk_level || '',
      "Primary Reason": p.primary_reason || '',
      "Status": p.completion_status || ''
    }));
    exportToExcel(excelData, 'MPLAD_Priority_Review_Queue', 'High Risk Projects');
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

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MPLAD_Priority_Review_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            onClick={handleExportXLS}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export XLS</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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

          {/* Quick Metrics Count & Reset */}
          <div className="flex items-center gap-3 self-start lg:self-auto text-xs text-slate-600 dark:text-slate-400 font-mono">
            <span>Showing <strong className="text-slate-900 dark:text-white font-bold">{projects.length}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{total.toLocaleString()}</strong> matched works</span>
            {(house !== 'All' || state !== 'All' || mpName !== 'All' || category !== 'All' || riskLevel !== 'All' || status !== 'All' || search) && (
              <button
                onClick={() => {
                  setHouse('All');
                  setState('All');
                  setMpName('All');
                  setCategory('All');
                  setRiskLevel('All');
                  setStatus('All');
                  setSearch('');
                  setSelectedHouse('All');
                  setSelectedState('All');
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 text-[11px] font-sans font-medium transition-colors cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
          
          {/* Parliamentary House Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">House</label>
            <select
              value={house}
              onChange={(e) => { setHouse(e.target.value); setSelectedHouse(e.target.value); setMpName('All'); setPage(1); }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              <option value="All">All Houses</option>
              <option value="Lok Sabha">Lok Sabha (543)</option>
              <option value="Rajya Sabha">Rajya Sabha (231)</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setSelectedState(e.target.value); setMpName('All'); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* MP Name Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">MP Name</label>
            <select
              value={mpName}
              onChange={(e) => { setMpName(e.target.value); setPage(1); }}
              className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#121829] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 text-xs font-medium"
            >
              <option value="All">All MPs ({filteredMps.length})</option>
              {filteredMps.map(m => {
                const name = m.mp_name || '';
                return (
                  <option key={name} value={name}>
                    {name.length > 20 ? name.slice(0, 19) + '…' : name} ({m.house === 'Lok Sabha' ? 'LS' : 'RS'})
                  </option>
                );
              })}
            </select>
          </div>

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
            <table className="w-full text-left text-xs border-collapse min-w-[920px]">
              <thead className="sticky top-0 z-10 app-table-th shadow-2xs">
                <tr>
                  <th className="px-3 py-3 text-center w-[120px]">Risk Level & Score</th>
                  <th className="px-3 py-3 max-w-[220px]">Project ID & Description</th>
                  <th className="px-3 py-3 w-[150px]">Location & MP</th>
                  <th className="px-3 py-3 max-w-[250px]">Primary Anomaly Reason</th>
                  <th className="px-3 py-3 text-center w-[85px]">Cost Dev %</th>
                  <th className="px-3 py-3 text-right w-[100px]">Recommended</th>
                  <th className="px-3 py-3 text-right w-[105px]">Final Amount</th>
                  <th className="px-3 py-3 text-center w-[95px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {projects.map((p) => (
                  <tr key={p.project_id} className="app-table-row group">
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="md" />
                    </td>
                    <td className="px-3 py-3 max-w-[220px]">
                      <div className="font-mono font-bold text-blue-700 dark:text-cyan-400 text-xs">#{p.project_id}</div>
                      <div className="app-table-title truncate mt-0.5" title={p.work_description}>
                        {p.work_description}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.category}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="app-table-location">{p.constituency}, {p.state}</div>
                      <div className="app-table-mp truncate max-w-[140px] mt-0.5">{p.mp_name}</div>
                    </td>
                    <td className="px-3 py-3 max-w-[250px]">
                      <span className="anomaly-pill truncate max-w-[240px] inline-block" title={p.primary_reason}>
                        {p.primary_reason}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold whitespace-nowrap">
                      {p.cost_deviation_pct !== 0 ? (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
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
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span className="app-table-amount">₹{p.recommended_amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {p.final_amount > 0 ? (
                        <span className="app-table-amount-bold">₹{p.final_amount.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending Registry</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
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
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
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
