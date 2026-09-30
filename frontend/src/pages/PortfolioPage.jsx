import React, { useState, useEffect, useRef } from 'react';
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
  EyeOff,
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
  RotateCcw,
  Sun,
  Moon,
  Globe2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';
import { api } from '../services/api';
import ThreeIndiaMap from '../components/ThreeIndiaMap';
import PortfolioRobot from '../components/PortfolioRobot';
import Lenis from 'lenis';
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

// Playing Cards Deck: 5 Core Intelligence Pillars with Pure Crystal Glass Transparency & Circular Orbit Geometry
const PLAYING_CARDS = [
  {
    id: 'card-1',
    rank: 'A',
    suit: '♠',
    suitColor: 'text-cyan-400',
    crystalClass: 'crystal-cyan',
    accentColor: '#06b6d4',
    gemName: 'Sapphire Crystal',
    tag: 'PILLAR 1',
    title: 'Bicameral Oversight',
    stat: '₹1,16,767 Cr',
    label: 'Tracked Across 774 MPs',
    badge: '543 LS + 231 RS',
    desc: 'Constitutional verification monitoring 1,26,582 development works across 36 State & UT nodes.',
    route: '/mps',
    // Circle Position (Top Center: separated in orbital circle)
    circleX: 0,
    circleY: -225,
    circleRot: 0,
    // Backed Deck Position (Stacked together)
    deckX: -12,
    deckY: -8,
    deckRot: -4,
    // Fanned Arc Position
    fanX: -160,
    fanY: 22,
    fanRot: -18
  },
  {
    id: 'card-2',
    rank: 'K',
    suit: '♦',
    suitColor: 'text-amber-400',
    crystalClass: 'crystal-amber',
    accentColor: '#f59e0b',
    gemName: 'Topaz Crystal',
    tag: 'PILLAR 2',
    title: 'Isolation Forest ML',
    stat: '0–100 Pts',
    label: 'Multi-Factor Risk Score',
    badge: 'Anomaly Boost',
    desc: 'Unsupervised ML anomaly scoring detecting statistical outliers and cost escalations without legal bias.',
    route: '/high-risk',
    // Circle Position (Upper Right: separated in orbital circle)
    circleX: 345,
    circleY: -75,
    circleRot: 12,
    // Backed Deck Position (Stacked together)
    deckX: -6,
    deckY: -4,
    deckRot: -2,
    // Fanned Arc Position
    fanX: -80,
    fanY: 6,
    fanRot: -9
  },
  {
    id: 'card-3',
    rank: 'Q',
    suit: '♣',
    suitColor: 'text-rose-400',
    crystalClass: 'crystal-rose',
    accentColor: '#f43f5e',
    gemName: 'Ruby Crystal',
    tag: 'PILLAR 3',
    title: 'Project #80673',
    stat: '+100.0%',
    label: '₹5.0L → ₹10.0L Doubling',
    badge: 'Amritsar Flag',
    desc: 'Audit case study with factor breakdown: cost deviation, sector outlier, and ML confirmation.',
    route: '/project/80673',
    // Circle Position (Lower Right: separated in orbital circle)
    circleX: 160,
    circleY: 220,
    circleRot: 18,
    // Backed Deck Position (Stacked together)
    deckX: 0,
    deckY: 0,
    deckRot: 0,
    // Fanned Arc Position
    fanX: 0,
    fanY: 0,
    fanRot: 0
  },
  {
    id: 'card-4',
    rank: 'J',
    suit: '♥',
    suitColor: 'text-purple-400',
    crystalClass: 'crystal-purple',
    accentColor: '#a855f7',
    gemName: 'Amethyst Crystal',
    tag: 'PILLAR 4',
    title: 'Duplicate Signatures',
    stat: '38,866',
    label: 'Pattern Clones Isolated',
    badge: 'Vendor Density',
    desc: 'Identifies split contracts, repeating transaction bursts, and multi-vector anomalies.',
    route: '/anomalies',
    // Circle Position (Lower Left: separated in orbital circle)
    circleX: -160,
    circleY: 220,
    circleRot: -18,
    // Backed Deck Position (Stacked together)
    deckX: 6,
    deckY: 4,
    deckRot: 2,
    // Fanned Arc Position
    fanX: 80,
    fanY: 6,
    fanRot: 9
  },
  {
    id: 'card-5',
    rank: '10',
    suit: '♠',
    suitColor: 'text-emerald-400',
    crystalClass: 'crystal-emerald',
    accentColor: '#10b981',
    gemName: 'Emerald Crystal',
    tag: 'PILLAR 5',
    title: '3D Geospatial Audit',
    stat: '36 States',
    label: '100% Verified Baselines',
    badge: '4K Blue Marble',
    desc: 'Interactive 3D satellite globe zooming into high-resolution regional and state centroids.',
    route: '/states',
    // Circle Position (Upper Left: separated in orbital circle)
    circleX: -345,
    circleY: -75,
    circleRot: -12,
    // Backed Deck Position (Stacked together)
    deckX: 12,
    deckY: 8,
    deckRot: 4,
    // Fanned Arc Position
    fanX: 160,
    fanY: 22,
    fanRot: 18
  }
];

export const PortfolioPage = ({ onEnterApp }) => {
  const navigate = useNavigate();
  const { login, register, setGuestMode, isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Auth Dialog Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Chrome Notifications state
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [recentNotifs, setRecentNotifs] = useState([]);

  // 5-Card Layout Mode: 'auto' (scroll-driven: backed deck -> circle -> zoom out) | 'circle' | 'deck' | 'fan'
  const [cardsLayoutMode, setCardsLayoutMode] = useState('auto');
  const cardsLayoutModeRef = useRef('auto');
  const triggerCardsScrollUpdateRef = useRef(null);
  const [isCardsBackFlipped, setIsCardsBackFlipped] = useState(false);
  const isCardsBackFlippedRef = useRef(false);

  useEffect(() => {
    cardsLayoutModeRef.current = cardsLayoutMode;
    const cardsSec = document.getElementById('cards-deck-section');
    if (!cardsSec) return;
    const cardEls = cardsSec.querySelectorAll('.playing-card-item');
    const coreHub = cardsSec.querySelector('.cards-core-hub');

    if (cardsLayoutMode === 'auto') {
      if (triggerCardsScrollUpdateRef.current) {
        triggerCardsScrollUpdateRef.current();
      }
      return;
    }

    if (coreHub) {
      if (cardsLayoutMode === 'deck') {
        coreHub.style.opacity = '0';
        coreHub.style.transform = 'translate(-50%, -50%) scale(0.6)';
      } else {
        coreHub.style.opacity = '1';
        coreHub.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    }

    cardEls.forEach((cardEl, idx) => {
      const card = PLAYING_CARDS[idx];
      if (!card) return;
      let targetX = card.circleX;
      let targetY = card.circleY;
      let targetRot = card.circleRot;
      if (cardsLayoutMode === 'deck') {
        targetX = card.deckX;
        targetY = card.deckY;
        targetRot = card.deckRot;
      } else if (cardsLayoutMode === 'fan') {
        targetX = card.fanX;
        targetY = card.fanY;
        targetRot = card.fanRot;
      }
      cardEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(${targetRot}deg)`;
    });
  }, [cardsLayoutMode]);

  useEffect(() => {
    isCardsBackFlippedRef.current = isCardsBackFlipped;
  }, [isCardsBackFlipped]);

  // Setup Lenis Smooth Momentum Scrolling & Scroll-Driven Section Transitions
  useEffect(() => {
    // 1. Listen to notifications
    const unsub = notificationService.subscribe((item) => {
      setRecentNotifs(prev => [item, ...prev].slice(0, 4));
    });

    // 2. Initialize Lenis Inertial Momentum Scroll
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });
    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // 3. Initial GSAP Split-Text Reveal Animation on Mount
    const headings = document.querySelectorAll('.gsap-reveal');
    headings.forEach((el, idx) => {
      gsap.fromTo(el, 
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: idx * 0.08, 
          ease: 'power3.out' 
        }
      );
    });

    // 4. Scroll-Driven Fade & Zoom Transitions:
    // - All divs in portfolio: smooth fade-in as they enter view, fade-out when leaving view
    // - Cards section: Zoom in as it scrolls into view, dynamically separates cards into a circle, and zooms out after scrolling down!
    const sections = document.querySelectorAll('.scroll-fade-section');
    let ticking = false;

    const handleScrollFade = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const windowHeight = window.innerHeight;

          // 1. Fade-in scrolling for all portfolio content divs
          sections.forEach((sec) => {
            if (sec.id === 'cards-deck-section') return; // Handled with dedicated zoom/circular logic
            const rect = sec.getBoundingClientRect();
            let opacity = 1.0;
            let translateY = 0;

            // Exiting top of screen
            if (rect.bottom < windowHeight * 0.22) {
              const p = Math.max(0, rect.bottom / (windowHeight * 0.22));
              opacity = p;
              translateY = (1 - p) * -30;
            } 
            // Entering bottom of screen
            else if (rect.top > windowHeight * 0.76) {
              const p = Math.max(0, (windowHeight - rect.top) / (windowHeight * 0.24));
              opacity = p;
              translateY = (1 - p) * 30;
            }

            sec.style.opacity = opacity.toFixed(3);
            sec.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
            
            if (opacity <= 0.01) {
              sec.style.visibility = 'hidden';
              sec.style.pointerEvents = 'none';
            } else {
              sec.style.visibility = 'visible';
              sec.style.pointerEvents = 'auto';
            }
          });

          // 2. Cards Section: ZOOM IN while scrolling, ZOOM OUT after scrolling down!
          // Separate cards into circle while scrolling, otherwise backed cards in deck!
          const cardsSec = document.getElementById('cards-deck-section');
          if (cardsSec) {
            const rect = cardsSec.getBoundingClientRect();
            const secCenter = rect.top + rect.height / 2;
            const viewCenter = windowHeight / 2;

            let cardScale = 1.0;
            let cardOpacity = 1.0;
            let sepRatio = 1.0; // 0 = backed deck, 1 = separate circle

            // Entering from bottom towards viewport center:
            if (secCenter > viewCenter) {
              const distanceToCenter = secCenter - viewCenter;
              const enterSpan = windowHeight * 0.70;
              const enterP = Math.max(0, Math.min(1, 1 - (distanceToCenter / enterSpan)));
              
              // Zoom In: 0.60 -> 1.00 as user scrolls towards section
              cardScale = 0.60 + 0.40 * Math.pow(enterP, 0.85);
              cardOpacity = Math.min(1.0, enterP * 1.5);
              // Cards start tightly stacked in backed deck (sepRatio = 0), then dynamically separate into circle (sepRatio = 1)
              sepRatio = Math.max(0, Math.min(1, (enterP - 0.20) / 0.80));
            } 
            // Exiting towards top as user scrolls down past cards:
            else {
              const distancePastCenter = viewCenter - secCenter;
              const exitSpan = windowHeight * 0.75;
              const exitP = Math.max(0, Math.min(1, 1 - (distancePastCenter / exitSpan)));

              // Zoom Out: 1.00 -> 0.55 after scrolling down
              cardScale = 0.55 + 0.45 * Math.pow(exitP, 0.85);
              cardOpacity = Math.min(1.0, exitP * 1.4);
              // Cards gather back into backed deck as user scrolls down away
              sepRatio = Math.max(0, Math.min(1, exitP));
            }

            cardsSec.style.opacity = cardOpacity.toFixed(3);
            if (cardOpacity <= 0.01) {
              cardsSec.style.visibility = 'hidden';
              cardsSec.style.pointerEvents = 'none';
            } else {
              cardsSec.style.visibility = 'visible';
              cardsSec.style.pointerEvents = 'auto';
            }

            const zoomStage = cardsSec.querySelector('.cards-zoom-stage');
            if (zoomStage) {
              zoomStage.style.transform = `scale(${cardScale.toFixed(3)}) translateZ(0)`;
            }

            // Update central hub & cards if in 'auto' mode
            if (cardsLayoutModeRef.current === 'auto') {
              const coreHub = cardsSec.querySelector('.cards-core-hub');
              if (coreHub) {
                coreHub.style.opacity = Math.max(0, (sepRatio - 0.2) / 0.8).toFixed(2);
                coreHub.style.transform = `translate(-50%, -50%) scale(${(0.6 + 0.4 * sepRatio).toFixed(2)})`;
              }

              const cardEls = cardsSec.querySelectorAll('.playing-card-item');
              cardEls.forEach((cardEl, idx) => {
                const card = PLAYING_CARDS[idx];
                if (!card) return;
                const curX = card.deckX + (card.circleX - card.deckX) * sepRatio;
                const curY = card.deckY + (card.circleY - card.deckY) * sepRatio;
                const curRot = card.deckRot + (card.circleRot - card.deckRot) * sepRatio;
                cardEl.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) rotate(${curRot.toFixed(1)}deg)`;
              });
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    triggerCardsScrollUpdateRef.current = handleScrollFade;

    lenis.on('scroll', handleScrollFade);
    window.addEventListener('scroll', handleScrollFade, { passive: true });
    window.addEventListener('resize', handleScrollFade);
    handleScrollFade();

    return () => {
      unsub();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener('scroll', handleScrollFade);
      window.removeEventListener('resize', handleScrollFade);
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
      setLoginError(err.message || 'Login failed. Please verify credentials.');
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
      setRegError('Password must be at least 5 characters long.');
      return;
    }

    setRegLoading(true);
    try {
      await register(regForm);
      setRegSuccess('Registration successful! Admin alert dispatched to admin777444555@gmail.com.');
      setTimeout(() => {
        setAuthModalOpen(false);
        handleEnterApp(`/?state=${encodeURIComponent(regForm.state)}`);
      }, 1500);
    } catch (err) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleGuestEnter = () => {
    setGuestMode(true);
    handleEnterApp('/');
  };

  const fillQuickLogin = (role) => {
    if (role === 'admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin@123K');
    } else if (role === 'employee') {
      setLoginIdentifier('emplo');
      setLoginPassword('emplo@123K');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-rose-500 selection:text-white transition-colors duration-500 ${
      isDark 
        ? 'bg-transparent text-slate-100' 
        : 'bg-transparent text-slate-900'
    }`}>

      {/* ========================================================================= */}
      {/* 1. BACKGROUND 3D EARTH GLOBE (SCROLL-ZOOM ENGINE)                         */}
      {/* ========================================================================= */}
      <ErrorBoundary fallback={null}>
        <ThreeIndiaMap onSelectState={(st) => handleEnterApp(`/?state=${encodeURIComponent(st)}`)} />
      </ErrorBoundary>

      {/* ========================================================================= */}
      {/* 2. TOP EXECUTIVE NAVIGATION BAR (LIQUID GLASS FROSTED)                     */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-[#070b14]/40 border-white/10 shadow-lg' 
          : 'bg-white/30 border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/logo.jpg" 
              alt="MPLAD Logo" 
              className={`w-9 h-9 rounded-xl object-contain p-0.5 shadow-sm ${
                isDark 
                  ? 'border border-amber-500/40 bg-black/60' 
                  : 'border border-amber-500/60 bg-amber-50'
              }`}
            />
            <div>
              <span className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                MPLAD<span className="text-rose-500">.AI</span>
              </span>
              <div className={`text-[10px] font-mono hidden sm:block ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Parliamentary Anomaly & Expenditure Intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono">
            {/* Theme Switcher Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xl ${
                isDark 
                  ? 'bg-slate-900/50 border-white/15 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white/40 border-white/70 text-slate-800 hover:bg-white/60 shadow-xs'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden md:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={() => handleOpenAuthModal('login')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer backdrop-blur-xl ${
                isDark 
                  ? 'border-white/20 text-slate-200 hover:bg-white/10' 
                  : 'border-white/70 bg-white/40 text-slate-900 hover:bg-white/70 shadow-xs'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleOpenAuthModal('register')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Register Citizen
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO OPENING SECTION (FROSTED LIQUID GLASS TRANSPARENCY)                */}
      {/* ========================================================================= */}
      <section className="scroll-fade-section relative z-10 pt-8 sm:pt-14 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-2xl p-6 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-3xl space-y-6 transition-all relative overflow-hidden ${
            isDark 
              ? 'bg-slate-950/35 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]' 
              : 'bg-white/20 border-white/80 text-slate-900 shadow-[0_20px_50px_rgba(31,38,135,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]'
          }`}>
            {/* Top Specular Gloss Sheen */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none rounded-t-3xl" />
            
            <div className={`relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider shadow-xs backdrop-blur-xl ${
              isDark 
                ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' 
                : 'bg-rose-50/60 border-rose-200/80 text-rose-700'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
              Smart India Hackathon • Problem Statement SIH26102
            </div>

            <div className="relative z-10 flex items-center gap-3.5">
              <img 
                src="/assets/logo.jpg" 
                alt="MPLAD AI" 
                className={`w-14 h-14 rounded-2xl object-contain p-1 shadow-xl shrink-0 ${
                  isDark 
                    ? 'border-2 border-amber-500/50 bg-black/60 shadow-amber-950/50' 
                    : 'border-2 border-amber-500/60 bg-white/90 shadow-slate-300'
                }`}
              />
              <div>
                <h1 className={`gsap-reveal text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-mono ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  MPLAD AI RISK & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600">
                    FORENSIC INTELLIGENCE
                  </span>
                </h1>
              </div>
            </div>

            <p className={`relative z-10 text-base sm:text-lg leading-relaxed ${
              isDark ? 'text-slate-200' : 'text-slate-900 font-medium'
            }`}>
              Multi-dimensional parliamentary expenditure monitoring and fraud anomaly detection for the 
              Members of Parliament Local Area Development Scheme. Real-time bicameral governance 
              spanning <strong className="text-amber-500 font-mono font-bold">Lok Sabha (543 MPs)</strong> and <strong className="text-blue-500 font-mono font-bold">Rajya Sabha (231 MPs)</strong>.
            </p>

            {/* Application Access Gateways */}
            <div className={`relative z-10 p-5 rounded-2xl border shadow-sm space-y-3.5 backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-800'
              }`}>
                <Compass className="w-3.5 h-3.5 text-blue-500" />
                <span>Application Access Gateways:</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenAuthModal('login')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer group font-mono"
                >
                  <LogIn className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Officer & Admin Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAuthModal('register')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer group font-mono"
                >
                  <UserPlus className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Citizen Registration</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleGuestEnter}
                  className={`font-bold flex items-center gap-1.5 cursor-pointer hover:underline ${
                    isDark ? 'text-slate-200 hover:text-white' : 'text-slate-900 hover:text-blue-600'
                  }`}
                >
                  <span>🌐 Explore Application as Guest</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                </button>

                <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  Scoped by State & Parliament House
                </span>
              </div>
            </div>

            {/* Chrome Web Desktop Notifications Banner */}
            <div className={`relative z-10 border p-4 rounded-2xl shadow-sm transition-all backdrop-blur-xl ${
              isDark 
                ? 'bg-gradient-to-r from-rose-950/25 via-purple-950/15 to-transparent border-rose-800/30' 
                : 'bg-gradient-to-r from-rose-50/40 via-purple-50/30 to-white/30 border-rose-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src="/assets/logo.jpg" 
                    alt="Alert Logo" 
                    className="w-9 h-9 rounded-xl object-contain border border-amber-500/40 p-0.5 bg-black/60 shrink-0 shadow-xs"
                  />
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold flex items-center gap-2 font-mono ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      Chrome Browser Live Alerts
                      <span className="text-[9px] bg-rose-500/20 text-rose-500 dark:text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded font-bold">
                        ACTIVE AUDIT
                      </span>
                    </h4>
                    <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                      Receive desktop alerts for cost escalation and ghost completion anomalies.
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
                <div className="mt-2.5 pt-2.5 border-t border-rose-500/20 space-y-1.5">
                  <div className="text-[10px] font-mono text-rose-500 dark:text-rose-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Dispatched Notifications:
                  </div>
                  {recentNotifs.map((n) => (
                    <div key={n.id} className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center justify-between gap-2 font-mono ${
                      isDark ? 'bg-black/60 border-white/10 text-slate-200' : 'bg-white/80 border-slate-200 text-slate-900'
                    }`}>
                      <span className="font-medium truncate">{n.title}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* National Scheme Metrics */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className={`border p-3.5 rounded-2xl backdrop-blur-xl transition-all hover:scale-[1.02] ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/30 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/45'
              }`}>
                <div className={`text-[10px] font-mono flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <IndianRupee className="w-3 h-3 text-emerald-500" /> Monitored
                </div>
                <div className={`text-base sm:text-lg font-bold mt-0.5 font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹1,16,767 Cr
                </div>
                <div className="text-[10px] text-emerald-500 font-mono font-bold">Nationwide</div>
              </div>

              <div className={`border p-3.5 rounded-2xl backdrop-blur-xl transition-all hover:scale-[1.02] ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/30 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/45'
              }`}>
                <div className={`text-[10px] font-mono flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Landmark className="w-3 h-3 text-blue-500" /> Parliament
                </div>
                <div className={`text-base sm:text-lg font-bold mt-0.5 font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  774 MPs
                </div>
                <div className="text-[10px] text-blue-500 font-mono font-bold">543 LS + 231 RS</div>
              </div>

              <div className={`border p-3.5 rounded-2xl backdrop-blur-xl transition-all hover:scale-[1.02] ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/30 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/45'
              }`}>
                <div className={`text-[10px] font-mono flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Layers className="w-3 h-3 text-rose-500" /> Total Works
                </div>
                <div className={`text-base sm:text-lg font-bold mt-0.5 font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  1,26,582
                </div>
                <div className="text-[10px] text-rose-500 font-mono font-bold">36 States / UTs</div>
              </div>

              <div className={`border p-3.5 rounded-2xl backdrop-blur-xl transition-all hover:scale-[1.02] ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/30 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-white/45'
              }`}>
                <div className={`text-[10px] font-mono flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Cpu className="w-3 h-3 text-amber-500" /> AI Engine
                </div>
                <div className={`text-base sm:text-lg font-bold mt-0.5 font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Iso Forest
                </div>
                <div className="text-[10px] text-amber-500 font-mono font-bold">4-Tier Scoring</div>
              </div>
            </div>

            {/* Scroll Indicator Hint */}
            <div className={`pt-2 flex items-center gap-2 text-xs font-mono animate-pulse ${
              isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
            }`}>
              <ChevronDown className="w-4 h-4 text-blue-500" />
              <span>Scroll down to zoom Earth globe into India's 36-state geospatial matrix</span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BICAMERAL PARLIAMENTARY DIVISION: LOK SABHA VS RAJYA SABHA             */}
      {/* ========================================================================= */}
      {/* 4. BICAMERAL PARLIAMENTARY DIVISION: LOK SABHA VS RAJYA SABHA             */}
      {/* ========================================================================= */}
      <section className="scroll-fade-section relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`p-8 sm:p-12 rounded-3xl border shadow-2xl backdrop-blur-3xl transition-all relative overflow-hidden ${
          isDark 
            ? 'bg-slate-950/35 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]' 
            : 'bg-white/20 border-white/80 text-slate-900 shadow-[0_20px_50px_rgba(31,38,135,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]'
        }`}>
          {/* Top Specular Gloss Sheen */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none rounded-t-3xl" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold mb-3 backdrop-blur-xl ${
              isDark ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' : 'bg-rose-50/60 border-rose-200/80 text-rose-700'
            }`}>
              <Building2 className="w-3.5 h-3.5 text-rose-500" />
              PARLIAMENTARY DATA STRUCTURE
            </div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold font-mono ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Bicameral Division: Lok Sabha vs. Rajya Sabha
            </h2>
            <p className={`text-sm sm:text-base mt-2 font-mono ${
              isDark ? 'text-slate-300' : 'text-slate-800 font-medium'
            }`}>
              Ingested from official MoSPI schemas across 36 State & UT nodes with point-level algorithmic risk grading.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lok Sabha Card */}
            <div className={`border rounded-2xl p-6 sm:p-7 transition-all shadow-lg relative overflow-hidden group backdrop-blur-xl ${
              isDark 
                ? 'bg-white/5 border-amber-500/30 hover:border-amber-400' 
                : 'bg-white/30 border-amber-400/50 hover:border-amber-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 font-bold text-lg font-mono">
                    LS
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Lok Sabha (House of the People)
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                      Direct Constituency Representation (543 Seats)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                  543 MPs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
                <div className={`p-3.5 rounded-xl border backdrop-blur-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
                }`}>
                  <div className="text-[10px] text-slate-500 font-semibold">Allocation</div>
                  <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹81,949 Cr
                  </div>
                </div>
                <div className={`p-3.5 rounded-xl border backdrop-blur-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
                }`}>
                  <div className="text-[10px] text-slate-500 font-semibold">Expenditure</div>
                  <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹27,759 Cr
                  </div>
                </div>
                <div className={`p-3.5 rounded-xl border backdrop-blur-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
                }`}>
                  <div className="text-[10px] text-slate-500 font-semibold">Total Works</div>
                  <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    88,849
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className={`text-xs font-semibold font-mono ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  Prioritized Project Tiers:
                </div>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-red-500">3</div>
                    <div className="text-[9px] text-red-500 font-semibold uppercase">Critical</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-orange-500">4</div>
                    <div className="text-[9px] text-orange-500 font-semibold uppercase">High</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-amber-500">624</div>
                    <div className="text-[9px] text-amber-500 font-semibold uppercase">Medium</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-emerald-500">88,218</div>
                    <div className="text-[9px] text-emerald-500 font-semibold uppercase">Low</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleEnterApp('/?house=Lok%20Sabha')}
                className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                Explore Lok Sabha Data & Projects <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rajya Sabha Card */}
            <div className={`border rounded-2xl p-6 sm:p-7 transition-all shadow-lg relative overflow-hidden group backdrop-blur-xl ${
              isDark 
                ? 'bg-white/5 border-blue-500/30 hover:border-blue-400' 
                : 'bg-white/30 border-blue-400/50 hover:border-blue-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-500 font-bold text-lg font-mono">
                    RS
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Rajya Sabha (Council of States)
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                      State-Level Representation (231 Seats)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                  231 MPs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6 font-mono">
                <div className={`p-3.5 rounded-xl border backdrop-blur-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
                }`}>
                  <div className="text-[10px] text-slate-500 font-semibold">Allocation</div>
                  <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹34,818 Cr
                  </div>
                </div>
                <div className={`p-3.5 rounded-xl border backdrop-blur-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
                }`}>
                  <div className="text-[10px] text-slate-500 font-semibold">Expenditure</div>
                  <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹11,839 Cr
                  </div>
                </div>
                <div className={`p-3.5 rounded-xl border backdrop-blur-xl ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
                }`}>
                  <div className="text-[10px] text-slate-500 font-semibold">Total Works</div>
                  <div className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    37,733
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className={`text-xs font-semibold font-mono ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  Prioritized Project Tiers:
                </div>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-red-500">5</div>
                    <div className="text-[9px] text-red-500 font-semibold uppercase">Critical</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-orange-500">29</div>
                    <div className="text-[9px] text-orange-500 font-semibold uppercase">High</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-amber-500">263</div>
                    <div className="text-[9px] text-amber-500 font-semibold uppercase">Medium</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg">
                    <div className="text-xs font-bold text-emerald-500">37,436</div>
                    <div className="text-[9px] text-emerald-500 font-semibold uppercase">Low</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleEnterApp('/?house=Rajya%20Sabha')}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                Explore Rajya Sabha Data & Projects <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4B. TRANSPARENT CRYSTAL PLAYING CARDS: CIRCULAR ORBIT & BACKED DECK       */}
      {/* ========================================================================= */}
      <section id="cards-deck-section" className="scroll-fade-section relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`p-6 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all relative overflow-hidden ${
          isDark 
            ? 'bg-slate-950/20 border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]' 
            : 'bg-white/15 border-white/80 text-slate-900 shadow-[0_20px_50px_rgba(31,38,135,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)]'
        }`}>
          {/* Top Specular Gloss Sheen */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none rounded-t-3xl" />

          {/* Section Header */}
          <div className="relative z-10 text-center max-w-3xl mx-auto mb-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold mb-3 backdrop-blur-xl ${
              isDark ? 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300' : 'bg-blue-50/70 border-blue-200/80 text-blue-700'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              5 TRANSPARENT CRYSTAL PILLARS • RADIAL ORBIT
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black font-mono tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Parliamentary Intelligence Deck
            </h2>
            <p className={`text-xs sm:text-sm mt-2 font-mono ${
              isDark ? 'text-slate-300' : 'text-slate-700 font-medium'
            }`}>
              Crystalline transparent cards. Scroll down to dynamically zoom in and spread cards into an orbital circle, or view as backed cards.
            </p>

            {/* Interactive Layout Mode Selectors */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setCardsLayoutMode('circle')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  cardsLayoutMode === 'circle'
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>⭕ Circular Orbit</span>
              </button>
              <button
                onClick={() => setCardsLayoutMode('deck')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  cardsLayoutMode === 'deck'
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🃏 Backed Cards Stack</span>
              </button>
              <button
                onClick={() => setCardsLayoutMode('fan')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  cardsLayoutMode === 'fan'
                    ? 'bg-rose-500/25 text-rose-300 border-rose-400 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🪭 Fanned Arc</span>
              </button>
              <button
                onClick={() => setCardsLayoutMode('auto')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  cardsLayoutMode === 'auto'
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-sm'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Scroll drives dynamic zoom in, circle burst, and zoom out"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>⚡ Dynamic Scroll</span>
              </button>
              <button
                onClick={() => setIsCardsBackFlipped(!isCardsBackFlipped)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Flip to crystal back or crystal face"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isCardsBackFlipped ? 'Show Face' : 'Flip to Back'}</span>
              </button>
            </div>
          </div>

          {/* Cards Zoom Stage: Scales dynamically during scrolling */}
          <div className="cards-zoom-stage relative z-10 py-6 px-2 flex justify-center items-center min-h-[760px] sm:min-h-[800px] overflow-visible">
            <div className="playing-cards-deck flex items-center justify-center relative w-full max-w-5xl h-[740px]">
              
              {/* Central Glowing Core Hub in Circular Mode */}
              <div className={`cards-core-hub absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-cyan-400/30 dark:border-white/15 bg-cyan-500/5 dark:bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center pointer-events-none transition-all duration-500 shadow-[0_0_50px_rgba(6,182,212,0.15)] ${
                cardsLayoutMode === 'deck' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}>
                <div className="w-10 h-10 rounded-full border border-cyan-400/40 bg-cyan-500/15 flex items-center justify-center mb-1 animate-pulse">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  Forensic Matrix
                </span>
                <span className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  5 Crystal Pillars
                </span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  Click card to inspect
                </span>
              </div>

              {/* 5 Transparent Crystal Playing Cards */}
              {PLAYING_CARDS.map((card, idx) => {
                let curX = card.circleX;
                let curY = card.circleY;
                let curRot = card.circleRot;

                if (cardsLayoutMode === 'deck') {
                  curX = card.deckX;
                  curY = card.deckY;
                  curRot = card.deckRot;
                } else if (cardsLayoutMode === 'fan') {
                  curX = card.fanX;
                  curY = card.fanY;
                  curRot = card.fanRot;
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => handleEnterApp(card.route)}
                    className={`playing-card-item crystal-card-base ${card.crystalClass} absolute cursor-pointer select-none rounded-3xl p-4 sm:p-5 w-[195px] sm:w-[210px] h-[280px] sm:h-[295px] flex flex-col justify-between transition-all duration-500 group`}
                    style={{
                      transform: `translate3d(${curX}px, ${curY}px, 0) rotate(${curRot}deg)`,
                      zIndex: 10 + idx,
                      left: '50%',
                      top: '50%',
                      marginLeft: '-100px',
                      marginTop: '-145px'
                    }}
                  >
                    {/* Pure Crystal Glass Glare Reflection */}
                    <div className="crystal-glare" />

                    {/* Delicate Inner Crystal Border */}
                    <div className="absolute inset-2.5 rounded-2xl border border-white/20 dark:border-white/15 pointer-events-none" />

                    {isCardsBackFlipped ? (
                      /* Backed Card Guilloche Crystal Pattern */
                      <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-3">
                        <div className="crystal-card-back-pattern" />
                        <div className="w-12 h-12 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl font-black mb-2 shadow-inner">
                          <span className={card.suitColor}>{card.suit}</span>
                        </div>
                        <div className="text-[11px] font-mono font-bold tracking-widest uppercase text-white/90">
                          {card.gemName}
                        </div>
                        <div className="text-[9px] font-mono text-cyan-300/80 mt-1">
                          MPLAD FORENSIC
                        </div>
                      </div>
                    ) : (
                      /* Front Crystal Face */
                      <>
                        {/* Top-Left Rank & Suit Index */}
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="font-mono text-left leading-none">
                            <div className={`text-xl sm:text-2xl font-black drop-shadow-sm ${card.suitColor}`}>
                              {card.rank}
                            </div>
                            <div className={`text-base font-bold -mt-0.5 ${card.suitColor}`}>
                              {card.suit}
                            </div>
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/90 uppercase backdrop-blur-sm">
                            {card.tag}
                          </span>
                        </div>

                        {/* Card Core Forensic Content */}
                        <div className="relative z-10 my-auto space-y-1 text-center">
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 text-cyan-300 inline-block">
                            {card.badge}
                          </span>
                          <h3 className={`text-xs sm:text-sm font-black tracking-tight leading-snug drop-shadow-sm ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {card.title}
                          </h3>
                          <div className={`text-lg sm:text-xl font-black font-mono tracking-tight drop-shadow-md ${card.suitColor}`}>
                            {card.stat}
                          </div>
                          <div className={`text-[9px] sm:text-[10px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-600 font-semibold'}`}>
                            {card.label}
                          </div>
                          <p className={`text-[10px] sm:text-[11px] leading-relaxed font-sans line-clamp-2 px-1 ${
                            isDark ? 'text-slate-200' : 'text-slate-700 font-medium'
                          }`}>
                            {card.desc}
                          </p>
                        </div>

                        {/* Bottom-Right Inverted Rank & Suit Index */}
                        <div className="relative z-10 flex items-end justify-between">
                          <span className={`text-[9px] sm:text-[10px] font-mono font-bold flex items-center gap-1 group-hover:underline ${card.suitColor}`}>
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                          </span>
                          <div className="font-mono text-right leading-none rotate-180">
                            <div className={`text-xl sm:text-2xl font-black drop-shadow-sm ${card.suitColor}`}>
                              {card.rank}
                            </div>
                            <div className={`text-base font-bold -mt-0.5 ${card.suitColor}`}>
                              {card.suit}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FLAGGED HIGH-RISK CASE STUDY: PROJECT #80673 (AMRITSAR, PUNJAB)         */}
      {/* ========================================================================= */}
      <section className="scroll-fade-section relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`p-8 sm:p-10 rounded-3xl border-2 shadow-2xl relative overflow-hidden backdrop-blur-3xl transition-all ${
          isDark 
            ? 'bg-slate-950/35 border-red-500/40 text-white shadow-[0_20px_50px_rgba(239,68,68,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)]' 
            : 'bg-white/20 border-red-300/80 text-slate-900 shadow-[0_20px_50px_rgba(239,68,68,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]'
        }`}>
          {/* Top Specular Gloss Sheen */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none rounded-t-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-red-500/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 shrink-0 shadow-lg">
                <AlertTriangle className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-red-500 tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  CRITICAL ANOMALY ALERT • PUNJAB CLUSTER
                </div>
                <h3 className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
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

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 font-mono text-xs">
            <div className={`p-4 rounded-xl border space-y-1 backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
            }`}>
              <div className="text-slate-500">Sanctioned Amount</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹5,00,000</div>
              <div className="text-[10px] text-slate-400">Administrative Ceiling</div>
            </div>

            <div className={`p-4 rounded-xl border border-red-500/40 space-y-1 backdrop-blur-xl ${
              isDark ? 'bg-red-950/20' : 'bg-red-50/50'
            }`}>
              <div className="text-red-500 font-bold">Final Expenditure</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">₹10,00,000</div>
              <div className="text-[10px] text-red-500 font-bold">+100.0% Cost Deviation</div>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
            }`}>
              <div className="text-slate-500">Location & MP</div>
              <div className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Amritsar, Punjab</div>
              <div className="text-[10px] text-slate-400 truncate">Gurjeet Singh Aujla</div>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white/35 border-white/60 shadow-xs'
            }`}>
              <div className="text-slate-500">Algorithmic Risk Score</div>
              <div className="text-lg font-bold text-rose-500">55.0 / 100</div>
              <div className="text-[10px] text-rose-500">Isolation Forest Flagged</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MULTI-TIER AI RISK SCORING ARCHITECTURE                                */}
      {/* ========================================================================= */}
      <section className="scroll-fade-section relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`p-8 sm:p-12 rounded-3xl border shadow-2xl backdrop-blur-3xl relative overflow-hidden transition-all ${
          isDark 
            ? 'bg-slate-950/35 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]' 
            : 'bg-white/20 border-white/80 text-slate-900 shadow-[0_20px_50px_rgba(31,38,135,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]'
        }`}>
          {/* Top Specular Gloss Sheen */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none rounded-t-3xl" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-12">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold mb-3 backdrop-blur-xl ${
              isDark ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' : 'bg-rose-50/60 border-rose-200/80 text-rose-700'
            }`}>
              <Binary className="w-3.5 h-3.5 text-rose-500" />
              ALGORITHMIC FRAUD DETECTION ENGINE
            </div>
            <h2 className={`text-2xl sm:text-4xl font-extrabold font-mono ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Multi-Vector Risk Scoring Architecture
            </h2>
            <p className={`text-sm mt-2 font-mono ${
              isDark ? 'text-slate-300' : 'text-slate-800 font-medium'
            }`}>
              Every parliamentary work is evaluated across 5 core audit vectors with point-level explainability.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
            <div className={`border p-6 rounded-2xl space-y-3 shadow-md backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-red-500/30' : 'bg-white/30 border-red-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-bold">
                1
              </div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Cost Escalation Vector</h3>
              <p className={`text-xs leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                Detects final expenditures exceeding administrative sanctions (+25% to +100%+), flagging unauthorized budget inflation.
              </p>
              <div className="text-[11px] text-red-500 font-bold">Max Weight: 30 Points</div>
            </div>

            <div className={`border p-6 rounded-2xl space-y-3 shadow-md backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-amber-500/30' : 'bg-white/30 border-amber-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
                2
              </div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Completion Verification</h3>
              <p className={`text-xs leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                Identifies ghost works and unverified completions where funds are disbursed without geo-tagged physical photo audits.
              </p>
              <div className="text-[11px] text-amber-500 font-bold">Max Weight: 25 Points</div>
            </div>

            <div className={`border p-6 rounded-2xl space-y-3 shadow-md backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-blue-500/30' : 'bg-white/30 border-blue-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
                3
              </div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Burst Density</h3>
              <p className={`text-xs leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                Flags repetitive transactions, duplicate contractor signatures, and rapid voucher disbursements before fiscal year ends.
              </p>
              <div className="text-[11px] text-blue-500 font-bold">Max Weight: 20 Points</div>
            </div>

            <div className={`border p-6 rounded-2xl space-y-3 shadow-md backdrop-blur-xl ${
              isDark ? 'bg-white/5 border-rose-500/30' : 'bg-white/30 border-rose-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 font-bold">
                4
              </div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Isolation Forest ML</h3>
              <p className={`text-xs leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                Unsupervised anomaly detection trained across multidimensional vectors to catch non-linear corruption signatures.
              </p>
              <div className="text-[11px] text-rose-500 font-bold">ML Boost: +8 Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FULL-SCREEN 3D GLOBE INDIA MAP (END OF PAGE - MATCHING IMAGE 5)         */}
      {/* ========================================================================= */}
      <section className="relative z-10 min-h-[125vh] flex flex-col justify-end pointer-events-none pb-6 pt-32">
        {/* Floating Minimal HUD Strip at the bottom of the map */}
        <div className="max-w-xl mx-auto px-4 w-full flex items-center justify-center pointer-events-auto mb-2">
          <div className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold backdrop-blur-2xl shadow-xl flex items-center justify-between gap-3 w-full sm:w-auto ${
            isDark ? 'bg-[#090e1a]/90 border-white/20 text-white' : 'bg-white/90 border-white/80 text-slate-900 shadow-slate-300/80'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="text-[11px]">Hover any state beacon for live MP forensics</span>
            </div>

            <button
              type="button"
              onClick={() => handleEnterApp('/')}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full text-[11px] font-mono transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER (SOLID OPAQUE SECTION - NEVER OVERLAPS GLOBE)                    */}
      {/* ========================================================================= */}
      <footer className={`border-t py-12 text-center text-xs font-mono relative z-20 transition-colors ${
        isDark ? 'bg-[#050811] border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/assets/logo.jpg" 
              alt="Logo" 
              className="w-7 h-7 rounded-lg object-contain border border-amber-500/40 p-0.5 bg-black/60"
            />
            <span className="font-bold text-white">
              MPLAD AI Risk & Anomaly Intelligence System
            </span>
          </div>
          <p>
            Smart India Hackathon • Problem Statement SIH26102 (MoSPI)
          </p>
          <p>
            Ministry of Statistics and Programme Implementation • Government of India
          </p>
          <p className="text-[11px] pt-2 text-slate-400">
            Default Admin: <strong className="text-white">admin / admin@123K</strong> • 
            Default Employee: <strong className="text-white">emplo / emplo@123K</strong> • 
            Admin Alerts: <strong className="text-white">admin777444555@gmail.com</strong>
          </p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 9. AUTHENTICATION DIALOG MODAL (LOGIN & REGISTER)                         */}
      {/* ========================================================================= */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 text-left my-8 font-mono backdrop-blur-2xl transition-all ${
            isDark 
              ? 'bg-slate-900/95 border-white/20 text-white shadow-[0_25px_50px_rgba(0,0,0,0.85)]' 
              : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_25px_50px_rgba(0,0,0,0.15)]'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/logo.jpg" 
                  alt="Logo" 
                  className="w-8 h-8 rounded-xl object-contain border border-amber-500/40 p-0.5 bg-black/60"
                />
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {authTab === 'login' ? 'Officer & Auditor Authentication' : 'Citizen Registration'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    MPLAD Bicameral Intelligence Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth Tab switcher */}
            <div className={`flex rounded-xl p-1 mb-5 border ${
              isDark ? 'bg-black/60 border-white/10' : 'bg-slate-100/80 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'register'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register Citizen
              </button>
            </div>

            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Username or Email ID
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. admin or emplo"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-rose-500 font-mono transition-colors ${
                        isDark 
                          ? 'bg-black/60 border-white/15 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-rose-500 font-mono transition-colors ${
                        isDark 
                          ? 'bg-black/60 border-white/15 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(prev => !prev)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500 text-red-500 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
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

                <div className="pt-3 border-t border-slate-200/20 dark:border-white/10 font-mono">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Demo Credentials (1-Click Fill)
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => fillQuickLogin('admin')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                        isDark 
                          ? 'bg-black/60 hover:bg-amber-500/10 border-white/10 hover:border-amber-500/40' 
                          : 'bg-slate-50 hover:bg-amber-50/70 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>Admin Role</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">admin / admin@123K</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillQuickLogin('employee')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                        isDark 
                          ? 'bg-black/60 hover:bg-blue-500/10 border-white/10 hover:border-blue-500/40' 
                          : 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                        <span>Employee Role</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">emplo / emplo@123K</div>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalOpen(false);
                      handleGuestEnter();
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 underline cursor-pointer"
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
                    <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.username}
                      onChange={(e) => setRegForm({...regForm, username: e.target.value})}
                      placeholder="citizen_audit"
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-rose-500 ${
                        isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={regForm.phoneNumber}
                      onChange={(e) => setRegForm({...regForm, phoneNumber: e.target.value})}
                      placeholder="+91-9876543210"
                      className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-rose-500 ${
                        isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.mailid}
                    onChange={(e) => setRegForm({...regForm, mailid: e.target.value})}
                    placeholder="yourname@gmail.com"
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-rose-500 ${
                      isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                        placeholder="Min 5 chars"
                        className={`w-full pl-3 pr-9 py-2 border rounded-lg text-xs focus:outline-none focus:border-rose-500 ${
                          isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(prev => !prev)}
                        className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        required
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                        placeholder="Re-enter"
                        className={`w-full pl-3 pr-9 py-2 border rounded-lg text-xs focus:outline-none focus:border-rose-500 ${
                          isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(prev => !prev)}
                        className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showRegConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-medium mb-1 flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span>Select Your State (Default Scope)</span>
                    <span className="text-[10px] text-blue-500 font-normal">Switchable</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <select
                      value={regForm.state}
                      onChange={(e) => setRegForm({...regForm, state: e.target.value})}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-rose-500 ${
                        isDark ? 'bg-black/60 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-600 dark:text-rose-300">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    Automated Admin Email Alert Dispatched
                  </div>
                  <div className="text-[10px] mt-0.5 text-slate-500 dark:text-slate-300">
                    On submission, an alert is sent to <strong className="text-slate-900 dark:text-white font-mono">admin777444555@gmail.com</strong>.
                  </div>
                </div>

                {regError && (
                  <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500 text-red-500 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
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

      {/* ========================================================================= */}
      {/* 10. INTERACTIVE THEME-ADAPTIVE AI ROBOT COMPANION                         */}
      {/* ========================================================================= */}
      <PortfolioRobot onSelectState={(st) => handleEnterApp(`/?state=${encodeURIComponent(st)}`)} />

    </div>
  );
};

export default PortfolioPage;
