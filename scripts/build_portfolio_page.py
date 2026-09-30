import sys

content = """import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  ShieldCheck, 
  Building2, 
  Landmark, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  UserCheck, 
  UserPlus, 
  LogIn, 
  ExternalLink, 
  Search, 
  TrendingUp, 
  IndianRupee, 
  Eye, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  FileCheck,
  X,
  Compass,
  Activity,
  Zap,
  Target,
  FileText,
  Binary,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { api } from '../services/api';
import ThreeIndiaMap from '../components/ThreeIndiaMap';
import ErrorBoundary from '../components/ErrorBoundary';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman And Nicobar Islands",
  "Chandigarh", "Dadra And Nagar Haveli", "Delhi", "Jammu And Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

export const PortfolioPage = ({ onEnterApp }) => {
  const navigate = useNavigate();
  const { login, register, setGuestMode, isAuthenticated, user } = useAuth();

  // Auth Dialog Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    username: '',
    phoneNumber: '',
    mailid: '',
    password: '',
    confirmPassword: '',
    state: 'Tamil Nadu'
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Chrome Notifications state
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [recentNotifs, setRecentNotifs] = useState([]);

  // GSAP Scroll Velocity & 3D Tilt Ref
  const pageContainerRef = useRef(null);
  const [scrollTilt, setScrollTilt] = useState(0);

  useEffect(() => {
    // 1. Listen to notifications
    const unsub = notificationService.subscribe((item) => {
      setRecentNotifs(prev => [item, ...prev].slice(0, 4));
    });

    // 2. GSAP Split-Text Reveal Animation on Mount
    const headings = document.querySelectorAll('.gsap-reveal');
    headings.forEach((el, idx) => {
      gsap.fromTo(el, 
        { y: 30, opacity: 0, clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)' },
        { 
          y: 0, 
          opacity: 1, 
          clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)', 
          duration: 1.0, 
          delay: idx * 0.12, 
          ease: 'power3.out' 
        }
      );
    });

    // 3. Inertial Scroll Velocity Listener for Perspective 3D Flip/Tilt
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let animFrame;

    const handleScrollVelocity = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const deltaY = currentScrollY - lastScrollY;
      const deltaTime = Math.max(1, currentTime - lastTime);

      const velocity = deltaY / deltaTime; // pixels per ms
      const targetTilt = Math.max(-5, Math.min(5, velocity * 2.5));
      setScrollTilt(targetTilt);

      lastScrollY = currentScrollY;
      lastTime = currentTime;
    };

    window.addEventListener('scroll', handleScrollVelocity, { passive: true });

    return () => {
      unsub();
      window.removeEventListener('scroll', handleScrollVelocity);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, []);

  const handleEnterApp = (targetUrl = '/') => {
    if (onEnterApp) onEnterApp();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mplad_has_entered', 'true');
    }
    navigate(targetUrl);
  };

  const handleRequestChromeNotifs = async () => {
    const res = await notificationService.requestPermission();
    if (res.granted) {
      setNotifPermission('granted');
      notificationService.triggerPreLoginAuditNews();
    } else {
      setNotifPermission('denied');
      notificationService.triggerPreLoginAuditNews();
    }
  };

  const handleOpenAuthModal = (tab = 'login') => {
    setAuthTab(tab);
    setLoginError('');
    setRegError('');
    setRegSuccess('');
    setAuthModalOpen(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier || !loginPassword) {
      setLoginError('Please enter username/email and password.');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginIdentifier, loginPassword);
      setAuthModalOpen(false);
      handleEnterApp('/');
    } catch (err) {
      setLoginError(err.message || 'Authentication failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regForm.password.length < 5) {
      setRegError('Password must be at least 5 characters.');
      return;
    }

    setRegLoading(true);
    try {
      await register(regForm);
      setRegSuccess(`Registration successful! Admin notified at admin777444555@gmail.com. Entering dashboard...`);
      setTimeout(() => {
        setAuthModalOpen(false);
        handleEnterApp('/');
      }, 1200);
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const fillQuickLogin = (userType) => {
    if (userType === 'admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin@123K');
    } else if (userType === 'employee') {
      setLoginIdentifier('emplo');
      setLoginPassword('emplo@123K');
    }
  };

  const handleGuestEnter = () => {
    setGuestMode();
    handleEnterApp('/');
  };

  return (
    <div 
      ref={pageContainerRef} 
      className="min-h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-rose-600 selection:text-white relative overflow-x-hidden"
    >
      
      {/* Top Official Government Strip */}
      <div className="bg-[#090e18]/90 border-b border-white/10 px-4 py-2 text-xs text-slate-400 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/logo.jpg" 
              alt="MoSPI Logo" 
              className="w-6 h-6 rounded-lg object-contain border border-amber-500/40 p-0.5 bg-black/60 shadow-xs"
            />
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-200 tracking-tight font-mono">
              MoSPI • Smart India Hackathon (SIH26102)
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">Government of India</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
              QUANTUM AI OVERSIGHT ACTIVE
            </span>
            {isAuthenticated ? (
              <button
                onClick={() => handleEnterApp('/')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer font-mono"
              >
                Go to Dashboard ({user?.username}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleOpenAuthModal('login')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline font-mono"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => handleOpenAuthModal('register')}
                  className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline font-mono"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={handleGuestEnter}
                  className="text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer font-medium hover:underline font-mono"
                >
                  Guest Access <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: QUANTUM NANOTECH DOT MATRIX & ACTION GATEWAY             */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#080c14] via-[#0b101d] to-[#080c14] pt-8 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-950/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Mission Description & Button Links */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="gsap-reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                Quantum Nanotechnology & Anomaly Intelligence
              </div>

              <div className="flex items-center gap-3.5">
                <img 
                  src="/assets/logo.jpg" 
                  alt="MPLAD AI" 
                  className="w-14 h-14 rounded-2xl object-contain border-2 border-amber-500/50 p-1 bg-black/60 shadow-xl shadow-amber-950/50 shrink-0"
                />
                <div>
                  <h1 className="gsap-reveal text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight font-mono">
                    MPLAD AI RISK & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-cyan-400">
                      QUANTUM INTELLIGENCE
                    </span>
                  </h1>
                </div>
              </div>

              <p className="gsap-reveal text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Multi-dimensional parliamentary expenditure monitoring and fraud anomaly detection for the 
                Members of Parliament Local Area Development Scheme. Real-time bicameral governance 
                spanning <strong className="text-amber-400 font-mono">Lok Sabha (543 MPs)</strong> and <strong className="text-cyan-400 font-mono">Rajya Sabha (231 MPs)</strong>.
              </p>

              {/* BUTTON-BASED LINKS (Direct Entrance & Auth Launchers) */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-2xl space-y-3 backdrop-blur-xl">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Application Gateways:</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenAuthModal('login')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer group font-mono"
                  >
                    <LogIn className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>Officer & Admin Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAuthModal('register')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer group font-mono"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span>Citizen Registration</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={handleGuestEnter}
                    className="text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer hover:underline"
                  >
                    <span>🌐 Explore Application as Guest</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Scoped by State & House
                  </span>
                </div>
              </div>

              {/* Chrome Web Desktop Notifications Banner (Image 3 Logo) */}
              <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-black/60 border border-rose-800/40 p-3.5 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/assets/logo.jpg" 
                      alt="Alert Logo" 
                      className="w-9 h-9 rounded-xl object-contain border border-amber-500/40 p-0.5 bg-black/60 shrink-0 shadow-xs"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 font-mono">
                        Chrome Browser Live Alerts
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded">
                          NANO FEED
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Receive desktop alerts for cost deviations and ghost completion anomalies.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRequestChromeNotifs}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-mono"
                  >
                    <Bell className="w-3.5 h-3.5 animate-bounce" />
                    {notifPermission === 'granted' ? 'Trigger Live Alert' : 'Enable Chrome Alerts'}
                  </button>
                </div>

                {recentNotifs.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-rose-800/40 space-y-1.5">
                    <div className="text-[10px] font-mono text-rose-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Dispatched Notifications:
                    </div>
                    {recentNotifs.map((n) => (
                      <div key={n.id} className="text-[11px] bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 flex items-center justify-between gap-2 font-mono">
                        <span className="font-medium text-slate-200 truncate">{n.title}</span>
                        <span className="text-[9px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* National Scheme Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <IndianRupee className="w-3 h-3 text-emerald-400" /> Monitored
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5 font-mono">₹1,16,767 Cr</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Nationwide</div>
                </div>

                <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-cyan-400" /> Parliament
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5 font-mono">774 MPs</div>
                  <div className="text-[10px] text-cyan-400 font-mono">543 LS + 231 RS</div>
                </div>

                <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Layers className="w-3 h-3 text-rose-400" /> Total Works
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5 font-mono">1,26,582</div>
                  <div className="text-[10px] text-rose-400 font-mono">36 States / UTs</div>
                </div>

                <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-amber-400" /> AI Engine
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5 font-mono">Iso Forest</div>
                  <div className="text-[10px] text-amber-400 font-mono">4-Tier Scoring</div>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Quantum Nanotech India Map Showcase */}
            <div className="lg:col-span-6 h-[500px] sm:h-[560px] lg:h-[620px]">
              <ErrorBoundary fallback={<div className="h-full flex items-center justify-center bg-black/60 rounded-3xl border border-white/10 text-slate-400 text-sm font-mono">Nanotech Map Loading...</div>}>
                <ThreeIndiaMap onSelectState={(st) => handleEnterApp(`/?state=${encodeURIComponent(st)}`)} />
              </ErrorBoundary>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BICAMERAL PARLIAMENTARY DIVISION: LOK SABHA VS RAJYA SABHA             */}
      {/* ========================================================================= */}
      <section 
        style={{ transform: `perspective(1000px) rotateX(${scrollTilt * 0.4}deg)` }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 transition-transform duration-300 ease-out"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="gsap-reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-rose-400 text-xs font-mono font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-rose-400" />
            PARLIAMENTARY DATA STRUCTURE
          </div>
          <h2 className="gsap-reveal text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Bicameral Division: Lok Sabha vs. Rajya Sabha
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 font-mono">
            Ingested from official MoSPI schemas across 36 State & UT nodes with point-level algorithmic risk grading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lok Sabha Card */}
          <div className="bg-[#0b101d]/90 border border-amber-500/30 hover:border-amber-400 rounded-3xl p-7 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 font-bold text-lg font-mono">
                  LS
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Lok Sabha (House of the People)</h3>
                  <p className="text-xs text-slate-400">Direct Constituency Representation (543 Seats)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono font-bold">
                543 MPs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400">Allocation</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">₹81,949 Cr</div>
              </div>
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400">Expenditure</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">₹27,759 Cr</div>
              </div>
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400">Total Works</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">88,849</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 font-mono">Prioritized Project Tiers:</div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-red-950/50 border border-red-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-red-400">3</div>
                  <div className="text-[10px] text-red-300 font-semibold uppercase">Critical</div>
                </div>
                <div className="bg-orange-950/50 border border-orange-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-orange-400">4</div>
                  <div className="text-[10px] text-orange-300 font-semibold uppercase">High</div>
                </div>
                <div className="bg-amber-950/50 border border-amber-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-amber-400">624</div>
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">Medium</div>
                </div>
                <div className="bg-emerald-950/50 border border-emerald-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-emerald-400">88,218</div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase">Low</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleEnterApp('/?house=Lok%20Sabha')}
              className="mt-6 w-full py-3 bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Explore Lok Sabha Data & Projects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rajya Sabha Card */}
          <div className="bg-[#0b101d]/90 border border-cyan-500/30 hover:border-cyan-400 rounded-3xl p-7 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono">
                  RS
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">Rajya Sabha (Council of States)</h3>
                  <p className="text-xs text-slate-400">State-Level Representation (231 Seats)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono font-bold">
                231 MPs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400">Allocation</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">₹34,818 Cr</div>
              </div>
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400">Expenditure</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">₹11,839 Cr</div>
              </div>
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10">
                <div className="text-[10px] text-slate-400">Total Works</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">37,733</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 font-mono">Prioritized Project Tiers:</div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-red-950/50 border border-red-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-red-400">5</div>
                  <div className="text-[10px] text-red-300 font-semibold uppercase">Critical</div>
                </div>
                <div className="bg-orange-950/50 border border-orange-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-orange-400">29</div>
                  <div className="text-[10px] text-orange-300 font-semibold uppercase">High</div>
                </div>
                <div className="bg-amber-950/50 border border-amber-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-amber-400">263</div>
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">Medium</div>
                </div>
                <div className="bg-emerald-950/50 border border-emerald-800/60 p-2.5 rounded-xl">
                  <div className="text-xs font-bold text-emerald-400">37,436</div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase">Low</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleEnterApp('/?house=Rajya%20Sabha')}
              className="mt-6 w-full py-3 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Explore Rajya Sabha Data & Projects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FLAGGED HIGH-RISK CASE STUDY DOSSIER: PROJECT #80673 (AMRITSAR, PUNJAB) */}
      {/* ========================================================================= */}
      <section 
        style={{ transform: `perspective(1000px) rotateX(${scrollTilt * 0.3}deg)` }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-transform duration-300 ease-out"
      >
        <div className="p-8 rounded-3xl bg-gradient-to-r from-red-950/40 via-black/80 to-[#0b101d] border-2 border-red-600/50 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-red-500/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-950/60">
                <AlertTriangle className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  CRITICAL ANOMALY ALERT • PUNJAB CLUSTER
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  Flagged Work #80673: +100% Cost Escalation
                </h3>
              </div>
            </div>

            <button
              onClick={() => handleEnterApp('/project/80673')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs font-mono transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Inspect Full Forensic Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1">
              <div className="text-slate-400">Sanctioned Amount</div>
              <div className="text-lg font-bold text-white">₹5,00,000</div>
              <div className="text-[10px] text-slate-500">Administrative Ceiling</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-red-500/40 space-y-1">
              <div className="text-red-300 font-bold">Final Expenditure</div>
              <div className="text-lg font-bold text-red-400">₹10,00,000</div>
              <div className="text-[10px] text-red-400 font-bold">+100.0% Cost Deviation</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1">
              <div className="text-slate-400">Location & MP</div>
              <div className="text-sm font-bold text-white truncate">Amritsar, Punjab</div>
              <div className="text-[10px] text-slate-400 truncate">Gurjeet Singh Aujla</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1">
              <div className="text-slate-400">Algorithmic Risk Score</div>
              <div className="text-lg font-bold text-rose-400">55.0 / 100</div>
              <div className="text-[10px] text-rose-400">Isolation Forest Flagged</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MULTI-TIER AI RISK SCORING ARCHITECTURE (ATOMIC WEIGHTS)               */}
      {/* ========================================================================= */}
      <section 
        style={{ transform: `perspective(1000px) rotateX(${scrollTilt * 0.3}deg)` }}
        className="bg-black/40 border-t border-white/10 py-20 transition-transform duration-300 ease-out"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="gsap-reveal inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold mb-3">
              <Binary className="w-3.5 h-3.5 text-rose-400" />
              ALGORITHMIC FRAUD DETECTION ENGINE
            </div>
            <h2 className="gsap-reveal text-2xl sm:text-4xl font-extrabold text-white font-mono">
              Multi-Vector Risk Scoring Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Every parliamentary work is evaluated across 5 core audit vectors with point-level explainability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
            
            <div className="bg-[#0b101d] border border-red-500/30 p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 font-bold">
                1
              </div>
              <h3 className="font-bold text-white text-sm">Cost Escalation Vector</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Detects final expenditures exceeding administrative sanctions (+25% to +100%+), flagging unauthorized budget inflation.
              </p>
              <div className="text-[11px] text-red-400 font-bold">Max Weight: 30 Points</div>
            </div>

            <div className="bg-[#0b101d] border border-amber-500/30 p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-bold">
                2
              </div>
              <h3 className="font-bold text-white text-sm">Completion Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Identifies ghost works and unverified completions where funds are disbursed without geo-tagged physical photo audits.
              </p>
              <div className="text-[11px] text-amber-400 font-bold">Max Weight: 25 Points</div>
            </div>

            <div className="bg-[#0b101d] border border-cyan-500/30 p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold">
                3
              </div>
              <h3 className="font-bold text-white text-sm">Payment Burst Density</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Flags repetitive transactions, duplicate contractor signatures, and rapid voucher disbursements before fiscal year ends.
              </p>
              <div className="text-[11px] text-cyan-400 font-bold">Max Weight: 20 Points</div>
            </div>

            <div className="bg-[#0b101d] border border-rose-500/30 p-6 rounded-2xl space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 font-bold">
                4
              </div>
              <h3 className="font-bold text-white text-sm">Isolation Forest ML</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Unsupervised anomaly detection trained across multidimensional vectors to catch non-linear corruption signatures.
              </p>
              <div className="text-[11px] text-rose-400 font-bold">ML Boost: +8 Points</div>
            </div>

          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => handleEnterApp('/')}
              className="px-9 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl hover:shadow-rose-600/30 inline-flex items-center gap-2 cursor-pointer font-mono"
            >
              Enter Live Anomaly Intelligence Platform <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TECHNOLOGICAL WHITEPAPER & DATA INGESTION PIPELINE                      */}
      {/* ========================================================================= */}
      <section 
        style={{ transform: `perspective(1000px) rotateX(${scrollTilt * 0.2}deg)` }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 transition-transform duration-300 ease-out"
      >
        <div className="p-8 sm:p-10 rounded-3xl bg-[#090e18] border border-white/10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                ARCHITECTURE WHITEPAPER
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white font-mono mt-1">
                Real-Time Parliamentary Oversight Pipeline
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
              v2.4 Production Spec
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> 01. Ingestion Layer
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Ingests parliamentary spreadsheets spanning 1,26,582 records. Normalizes constituency IDs, transaction dates, and sanctioned budgets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> 02. Inference Engine
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Evaluates cost inflation indices, completion photo signatures, and executes Isolation Forest unsupervised anomaly grading.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 03. Executive Audit Feed
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Dispatches real-time Chrome desktop notifications and alerts administrators via email (admin777444555@gmail.com).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-white/10 py-10 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/assets/logo.jpg" 
              alt="Logo" 
              className="w-7 h-7 rounded-lg object-contain border border-amber-500/40 p-0.5 bg-black/60"
            />
            <span className="text-slate-300 font-bold">MPLAD AI Risk & Anomaly Intelligence System</span>
          </div>
          <p className="text-slate-400 font-medium">
            Smart India Hackathon • Problem Statement SIH26102 (MoSPI)
          </p>
          <p>
            Developed for Ministry of Statistics and Programme Implementation • Government of India
          </p>
          <p className="text-[11px] text-slate-600 pt-2">
            Default Admin: <span className="text-slate-400">admin / admin@123K</span> • 
            Default Employee: <span className="text-slate-400">emplo / emplo@123K</span> • 
            Admin Alerts: <span className="text-slate-400">admin777444555@gmail.com</span>
          </p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* AUTHENTICATION DIALOG MODAL                                              */}
      {/* ========================================================================= */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0b101d] border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-7 text-left my-8">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/logo.jpg" 
                  alt="Logo" 
                  className="w-10 h-10 rounded-xl object-contain border border-amber-500/40 p-0.5 bg-black/60 shadow-xs"
                />
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono">
                    Parliamentary Intelligence Access
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {authTab === 'login' ? 'Officer & Public Portal Sign In' : 'Citizen Auditor Registration'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex rounded-xl bg-black/60 p-1 mb-5 border border-white/10 font-mono">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setLoginError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Officer Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('register'); setRegError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Citizen Registration
              </button>
            </div>

            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                    Username or Email ID
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. admin or emplo"
                      className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  {loginLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In & Enter Intelligence Portal
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-white/10 font-mono">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Demo Credentials (1-Click Fill)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fillQuickLogin('admin')}
                      className="p-2.5 rounded-xl bg-black/60 hover:bg-slate-800/80 border border-white/10 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                        ⚡ Admin Role
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">admin / admin@123K</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillQuickLogin('employee')}
                      className="p-2.5 rounded-xl bg-black/60 hover:bg-slate-800/80 border border-white/10 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                        ⚡ Employee Role
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">emplo / emplo@123K</div>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2 font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalOpen(false);
                      handleGuestEnter();
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                  >
                    Or continue as Public Guest (View Only)
                  </button>
                </div>
              </form>
            )}

            {authTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({...regForm, username: e.target.value})}
                      placeholder="citizen_audit"
                      className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phoneNumber}
                      onChange={(e) => setRegForm({...regForm, phoneNumber: e.target.value})}
                      placeholder="+91-9876543210"
                      className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.mailid}
                    onChange={(e) => setRegForm({...regForm, mailid: e.target.value})}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regForm.password}
                      onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                      placeholder="Min 5 chars"
                      className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                      placeholder="Re-enter"
                      className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Select Your State (Default Scope)</span>
                    <span className="text-[10px] text-cyan-400 font-normal">Switchable</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <select
                      value={regForm.state}
                      onChange={(e) => setRegForm({...regForm, state: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 font-sans">
                  <div className="font-semibold flex items-center gap-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    Automated Admin Email Alert Dispatched
                  </div>
                  <div className="text-slate-300 text-[10px] mt-0.5">
                    On submission, an alert is sent to <strong className="text-white font-mono">admin777444555@gmail.com</strong>.
                  </div>
                </div>

                {regError && (
                  <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  {regLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register as Citizen Auditor
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default PortfolioPage;
"""

with open('frontend/src/pages/PortfolioPage.jsx', 'w') as f:
    f.write(content)

print("Successfully wrote updated extended PortfolioPage.jsx!")
