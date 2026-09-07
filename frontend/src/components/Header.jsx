import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  SlidersHorizontal,
  Landmark,
  MapPin,
  User,
  LogOut,
  LogIn,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { RobotEyesIcon } from './RobotGuide';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  "All India",
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman And Nicobar Islands",
  "Chandigarh", "Dadra And Nagar Haveli", "Delhi", "Jammu And Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

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
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark, glassIntensity, setGlassIntensity } = useTheme();
  const { 
    user, 
    userRole, 
    selectedHouse, 
    setSelectedHouse, 
    selectedState, 
    setSelectedState, 
    logout, 
    isAuthenticated 
  } = useAuth();
  const [pipelineHealthy, setPipelineHealthy] = useState(null);

  useEffect(() => {
    let interval;
    const checkHealth = () => {
      api.getHealth()
        .then((res) => {
          setPipelineHealthy(res.status === 'healthy');
        })
        .catch(() => {
          setPipelineHealthy(false);
        });
    };
    checkHealth();
    interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
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
          
          {/* User Auth & Portfolio Quick Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/portfolio"
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Landmark className="w-3 h-3" />
              <span>Opening Portfolio</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  userRole === 'admin' 
                    ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                    : userRole === 'employee'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {userRole === 'admin' ? '👑 Admin' : userRole === 'employee' ? '🏛️ Employee' : `👤 Citizen (${user?.state || 'Public'})`}
                </span>
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-0.5 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link
                to="/portfolio"
                className="text-amber-400 hover:text-amber-300 text-[10px] font-medium flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left Branding */}
        <div className="flex items-center gap-3 shrink-0">
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

        {/* Center: Parliamentary House Switcher + State Scoping Selector */}
        <div className="hidden xl:flex items-center gap-2">
          {/* House Switcher */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100/90 border-slate-200'
          }`}>
            <button
              onClick={() => setSelectedHouse('All')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedHouse === 'All'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Houses
            </button>
            <button
              onClick={() => setSelectedHouse('Lok Sabha')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                selectedHouse === 'Lok Sabha'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Lok Sabha</span>
              <span className="text-[10px] opacity-75 font-mono">(543)</span>
            </button>
            <button
              onClick={() => setSelectedHouse('Rajya Sabha')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                selectedHouse === 'Rajya Sabha'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Rajya Sabha</span>
              <span className="text-[10px] opacity-75 font-mono">(231)</span>
            </button>
          </div>

          {/* State Selector */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
            isDark ? 'bg-black/40 border-white/10 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-700'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedState === 'All' ? 'All India' : selectedState}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedState(val === 'All India' ? 'All' : val);
              }}
              className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              title="Filter by State (Scoped Public View)"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className={`hidden md:flex items-center justify-between gap-3 px-3.5 py-1.5 border rounded-xl text-xs w-56 max-w-xs transition-all group cursor-pointer ${
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
              Search works, MPs...
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
          <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-2xs ${
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
              className={`w-14 h-1.5 cursor-pointer rounded-lg ${isDark ? 'accent-cyan-400 bg-slate-700' : 'accent-blue-600 bg-slate-300'}`}
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
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark and Light Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Dark</span>
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
