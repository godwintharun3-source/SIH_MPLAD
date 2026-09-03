import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Bot, 
  Sparkles,
  Menu,
  X,
  Compass,
  Sun,
  Moon,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api';
import { RobotEyesIcon } from './RobotGuide';
import { useTheme } from '../context/ThemeContext';

export const Header = ({ 
  onOpenAI, 
  onOpenSearch, 
  onToggleSidebar, 
  sidebarOpen, 
  demoMode, 
  setDemoMode,
  robotGuideOpen,
  onToggleRobotGuide 
}) => {
  const { theme, toggleTheme, isDark, glassIntensity, setGlassIntensity } = useTheme();
  const [pipelineHealthy, setPipelineHealthy] = useState(null);

  useEffect(() => {
    api.getHealth()
      .then((res) => {
        setPipelineHealthy(res.status === 'healthy');
      })
      .catch(() => {
        setPipelineHealthy(false);
      });
  }, []);

  return (
    <header className={`theme-header rounded-2xl border shadow-xl backdrop-blur-2xl transition-all duration-300 overflow-hidden ${
      isDark 
        ? 'bg-[#0c1017]/90 border-white/10 text-white shadow-black/60' 
        : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-slate-200/50'
    }`}>
      
      {/* Top Official Ministry Banner */}
      <div className={`px-4 sm:px-6 py-1.5 text-[11px] flex items-center justify-between border-b transition-colors duration-200 ${
        isDark ? 'bg-black/50 border-white/10 text-slate-300' : 'bg-slate-100/70 border-slate-200/80 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
          <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            Ministry of Statistics and Programme Implementation (MoSPI)
          </span>
          <span className={isDark ? 'text-slate-600 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>|</span>
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} hidden sm:inline`}>Government of India</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} hidden md:inline`}>
            Dataset Release: <strong className={`${isDark ? 'text-slate-200' : 'text-slate-900'} font-mono`}>2026-08-28</strong>
          </span>
          <span className={isDark ? 'text-slate-600 hidden md:inline' : 'text-slate-300 hidden md:inline'}>|</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Pipeline Status:</span>
            {pipelineHealthy === true ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Healthy
              </span>
            ) : pipelineHealthy === false ? (
              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Offline
              </span>
            ) : (
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Checking...</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl border transition-colors lg:hidden cursor-pointer ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10' 
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
            isDark 
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-xs shadow-amber-950/40' 
              : 'border-amber-300 bg-amber-50 text-amber-700 shadow-xs'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm sm:text-base font-black tracking-tight leading-none ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                MPLAD AI Risk & Anomaly Intelligence
              </h1>
              <span className={`hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border font-mono ${
                isDark 
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-2xs' 
                  : 'bg-slate-100 text-slate-800 border-slate-300'
              }`}>
                SIH26102
              </span>
            </div>
            <p className={`text-[11px] font-medium mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Government Decision Support • Multi-Vector Scheme Oversight
            </p>
          </div>
        </div>

        {/* Center Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className={`hidden md:flex items-center justify-between gap-3 px-3.5 py-1.5 border rounded-xl text-xs w-64 max-w-xs transition-all group cursor-pointer ${
            isDark 
              ? 'bg-black/40 hover:bg-black/60 border-white/10 hover:border-cyan-500/40 text-slate-200' 
              : 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 hover:border-blue-400 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Search className={`w-3.5 h-3.5 transition-colors ${
              isDark ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-slate-500 group-hover:text-blue-600'
            }`} />
            <span className={`font-medium ${
              isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'
            }`}>
              Search works, MPs, IDA...
            </span>
          </div>
          <kbd className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${
            isDark ? 'border-white/15 bg-white/10 text-cyan-300' : 'border-slate-300 bg-white text-slate-600 shadow-2xs'
          }`}>
            Ctrl+K
          </kbd>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Glass Intensity Slider */}
          <div className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-2xs ${
            isDark ? 'bg-black/40 border-white/10 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-700'
          }`}>
            <SlidersHorizontal className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            <span className={`text-[11px] font-mono font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Glass {glassIntensity}%
            </span>
            <input 
              type="range" 
              min="20" 
              max="100" 
              step="5"
              value={glassIntensity}
              onChange={(e) => setGlassIntensity(Number(e.target.value))}
              className={`w-16 h-1.5 cursor-pointer rounded-lg ${isDark ? 'accent-cyan-400 bg-slate-700' : 'accent-blue-600 bg-slate-300'}`}
              title={`Adjust Liquid Glass Blur & Opacity (${glassIntensity}%)`}
            />
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
              isDark 
                ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200' 
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-2xs'
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode (Liquid Glass UI)"}
            aria-label="Toggle Dark and Light Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {/* 3D Humanoid Robot Guide Toggle */}
          {onToggleRobotGuide && (
            <button
              onClick={onToggleRobotGuide}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                robotGuideOpen
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-950 font-extrabold'
                  : isDark 
                    ? 'bg-white/5 text-cyan-300 border-white/10 hover:bg-white/10'
                    : 'bg-slate-100 text-blue-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Toggle 3D Animated Humanoid Robot Guide"
            >
              <RobotEyesIcon className="w-5 h-3" />
              <span className="hidden sm:inline">3D Robot</span>
            </button>
          )}

          {/* Demo Guide Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              demoMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs font-extrabold'
                : isDark
                  ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Toggle SIH Presentation Walkthrough Banner"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tour Flow</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-cyan-400/40 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-950 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-white" />
            <span className="hidden sm:inline font-bold">Ask AI</span>
          </button>
        </div>

      </div>

    </header>
  );
};

export default Header;
