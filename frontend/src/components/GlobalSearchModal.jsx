import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, MapPin, Landmark, CornerDownLeft, Sparkles, FolderGit2 } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import RiskBadge from './RiskBadge';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [projectResults, setProjectResults] = useState([]);
  const [mpResults, setMpResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setProjectResults([]);
      setMpResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [pRes, mRes] = await Promise.allSettled([
          api.getProjects({ search: query.trim(), page: 1, page_size: 4 }),
          api.getMps(query.trim(), 4)
        ]);

        if (pRes.status === 'fulfilled') {
          setProjectResults(pRes.value?.items || []);
        } else {
          setProjectResults([]);
        }

        if (mRes.status === 'fulfilled') {
          setMpResults(mRes.value || []);
        } else {
          setMpResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = projectResults.length + mpResults.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className={`rounded-2xl shadow-2xl border max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-700/80 text-white backdrop-blur-xl shadow-cyan-950/20' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Search Bar */}
        <div className={`p-4 border-b flex items-center gap-3 ${
          isDark ? 'bg-slate-800/60 border-slate-700/70' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <Search className="w-5 h-5 text-cyan-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by MP Name (e.g. Rahul Gandhi, Modi), constituency, or Work ID..."
            autoFocus
            className={`flex-1 text-sm bg-transparent border-none focus:outline-none font-medium placeholder:text-slate-400 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
            isDark ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'
          }`}>
            ESC
          </span>
        </div>

        {/* Search Results */}
        <div className="max-h-[32rem] overflow-y-auto p-3 divide-y divide-slate-100/10 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
              Scanning 774 MPs & 126k national development records...
            </div>
          ) : totalResults > 0 ? (
            <>
              {/* Matched MPs */}
              {mpResults.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-3 py-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">
                      Members of Parliament ({mpResults.length})
                    </p>
                  </div>
                  {mpResults.map((mp) => (
                    <div
                      key={mp.mp_name}
                      onClick={() => {
                        onClose();
                        navigate(`/mps?search=${encodeURIComponent(mp.mp_name)}`);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        isDark 
                          ? 'hover:bg-slate-800/80 border-transparent hover:border-cyan-500/40' 
                          : 'hover:bg-cyan-50/60 border-transparent hover:border-cyan-200'
                      }`}
                    >
                      <div className="space-y-1 max-w-[85%]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {mp.mp_name}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            mp.house === 'Rajya Sabha'
                              ? isDark ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' : 'bg-purple-100 text-purple-700'
                              : isDark ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {mp.house || 'Lok Sabha'}
                          </span>
                          {mp.utilization_pct > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.2 font-medium rounded ${
                              mp.utilization_pct >= 75 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {mp.utilization_pct}% Spent
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{mp.constituency ? `${mp.constituency}, ` : ''}{mp.state}</span>
                          <span>•</span>
                          <span>₹{mp.total_allocated} Cr Allocated</span>
                          <span>•</span>
                          <span>{mp.completed_works} Works Completed</span>
                        </p>
                      </div>
                      <CornerDownLeft className="w-4 h-4 text-cyan-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Projects */}
              {projectResults.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Matched Development Works ({projectResults.length})
                    </p>
                  </div>
                  {projectResults.map((p) => (
                    <div
                      key={p.project_id}
                      onClick={() => {
                        onClose();
                        navigate(`/project/${p.project_id}`);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all ${
                        isDark 
                          ? 'hover:bg-slate-800/80 border-transparent hover:border-indigo-500/40' 
                          : 'hover:bg-indigo-50/60 border-transparent hover:border-indigo-200'
                      }`}
                    >
                      <div className="space-y-1 max-w-[85%]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-400 text-xs">#{p.project_id}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{p.category}</span>
                          <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                        </div>
                        <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {p.work_description}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {p.mp_name} • {p.constituency}, {p.state} • ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <CornerDownLeft className="w-4 h-4 text-indigo-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching MPs or development works found for "{query}".
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 space-y-3">
              <p className="font-medium text-slate-300">Quick MP & Intelligence Navigation</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => { onClose(); navigate('/mps?search=Rahul%20Gandhi'); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  👤 Rahul Gandhi
                </button>
                <button
                  onClick={() => { onClose(); navigate('/mps?search=Narendra%20Modi'); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  👤 Narendra Modi
                </button>
                <button
                  onClick={() => { onClose(); navigate('/mps?search=Akhilesh%20Yadav'); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  👤 Akhilesh Yadav
                </button>
                <button
                  onClick={() => { onClose(); navigate('/mps?search=Shashi%20Tharoor'); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  👤 Shashi Tharoor
                </button>
                <button
                  onClick={() => { onClose(); navigate('/mps'); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  🏛️ All 774 MPs Directory
                </button>
                <button
                  onClick={() => { onClose(); navigate('/high-risk'); }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  ⚠️ Prioritized High-Risk Works
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GlobalSearchModal;
