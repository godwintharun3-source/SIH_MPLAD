import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Clock, 
  FolderKanban, 
  ShieldAlert, 
  Layers, 
  Users, 
  MapPin, 
  FileText, 
  Database,
  Bot,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Target,
  AppWindow,
  HardDrive,
  Sun,
  Moon,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { RobotEyesIcon } from './RobotGuide';
import { useTheme } from '../context/ThemeContext';

export const Sidebar = ({ 
  isOpen, 
  isCollapsed, 
  onToggleCollapse, 
  onOpenAI, 
  onOpenRobotGuide,
  onCloseMobile 
}) => {
  const { isDark, toggleTheme, glassIntensity, setGlassIntensity } = useTheme();

  const quickAccessItems = [
    { to: '/', label: 'Overview Dashboard', icon: Clock, badge: 'Live' },
    { to: '/high-risk', label: 'Priority Review Queue', icon: ShieldAlert, badge: '8 Critical', badgeColor: 'bg-red-950/80 text-red-300 border-red-800/80' },
  ];

  const favouriteItems = [
    { to: '/project/80673', label: 'Flagged Work #80673', icon: Target, badge: 'Punjab' },
    { to: '/anomalies', label: 'Anomaly Center', icon: Layers, badge: null },
    { to: '/mps', label: 'MP & Constituency', icon: Users, badge: null },
    { to: '/states', label: 'State Regional Matrix', icon: MapPin, badge: null },
  ];

  const intelligenceItems = [
    { to: '/reports', label: 'Inspection Dossiers', icon: FileText, badge: null },
    { to: '/transparency', label: 'Data & Methodology', icon: Database, badge: '100%' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden"
        />
      )}

      {/* Mobile Slide-Over Drawer (macOS Dark Glass Style) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 m-2 rounded-3xl bg-[#0c1017]/90 backdrop-blur-2xl text-slate-200 border border-white/10 shadow-2xl transition-transform duration-200 ease-in-out flex flex-col justify-between lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* macOS Traffic Lights Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs" />
            </div>
            <button
              onClick={onCloseMobile}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
            >
              Done
            </button>
          </div>

          {/* Quick Access */}
          <div className="space-y-1">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 font-bold shadow-xs'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Favourites Section */}
          <div className="pt-2">
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wider">
              Favourites
            </p>
            <div className="space-y-1">
              {favouriteItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Locations & Intelligence Section */}
          <div className="pt-2">
            <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wider">
              Locations & Audit
            </p>
            <div className="space-y-1">
              {intelligenceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {onOpenRobotGuide && (
            <button
              onClick={() => {
                onCloseMobile();
                onOpenRobotGuide();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-200"
            >
              <RobotEyesIcon className="w-5 h-3" />
              <span>3D Robot Guide</span>
            </button>
          )}

          <button
            onClick={() => {
              onCloseMobile();
              if (onOpenAI) onOpenAI();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ask MoSPI AI</span>
          </button>
        </div>
      </div>

      {/* Desktop macOS-style Dark/Light Floating Menu Bar with Blurring Effect */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 h-full rounded-2xl backdrop-blur-2xl transition-all duration-300 ease-in-out overflow-hidden theme-sidebar ${
          isDark 
            ? 'bg-[#0c1017]/90 border border-white/10 shadow-2xl shadow-black/80 text-slate-200' 
            : 'bg-white/95 border border-slate-200/90 shadow-lg shadow-slate-200/40 text-slate-800'
        } ${isCollapsed ? 'w-18' : 'w-64'}`}
      >
        {/* Top Header Bar */}
        <div className={`px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400 animate-pulse" />
            {!isCollapsed && (
              <span className={`text-[11px] font-bold tracking-wider font-mono uppercase ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}>
                MoSPI Navigator
              </span>
            )}
          </div>

          {!isCollapsed && (
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
              isDark ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              v2.4
            </span>
          )}
        </div>

        {/* Consolidated Native Search in Navigation (Tab Overhaul) */}
        {!isCollapsed && (
          <div className="px-2.5 pt-2 pb-1">
            <div className="relative group">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Spotlight search... (⌘K)"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-white/10 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div className="p-2.5 space-y-3 overflow-y-auto flex-1">
          
          {/* 1. Quick Access / Recents */}
          <div className="space-y-0.5">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold dark:bg-blue-600/35 dark:text-blue-200 dark:border dark:border-blue-500/40'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors" />
                  
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${item.badgeColor || 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* 2. Favourites (matching macOS image section) */}
          <div>
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Favourites
              </p>
            )}
            <div className="space-y-0.5">
              {favouriteItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold dark:bg-blue-600/35 dark:text-blue-200 dark:border dark:border-blue-500/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors" />
                    
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* 3. Locations & Systems (matching macOS image section) */}
          <div>
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Locations & Audit
              </p>
            )}
            <div className="space-y-0.5">
              {intelligenceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold dark:bg-blue-600/35 dark:text-blue-200 dark:border dark:border-blue-500/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white transition-colors" />
                    
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Dock: 3D Robot Guide + Assistant + Collapse Trigger */}
        <div className="p-2.5 border-t border-white/10 space-y-1.5">
          
          {/* 3D Robot Guide Trigger */}
          {onOpenRobotGuide && (
            <button
              onClick={onOpenRobotGuide}
              className={`w-full flex items-center gap-2.5 px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-200 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Activate 3D Humanoid Robot Guide"
            >
              <RobotEyesIcon className="w-5 h-3 shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="truncate">3D Robot Guide</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-900 text-cyan-300">
                    Active
                  </span>
                </div>
              )}
            </button>
          )}

          {/* AI Decision Assistant Button */}
          <button
            onClick={onOpenAI}
            className={`w-full flex items-center gap-2.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Ask MoSPI Intelligence Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Ask AI Assistant</span>}
          </button>

          {/* Liquid Glass Intensity Slider (Apple 2027 Liquid Glass Control) */}
          {!isCollapsed && (
            <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Glass Intensity</span>
                </div>
                <span className="font-mono text-[10px] text-blue-600 dark:text-cyan-400 font-bold">{glassIntensity}%</span>
              </div>
              <input 
                type="range"
                min="20"
                max="100"
                step="5"
                value={glassIntensity}
                onChange={(e) => setGlassIntensity(Number(e.target.value))}
                className="w-full h-1.5 accent-blue-600 dark:accent-cyan-400 cursor-pointer rounded-lg bg-slate-300 dark:bg-slate-700"
                title={`Adjust Liquid Glass Blur & Opacity (${glassIntensity}%)`}
              />
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              isDark 
                ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/40 text-cyan-200 shadow-xs' 
                : 'bg-white/80 hover:bg-white border-slate-200 text-slate-800 shadow-xs'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode (Liquid Glass UI)"}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                {!isCollapsed && <span className="truncate">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600 shrink-0" />
                {!isCollapsed && <span className="truncate">Dark Mode (Glass)</span>}
              </>
            )}
          </button>

          {/* Collapse Toggle Pill */}
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
            title={isCollapsed ? "Expand Menu Bar" : "Collapse Menu Bar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Collapse Menu</span>
              </div>
            )}
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
