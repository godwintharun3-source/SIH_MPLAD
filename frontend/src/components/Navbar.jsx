import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  BarChart3, 
  Layers, 
  Users, 
  MapPin, 
  Bot, 
  FileText, 
  Sparkles,
  Search,
  Database
} from 'lucide-react';

export const Navbar = ({ onOpenAI, demoMode, setDemoMode }) => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Overview Dashboard', icon: BarChart3 },
    { to: '/high-risk', label: 'High-Risk Works', icon: ShieldAlert },
    { to: '/anomalies', label: 'Anomaly Center', icon: Layers },
    { to: '/mps', label: 'MP Analytics', icon: Users },
    { to: '/states', label: 'State & Map View', icon: MapPin },
    { to: '/transparency', label: 'Data & Methodology', icon: Database },
  ];

  return (
    <header className="bg-gov-900 text-white border-b border-gov-800 sticky top-0 z-40 shadow-md">
      {/* Top Ministry Banner */}
      <div className="bg-gov-950 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between border-b border-gov-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Ministry of Statistics and Programme Implementation (MoSPI)</span>
          <span className="text-slate-500">|</span>
          <span>Government of India</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Live MPLADS Dataset: <strong className="text-slate-200 font-mono">2026-08-28</strong></span>
          <div className="flex items-center gap-1.5 bg-gov-800/80 px-2 py-0.5 rounded border border-gov-700 text-[11px]">
            <span className="text-amber-300 font-medium">Prototype Risk Model</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gov-800 rounded-lg border border-gov-700">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                MPLAD AI Risk & Anomaly Intelligence
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SIH26102
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                AI-assisted monitoring and prioritization of development works for authorized human review
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            {/* Demo Mode Toggle */}
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                demoMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                  : 'bg-gov-800 text-slate-300 border-gov-700 hover:bg-gov-750'
              }`}
              title="Toggle interactive 10-step SIH demo flow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{demoMode ? 'Demo Mode Active' : 'Enable Demo Guide'}</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="bg-accent-500 hover:bg-accent-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-3 pt-2 border-t border-gov-800/80 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-gov-700 text-white font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-gov-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
