import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  X, 
  IndianRupee, 
  TrendingUp, 
  Building2, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Sparkles,
  MapPin,
  Landmark,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import RiskBadge from '../components/RiskBadge';
import { exportToExcel } from '../utils/excelExport';

const POPULAR_MPS = [
  { name: 'Rahul Gandhi', label: 'Rahul Gandhi (Rae Bareli)' },
  { name: 'Narendra Modi', label: 'Narendra Modi (Varanasi)' },
  { name: 'Akhilesh Yadav', label: 'Akhilesh Yadav (Kannauj)' },
  { name: 'Dr Shashi Tharoor', label: 'Shashi Tharoor (Thiruvananthapuram)' },
  { name: 'Gurjeet Singh Aujla', label: 'Gurjeet Singh Aujla (Amritsar)' },
  { name: 'Smt Hema Malini', label: 'Hema Malini (Mathura)' },
  { name: 'Smt Supriya Sadanand Sule', label: 'Supriya Sule (Baramati)' },
  { name: 'Ms Mahua Moitra', label: 'Mahua Moitra (Krishnanagar)' },
  { name: 'Asaduddin Owaisi', label: 'Asaduddin Owaisi (Hyderabad)' },
  { name: 'Dr. Abhishek Manu Singhvi', label: 'Abhishek Manu Singhvi (RS)' }
];

const STATES_LIST = [
  "All", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export const MPAnalyticsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [mps, setMps] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [houseFilter, setHouseFilter] = useState('All'); // 'All' | 'Lok Sabha' | 'Rajya Sabha'
  const [stateFilter, setStateFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedMp, setSelectedMp] = useState(null);
  const [mpDetail, setMpDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const searchDebounceRef = useRef(null);

  // Sync URL search params if navigated with ?search=...
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
      setHouseFilter('All');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMps(search, houseFilter, stateFilter);
  }, [houseFilter, stateFilter]);

  // Debounced live search as user types
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      fetchMps(search, houseFilter, stateFilter);
    }, 250);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  const fetchMps = async (searchQuery = '', house = houseFilter, state = stateFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (house && house !== 'All') params.house = house;
      if (state && state !== 'All') params.state = state;
      const res = await api.getMps(searchQuery.trim(), 100, params);
      setMps(res || []);
      if (res && res.length > 0) {
        // If current selectedMp is not in results, select the first matching MP
        const exists = res.some(m => m.mp_name === selectedMp);
        if (!exists) {
          handleSelectMp(res[0].mp_name);
        }
      } else {
        setSelectedMp(null);
        setMpDetail(null);
      }
    } catch (err) {
      console.error('Error fetching MPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    fetchMps(search, houseFilter, stateFilter);
  };

  const handleQuickSearch = (mpName) => {
    setSearch(mpName);
    setHouseFilter('All');
    setStateFilter('All');
    fetchMps(mpName, 'All', 'All');
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchMps('', houseFilter, stateFilter);
  };

  const handleExportMpsXLS = () => {
    if (!mps || mps.length === 0) return;
    const excelData = mps.map(m => ({
      "MP Name": m.mp_name,
      "House": m.house,
      "Constituency": m.constituency || 'Nominated / Statewide',
      "State": m.state,
      "Allocated Amount (₹ Cr)": +(m.allocated_amount / 1e7).toFixed(2),
      "Total Expenditure (₹ Cr)": +(m.total_expenditure / 1e7).toFixed(2),
      "Unspent Balance (₹ Cr)": +((m.unspent_amount || 0) / 1e7).toFixed(2),
      "Utilization %": +(m.utilization_pct || 0).toFixed(1),
      "Recommended Works": m.recommended_works || 0,
      "Sanctioned Works": m.sanctioned_works || 0,
      "Completed Works": m.completed_works || 0,
      "High Risk Projects": m.high_risk_projects_count || 0
    }));
    exportToExcel(excelData, `MPLAD_MP_Directory_${houseFilter}_${stateFilter}`, 'MP Implementation');
  };

  const handleSelectMp = async (mpName) => {
    setSelectedMp(mpName);
    setDetailLoading(true);
    try {
      const res = await api.getMpDetail(mpName);
      setMpDetail(res);
    } catch (err) {
      console.error('Error fetching MP detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Header Banner with Real MP Search */}
      <div className={`p-6 rounded-3xl border shadow-sm backdrop-blur-2xl transition-all ${
        isDark 
          ? 'bg-slate-900/60 border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${
              isDark ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">MP & Constituency Implementation Intelligence</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isDark ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300' : 'bg-blue-50 border-blue-300 text-blue-700'
                }`}>
                  774 MPs
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Search and audit utilization rates, completion timelines, and risk indicators across all official Members of Parliament
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search MP name, constituency, state..."
                className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium ${
                  isDark 
                    ? 'bg-slate-800/80 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-500/50' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500'
                }`}
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Quick MP Search Tags & House Filters */}
        <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Popular MPs Quick Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick MP Search:</span>
            </div>
            {POPULAR_MPS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleQuickSearch(p.name)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border cursor-pointer ${
                  search.toLowerCase() === p.name.toLowerCase()
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : isDark
                      ? 'bg-slate-800/60 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Parliamentary Filters (House + State + Reset) */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Parliamentary House Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-800/60 shrink-0">
              {['All', 'Lok Sabha', 'Rajya Sabha'].map((house) => (
                <button
                  key={house}
                  type="button"
                  onClick={() => setHouseFilter(house)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    houseFilter === house
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {house === 'All' ? 'All Houses' : house === 'Lok Sabha' ? 'Lok Sabha (543)' : 'Rajya Sabha (231)'}
                </button>
              ))}
            </div>

            {/* State Select */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-white/10 text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              {STATES_LIST.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All States' : s}
                </option>
              ))}
            </select>

            {/* Reset Filter Button */}
            {(houseFilter !== 'All' || stateFilter !== 'All' || search) && (
              <button
                type="button"
                onClick={() => {
                  setHouseFilter('All');
                  setStateFilter('All');
                  setSearch('');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold transition-all cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Grid: MP Directory + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MPs List */}
        <div className={`lg:col-span-2 rounded-3xl border shadow-sm backdrop-blur-2xl overflow-hidden transition-all ${
          isDark 
            ? 'bg-slate-900/60 border-white/10 text-white' 
            : 'bg-white/80 border-slate-200/80 text-slate-900'
        }`}>
          <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-2 ${
            isDark ? 'bg-slate-800/40 border-white/10' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Members of Parliament Directory
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isDark ? 'bg-cyan-950/60 text-cyan-300' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {mps.length} Listed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-mono hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Sorted by Total Expenditure
              </span>
              <button
                type="button"
                onClick={handleExportMpsXLS}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export XLS</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 text-blue-600 dark:text-cyan-400 animate-spin" />
              <span className="font-mono">Searching official MP database...</span>
            </div>
          ) : mps.length === 0 ? (
            <div className="p-16 text-center text-xs space-y-3">
              <Users className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No Members of Parliament found matching "{search}"
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[720px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className={`font-bold border-b sticky top-0 z-10 ${
                  isDark ? 'bg-slate-800 text-slate-300 border-white/10' : 'bg-slate-100/90 text-slate-700 border-slate-200'
                }`}>
                  <tr>
                    <th className="px-3 py-2.5">MP & Constituency</th>
                    <th className="px-2.5 py-2.5">House & State</th>
                    <th className="px-2.5 py-2.5 text-right">Allocated</th>
                    <th className="px-2.5 py-2.5 text-right">Expended</th>
                    <th className="px-2 py-2.5 text-center">Utilization</th>
                    <th className="px-2 py-2.5 text-center">Works</th>
                    <th className="px-2.5 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {mps.map((mp) => {
                    const isSelected = selectedMp === mp.mp_name;
                    return (
                      <tr 
                        key={mp.mp_name} 
                        onClick={() => handleSelectMp(mp.mp_name)}
                        className={`transition-colors cursor-pointer ${
                          isSelected 
                            ? isDark 
                              ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400' 
                              : 'bg-blue-50/70 border-l-4 border-l-blue-600'
                            : isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {mp.mp_name}
                          </div>
                          <div className={`text-[11px] mt-0.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{mp.constituency}</span>
                          </div>
                        </td>
                        <td className="px-2.5 py-2.5 whitespace-nowrap">
                          <div className={isDark ? 'text-slate-200' : 'text-slate-700'}>{mp.state}</div>
                          <span className={`inline-block px-2 py-0.2 mt-0.5 rounded text-[10px] font-mono font-bold ${
                            mp.house === 'Lok Sabha' 
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300' 
                              : 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                          }`}>
                            {mp.house}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-right font-mono whitespace-nowrap">
                          ₹{(mp.allocated_amount / 10000000).toFixed(1)} Cr
                        </td>
                        <td className={`px-2.5 py-2.5 text-right font-mono whitespace-nowrap font-bold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          ₹{(mp.total_expenditure / 10000000).toFixed(1)} Cr
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block ${
                            mp.utilization_pct >= 70 
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                              : mp.utilization_pct >= 40 
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                                : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                          }`}>
                            {mp.utilization_pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center whitespace-nowrap font-mono text-[11px]">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{mp.completed_works}</span> / <span>{mp.recommended_works}</span>
                        </td>
                        <td className="px-2.5 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectMp(mp.mp_name);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : isDark
                                  ? 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                            }`}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected MP Profile Drawer / Panel */}
        <div className={`rounded-3xl border shadow-sm backdrop-blur-2xl p-5 space-y-4 transition-all ${
          isDark 
            ? 'bg-slate-900/60 border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
            : 'bg-white/80 border-slate-200/80 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200/60 dark:border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>MP Intelligence Profile</span>
            </h3>
            {mpDetail && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold">
                Live Audit
              </span>
            )}
          </div>

          {detailLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-cyan-400 animate-spin" />
              <span className="font-mono">Loading MP dossier...</span>
            </div>
          ) : mpDetail ? (
            <div className="space-y-4 text-xs">
              {/* MP Header Card */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark 
                  ? 'bg-slate-800/60 border-white/10' 
                  : 'bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-blue-200/70'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`text-base font-black tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {mpDetail.mp_profile.mp_name}
                    </h4>
                    <p className={`text-xs mt-1 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <strong>Constituency:</strong> {mpDetail.mp_profile.constituency}, {mpDetail.mp_profile.state}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    mpDetail.mp_profile.house === 'Lok Sabha' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-purple-600 text-white'
                  }`}>
                    {mpDetail.mp_profile.house}
                  </span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="pt-2 border-t border-slate-200/40 dark:border-white/10">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Fund Utilization Rate</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {mpDetail.mp_profile.utilization_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        mpDetail.mp_profile.utilization_pct >= 70 ? 'bg-emerald-500' :
                        mpDetail.mp_profile.utilization_pct >= 40 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, mpDetail.mp_profile.utilization_pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Stats 4-Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Allocated</p>
                  <p className={`font-mono font-black text-sm mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{(mpDetail.mp_profile.allocated_amount / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Expended</p>
                  <p className={`font-mono font-black text-sm mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹{(mpDetail.mp_profile.total_expenditure / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Unspent</p>
                  <p className={`font-mono font-black text-sm mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    ₹{(mpDetail.mp_profile.unspent_amount / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Utilization</p>
                  <p className="font-mono font-black text-sm mt-0.5 text-blue-600 dark:text-cyan-400">
                    {mpDetail.mp_profile.utilization_pct.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Works Count Breakdown */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isDark ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Recommended Works:</span>
                  <strong className="font-mono">{mpDetail.mp_profile.recommended_works}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Completed Works:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{mpDetail.mp_profile.completed_works}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Completion Rate:</span>
                  <strong className="font-mono">{mpDetail.mp_profile.completion_rate_pct?.toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Flagged Anomaly Works:</span>
                  <strong className="font-mono text-amber-500 font-bold">{mpDetail.mp_profile.high_risk_projects_count || 0}</strong>
                </div>
              </div>

              {/* Top Flagged Works for this MP */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Monitored Works ({mpDetail.projects?.length || 0})
                  </h5>
                  <span className="text-[10px] text-slate-400">Click to inspect</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(mpDetail.projects || []).slice(0, 15).map((p) => (
                    <div 
                      key={p.project_id}
                      onClick={() => navigate(`/project/${p.project_id}`)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1.5 group ${
                        isDark 
                          ? 'bg-slate-800/40 hover:bg-slate-800 border-white/5 hover:border-cyan-500/40' 
                          : 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">#{p.project_id}</span>
                        <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                      </div>
                      <p className={`text-[11px] truncate font-medium group-hover:text-blue-600 dark:group-hover:text-cyan-300 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        {p.work_description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Rec: ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}</span>
                        {p.cost_deviation_pct > 0 ? (
                          <span className="text-red-500 font-bold">+{p.cost_deviation_pct}%</span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">{p.completion_status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs italic">
              Select any Member of Parliament from the directory to inspect their constituency performance.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MPAnalyticsPage;

