import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DemoBanner from './components/DemoBanner';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import GlobalSearchModal from './components/GlobalSearchModal';
import RobotGuide from './components/RobotGuide';
import ErrorBoundary from './components/ErrorBoundary';
import { useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import PortfolioPage from './pages/PortfolioPage';
import DashboardPage from './pages/DashboardPage';
import HighRiskProjectsPage from './pages/HighRiskProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MPAnalyticsPage from './pages/MPAnalyticsPage';
import StateAnalyticsPage from './pages/StateAnalyticsPage';
import AnomaliesPage from './pages/AnomaliesPage';
import ReportsPage from './pages/ReportsPage';
import TransparencyPage from './pages/TransparencyPage';

function AppContent() {
  const { isDark } = useTheme();
  const location = useLocation();
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

  const { isAuthenticated } = useAuth();
  const [hasEnteredApp, setHasEnteredApp] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mplad_has_entered') === 'true';
    }
    return false;
  });

  // Dedicated view for the Opening Portfolio Page or initial pre-login entry flow
  if (location.pathname === '/portfolio' || (!isAuthenticated && !hasEnteredApp && location.pathname === '/')) {
    return (
      <PortfolioPage 
        onEnterApp={() => {
          setHasEnteredApp(true);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('mplad_has_entered', 'true');
          }
        }} 
      />
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden theme-app-shell font-sans transition-colors duration-200 p-2.5 sm:p-3.5 gap-2.5 sm:gap-3.5 app-entry-popup ${
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

          {/* Main Scrollable Viewport (Scrolls independently with liquid glass transparency) */}
          <div className={`theme-viewport flex-1 overflow-y-auto min-w-0 flex flex-col justify-between h-full rounded-2xl border shadow-2xl transition-all duration-300 relative ${
            isDark 
              ? 'bg-[#0a0f1d]/75 backdrop-blur-3xl border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] text-white' 
              : 'bg-white/80 backdrop-blur-3xl border-white/90 shadow-[0_20px_50px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] text-slate-900'
          }`}>
            <div className="glass-sheen" />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
              <div key={location.pathname} className="route-stagger-container">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/high-risk" element={<HighRiskProjectsPage />} />
                  <Route path="/project/:id" element={<ProjectDetailPage />} />
                  <Route path="/mps" element={<MPAnalyticsPage />} />
                  <Route path="/states" element={<StateAnalyticsPage />} />
                  <Route path="/anomalies" element={<AnomaliesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/transparency" element={<TransparencyPage />} />
                </Routes>
              </div>
            </main>

            {/* Official Footer */}
            <footer className="no-print bg-slate-200/40 dark:bg-slate-950/60 backdrop-blur-xl text-slate-600 dark:text-slate-400 text-xs border-t border-slate-300/40 dark:border-white/10 py-6 mt-12 shrink-0 rounded-b-2xl">
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
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
