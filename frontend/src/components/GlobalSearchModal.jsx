import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, Users, MapPin, Layers, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from './RiskBadge';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpenSearch();
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
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getProjects({ search: query.trim(), page: 1, page_size: 6 });
        setResults(res.items || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Work ID, description, MP, constituency, district, state..."
            autoFocus
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
            ESC
          </span>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Searching master database...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Matched Development Works ({results.length})
              </p>
              {results.map((p) => (
                <div
                  key={p.project_id}
                  onClick={() => {
                    onClose();
                    navigate(`/project/${p.project_id}`);
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gov-800 text-xs">#{p.project_id}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{p.category}</span>
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-slate-900 truncate">{p.work_description}</p>
                    <p className="text-[11px] text-slate-500">
                      {p.mp_name} • {p.constituency}, {p.state} • ₹{Number(p.recommended_amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <CornerDownLeft className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-400">No matching works or MPs found.</div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <p className="font-medium text-slate-600">Quick Navigation Suggestions</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <button
                  onClick={() => { onClose(); navigate('/high-risk'); }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                >
                  Prioritized High-Risk Works
                </button>
                <button
                  onClick={() => { onClose(); navigate('/mps'); }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                >
                  MP Analytics Directory
                </button>
                <button
                  onClick={() => { onClose(); navigate('/anomalies'); }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                >
                  Duplicate Voucher Center
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
