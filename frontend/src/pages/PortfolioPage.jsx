import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { api } from '../services/api';

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

export const PortfolioPage = () => {
  const navigate = useNavigate();
  const { login, register, setGuestMode, isAuthenticated, user } = useAuth();

  // Auth Card Tab
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
  const [notifTriggered, setNotifTriggered] = useState(false);

  // House Analytics summary state
  const [houseData, setHouseData] = useState(null);

  useEffect(() => {
    // Fetch live parliamentary comparison for portfolio
    api.getHouseAnalytics()
      .then(res => setHouseData(res))
      .catch(err => console.warn('House analytics error:', err));

    // Listen to notifications
    const unsub = notificationService.subscribe((item) => {
      setRecentNotifs(prev => [item, ...prev].slice(0, 4));
    });
    return () => unsub();
  }, []);

  const handleRequestChromeNotifs = async () => {
    const res = await notificationService.requestPermission();
    if (res.granted) {
      setNotifPermission('granted');
      setNotifTriggered(true);
      notificationService.triggerPreLoginAuditNews();
    } else {
      setNotifPermission('denied');
      // Still trigger in-app alert stream
      notificationService.triggerPreLoginAuditNews();
    }
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
      navigate('/');
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
      const res = await register(regForm);
      setRegSuccess(`Registration successful! Admin alerted at admin777444555@gmail.com. Redirecting to ${regForm.state} dashboard...`);
      setTimeout(() => {
        navigate('/');
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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Government Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">MoSPI & Smart India Hackathon</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">Ministry of Statistics and Programme Implementation</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-mono">
              SIH26102 • AI Intelligence Active
            </span>
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/')}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                Go to Dashboard ({user?.username}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleGuestEnter}
                className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                Guest Access <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Showcase */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Next-Gen National Infrastructure Intelligence
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                MPLAD AI Risk & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400">
                  Anomaly Intelligence
                </span> Platform
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Autonomous monitoring, fraud detection, and explainable audit intelligence for the 
                Members of Parliament Local Area Development Scheme. Real-time multi-dimensional 
                governance spanning <strong className="text-white">Lok Sabha (543)</strong> and <strong className="text-white">Rajya Sabha (231)</strong>.
              </p>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Monitored
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white mt-1">₹1,16,767 Cr</div>
                  <div className="text-[11px] text-emerald-400">Nationwide</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-blue-400" /> Parliament
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white mt-1">774 MPs</div>
                  <div className="text-[11px] text-blue-400">543 LS + 231 RS</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Works
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white mt-1">1,26,582</div>
                  <div className="text-[11px] text-indigo-400">36 States / UTs</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" /> AI Engine
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white mt-1">Isolation F.</div>
                  <div className="text-[11px] text-amber-400">4-Tier Risk Engine</div>
                </div>
              </div>

              {/* Chrome Browser Web Notifications Trigger Banner */}
              <div className="bg-gradient-to-r from-blue-950/90 via-indigo-950/70 to-slate-900 border border-blue-800/60 p-4 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
                      <Bell className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Chrome Browser Live News Alerts
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                          PRE-LOGIN ACTIVE
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Receive instant desktop Chrome notifications on critical project escalations & audit findings.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRequestChromeNotifs}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {notifPermission === 'granted' ? 'Trigger Chrome News Updates' : 'Enable Chrome News Alerts'}
                  </button>
                </div>

                {/* Notification Feed Preview */}
                {recentNotifs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-800/40 space-y-1.5">
                    <div className="text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dispatched Alert Feed:
                    </div>
                    {recentNotifs.map((n) => (
                      <div key={n.id} className="text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-200 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Embedded Login & Register Terminal */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 backdrop-blur-sm relative">
                
                {/* Tabs Switcher */}
                <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setAuthTab('login'); setLoginError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Officer & Public Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthTab('register'); setRegError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      authTab === 'register'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Public Registration
                  </button>
                </div>

                {/* LOGIN TAB */}
                {authTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Username or Email ID
                      </label>
                      <div className="relative">
                        <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. admin or citizen@gov.in"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loginLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          Sign In to Intelligence Portal
                        </>
                      )}
                    </button>

                    {/* Quick Demo Credentials Fillers */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Quick Demo Credentials (1-Click Fill)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => fillQuickLogin('admin')}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all cursor-pointer group"
                        >
                          <div className="text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                            ⚡ Admin Role
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">admin / admin@123K</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => fillQuickLogin('employee')}
                          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all cursor-pointer group"
                        >
                          <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                            ⚡ Employee Role
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">emplo / emplo@123K</div>
                        </button>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleGuestEnter}
                        className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                      >
                        Or continue as Public Guest (View Only)
                      </button>
                    </div>
                  </form>
                )}

                {/* REGISTER TAB (Public Citizen) */}
                {authTab === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
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
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                          placeholder="Min 5 characters"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                          placeholder="Re-enter password"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                        <span>Select Your State (Default Data Scope)</span>
                        <span className="text-[10px] text-blue-400 font-normal">Switchable anytime</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                        <select
                          value={regForm.state}
                          onChange={(e) => setRegForm({...regForm, state: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Email Notice Callout */}
                    <div className="p-2.5 rounded-lg bg-blue-950/50 border border-blue-800/40 text-[11px] text-blue-300">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        Automated Admin Email Alert
                      </div>
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        On submit, an alert is sent to <strong className="text-white">admin777444555@gmail.com</strong> with your registration details.
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
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
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

          </div>
        </div>
      </div>

      {/* Parliamentary Division Showcase (Lok Sabha vs Rajya Sabha) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Bicameral Parliamentary Monitoring
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Parliamentary Division: Lok Sabha vs. Rajya Sabha
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Ingested from official MoSPI records with full priority risk categorization (Critical, High, Medium, Low).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lok Sabha Card */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 font-bold text-lg">
                  LS
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Lok Sabha (House of the People)</h3>
                  <p className="text-xs text-slate-400">Direct Constituency Representation (543 Seats)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-semibold">
                543 MPs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Allocation</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">₹81,949 Cr</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Expenditure</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">₹27,759 Cr</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Works</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">88,849</div>
              </div>
            </div>

            {/* Risk Distribution for LS */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Prioritized Project Tiers:</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-red-950/50 border border-red-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-red-400">3</div>
                  <div className="text-[10px] text-red-300 font-semibold uppercase">Critical</div>
                </div>
                <div className="bg-orange-950/50 border border-orange-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-orange-400">4</div>
                  <div className="text-[10px] text-orange-300 font-semibold uppercase">High</div>
                </div>
                <div className="bg-amber-950/50 border border-amber-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-amber-400">624</div>
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">Medium</div>
                </div>
                <div className="bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-emerald-400">88,218</div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase">Low</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                navigate('/?house=Lok%20Sabha');
              }}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Lok Sabha Data & Projects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rajya Sabha Card */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 font-bold text-lg">
                  RS
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Rajya Sabha (Council of States)</h3>
                  <p className="text-xs text-slate-400">State-Level Representation (231 Seats)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800 text-xs font-semibold">
                231 MPs
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Allocation</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">₹34,818 Cr</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Expenditure</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">₹11,839 Cr</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Works</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">37,733</div>
              </div>
            </div>

            {/* Risk Distribution for RS */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Prioritized Project Tiers:</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-red-950/50 border border-red-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-red-400">5</div>
                  <div className="text-[10px] text-red-300 font-semibold uppercase">Critical</div>
                </div>
                <div className="bg-orange-950/50 border border-orange-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-orange-400">29</div>
                  <div className="text-[10px] text-orange-300 font-semibold uppercase">High</div>
                </div>
                <div className="bg-amber-950/50 border border-amber-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-amber-400">263</div>
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">Medium</div>
                </div>
                <div className="bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-lg">
                  <div className="text-xs font-bold text-emerald-400">37,436</div>
                  <div className="text-[10px] text-emerald-300 font-semibold uppercase">Low</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                navigate('/?house=Rajya%20Sabha');
              }}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Rajya Sabha Data & Projects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Pillars */}
      <div className="bg-slate-900/50 border-t border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Multi-Tier AI Risk Scoring Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every project is evaluated across 5 core risk vectors with complete point-level transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center text-red-400 font-bold">
                1
              </div>
              <h3 className="font-bold text-white text-base">Cost Escalation Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects final expenditures exceeding administrative sanctions (+25% to +100%+), flagging unauthorized budget inflation.
              </p>
              <div className="text-[11px] text-red-400 font-semibold">Weight: Up to 30 Points</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 font-bold">
                2
              </div>
              <h3 className="font-bold text-white text-base">Completion Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identifies ghost works and unverified completions where funds are disbursed without physical photo audit.
              </p>
              <div className="text-[11px] text-amber-400 font-semibold">Weight: Up to 25 Points</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 font-bold">
                3
              </div>
              <h3 className="font-bold text-white text-base">Payment Burst Density</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags repetitive transactions, duplicate signatures, and high-frequency voucher disbursement patterns.
              </p>
              <div className="text-[11px] text-blue-400 font-semibold">Weight: Up to 20 Points</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 font-bold">
                4
              </div>
              <h3 className="font-bold text-white text-base">Isolation Forest ML</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unsupervised anomaly detection trained across multidimensional vectors to catch non-linear corruption signatures.
              </p>
              <div className="text-[11px] text-purple-400 font-semibold">Confirmation Boost: +8 Points</div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-xl hover:shadow-blue-600/30 inline-flex items-center gap-2 cursor-pointer"
            >
              Enter Live Monitoring Platform <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/60 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400 font-medium">
            Smart India Hackathon • Problem Statement SIH26102 (MoSPI)
          </p>
          <p>
            Developed for Ministry of Statistics and Programme Implementation • Government of India
          </p>
          <p className="text-[11px] text-slate-600 pt-2">
            Default Admin: <span className="font-mono text-slate-400">admin / admin@123K</span> • 
            Default Employee: <span className="font-mono text-slate-400">emplo / emplo@123K</span> • 
            Admin Email Alerts: <span className="font-mono text-slate-400">admin777444555@gmail.com</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioPage;
