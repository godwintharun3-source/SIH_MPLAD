import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  IndianRupee, 
  TrendingUp, 
  Building2, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export const MPAnalyticsPage = () => {
  const [mps, setMps] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMp, setSelectedMp] = useState(null);
  const [mpDetail, setMpDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMps();
  }, []);

  const fetchMps = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.getMps(searchQuery, 100);
      setMps(res);
      if (res.length > 0 && !selectedMp) {
        handleSelectMp(res[0].mp_name);
      }
    } catch (err) {
      console.error('Error fetching MPs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMps(search);
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
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">MP & Constituency Implementation Intelligence</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track utilization rates, completion timelines, and risk indicator concentrations across 774 Members of Parliament
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search MP, Constituency, State..."
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: MP Directory + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MPs List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Members of Parliament Directory ({mps.length} Listed)
            </h3>
            <span className="text-[11px] text-slate-500">Sorted by Total Expenditure</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <span>Loading MP metrics...</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">MP & Constituency</th>
                    <th className="px-4 py-3">House & State</th>
                    <th className="px-4 py-3 text-right">Allocated</th>
                    <th className="px-4 py-3 text-right">Expended</th>
                    <th className="px-4 py-3 text-center">Utilization</th>
                    <th className="px-4 py-3 text-center">Works</th>
                    <th className="px-4 py-3 text-center">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mps.map((mp) => (
                    <tr 
                      key={mp.mp_name} 
                      className={`hover:bg-slate-50 transition-colors ${selectedMp === mp.mp_name ? 'bg-blue-50/50 font-medium' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{mp.mp_name}</div>
                        <div className="text-[11px] text-slate-500">{mp.constituency}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <div>{mp.state}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{mp.house}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                        ₹{(mp.allocated_amount / 10000000).toFixed(1)} Cr
                      </td>
                      <td className="px-4 py-3 text-right font-mono whitespace-nowrap font-bold text-slate-900">
                        ₹{(mp.total_expenditure / 10000000).toFixed(1)} Cr
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          mp.utilization_pct >= 70 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          mp.utilization_pct >= 40 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {mp.utilization_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">{mp.completed_works}</span> / <span>{mp.recommended_works}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleSelectMp(mp.mp_name)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200 transition-colors shadow-2xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected MP Profile Drawer / Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            MP Intelligence Profile
          </h3>

          {detailLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span>Loading MP breakdown...</span>
            </div>
          ) : mpDetail ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="text-sm font-extrabold text-slate-900">{mpDetail.mp_profile.mp_name}</h4>
                <p className="text-slate-600">
                  <strong>Constituency:</strong> {mpDetail.mp_profile.constituency}, {mpDetail.mp_profile.state}
                </p>
                <p className="text-slate-600">
                  <strong>House:</strong> {mpDetail.mp_profile.house}
                </p>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Allocated</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    ₹{(mpDetail.mp_profile.allocated_amount / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Expended</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    ₹{(mpDetail.mp_profile.total_expenditure / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Unspent</p>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    ₹{(mpDetail.mp_profile.unspent_amount / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Utilization</p>
                  <p className="font-mono font-bold text-blue-700 mt-0.5">
                    {mpDetail.mp_profile.utilization_pct.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Works Count Breakdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Recommended Works:</span>
                  <strong className="font-mono">{mpDetail.mp_profile.recommended_works}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completed Works:</span>
                  <strong className="font-mono text-emerald-700 font-bold">{mpDetail.mp_profile.completed_works}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completion Rate:</span>
                  <strong className="font-mono">{mpDetail.mp_profile.completion_rate_pct?.toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transactions / Vouchers:</span>
                  <strong className="font-mono">{mpDetail.mp_profile.transaction_count}</strong>
                </div>
              </div>

              {/* Top Flagged Works for this MP */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Works Monitored for this MP ({mpDetail.projects?.length || 0})
                </h5>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(mpDetail.projects || []).slice(0, 10).map((p) => (
                    <div 
                      key={p.project_id}
                      onClick={() => navigate(`/project/${p.project_id}`)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-900">#{p.project_id}</span>
                        <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-800 truncate font-medium">{p.work_description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Rec: ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}</span>
                        {p.cost_deviation_pct > 0 && (
                          <span className="text-red-600 font-bold">+{p.cost_deviation_pct}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Select any Member of Parliament from the directory to inspect their constituency performance.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MPAnalyticsPage;
