import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DemoBanner from './components/DemoBanner';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import GlobalSearchModal from './components/GlobalSearchModal';
import RobotGuide from './components/RobotGuide';
import ErrorBoundary from './components/ErrorBoundary';
import { useTheme } from './context/ThemeContext';

import DashboardPage from './pages/DashboardPage';
import HighRiskProjectsPage from './pages/HighRiskProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MPAnalyticsPage from './pages/MPAnalyticsPage';
import StateAnalyticsPage from './pages/StateAnalyticsPage';
import AnomaliesPage from './pages/AnomaliesPage';
import ReportsPage from './pages/ReportsPage';
import TransparencyPage from './pages/TransparencyPage';

export function App() {
  const { isDark } = useTheme();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiContextProject, setAiContextProject] = useState(null);
  const [aiInitialQuery, setAiInitialQuery] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [demoStep, setDemoStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse
  
  // 3D Animated Humanoid Robot Guide state
  const [robotGuideOpen, setRobotGuideOpen] = useState(true);

  useEffect(() => {
    const handleContextAI = (e) => {
      if (e.detail) {
        setAiContextProject(e.detail.contextProjectId || null);
        setAiInitialQuery(e.detail.query || null);
        setIsAIOpen(true);
      }
    };
    window.addEventListener('open-ai-context', handleContextAI);
    return () => window.removeEventListener('open-ai-context', handleContextAI);
  }, []);

  const handleOpenGeneralAI = () => {
    setAiContextProject(null);
    setAiInitialQuery(null);
    setIsAIOpen(true);
  };

  return (
    <Router>
      <div className={`h-screen flex flex-col overflow-hidden theme-app-shell font-sans transition-colors duration-200 p-2.5 sm:p-3.5 gap-2.5 sm:gap-3.5 ${
        isDark ? 'text-slate-100 selection:bg-cyan-500/30' : 'text-slate-900 selection:bg-blue-500/30'
      }`}>
        
        {/* Floating Curved Rectangle Boxy Top Menubar */}
        <div className="shrink-0 z-40 no-print">
          <Header 
            onOpenAI={handleOpenGeneralAI}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
            robotGuideOpen={robotGuideOpen}
            onToggleRobotGuide={() => setRobotGuideOpen(!robotGuideOpen)}
          />
        </div>

        {/* Demo Mode Guide Banner (Floating Curved Rectangle Island under Header) */}
        {demoMode && (
          <div className="shrink-0 z-30 no-print">
            <DemoBanner 
              currentStep={demoStep}
              setStep={setDemoStep}
              onOpenAI={handleOpenGeneralAI}
            />
          </div>
        )}

        {/* App Main Body: Fixed Left macOS-style Sidebar + Scrollable Right Viewport with clean spacing */}
        <div className="flex-1 flex overflow-hidden w-full relative gap-2.5 sm:gap-3.5 min-h-0">
          
          {/* macOS-style Dark/Light Blurred Menu Bar */}
          <div className="no-print shrink-0 h-full flex flex-col">
            <Sidebar
              isOpen={sidebarOpen}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onOpenAI={handleOpenGeneralAI}
              onOpenRobotGuide={() => setRobotGuideOpen(true)}
              onCloseMobile={() => setSidebarOpen(false)}
            />
          </div>

          {/* Main Scrollable Viewport (Scrolls independently with clean spacing) */}
          <div className={`theme-viewport flex-1 overflow-y-auto min-w-0 flex flex-col justify-between h-full rounded-2xl border shadow-xl transition-all duration-200 ${
            isDark 
              ? 'bg-[#0b101d]/90 backdrop-blur-3xl border-white/10 shadow-black/80 text-white' 
              : 'bg-white/95 backdrop-blur-3xl border-slate-200/90 shadow-lg text-slate-900'
          }`}>
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/high-risk" element={<HighRiskProjectsPage />} />
                <Route path="/project/:id" element={<ProjectDetailPage />} />
                <Route path="/mps" element={<MPAnalyticsPage />} />
                <Route path="/states" element={<StateAnalyticsPage />} />
                <Route path="/anomalies" element={<AnomaliesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/transparency" element={<TransparencyPage />} />
              </Routes>
            </main>

            {/* Official Footer */}
            <footer className="no-print bg-slate-200/50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-300/60 dark:border-slate-800/80 py-6 mt-12 shrink-0 rounded-b-[28px]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    MPLAD AI Risk & Anomaly Intelligence System
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ministry of Statistics and Programme Implementation (MoSPI) • Government of India
                  </p>
                </div>
                <div className="text-center sm:text-right text-[11px] text-slate-500">
                  <p>Decision Support Platform • Validated Against Live Schemas</p>
                  <p className="text-cyan-400 font-mono">Smart India Hackathon (SIH26102)</p>
                </div>
              </div>
            </footer>
          </div>

        </div>

        {/* 3D Animated Humanoid Robot Guide Companion with Error Boundary */}
        <ErrorBoundary fallback={null}>
          <RobotGuide
            isTourActive={demoMode && robotGuideOpen}
            onToggleTour={() => {
              const next = !demoMode;
              setDemoMode(next);
              setRobotGuideOpen(next);
            }}
            onStartTour={() => {
              setDemoMode(true);
              setRobotGuideOpen(true);
            }}
          />
        </ErrorBoundary>

        {/* AI Assistant Drawer */}
        <AIAssistantDrawer 
          isOpen={isAIOpen}
          onClose={() => {
            setIsAIOpen(false);
            setAiContextProject(null);
            setAiInitialQuery(null);
          }}
          contextProjectId={aiContextProject}
          initialQuery={aiInitialQuery}
        />

        {/* Global Search Modal (Ctrl+K) */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

      </div>
    </Router>
  );
}

export default App;
