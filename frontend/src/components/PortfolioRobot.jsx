import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { askGeminiRobot } from '../services/geminiService';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Bot, 
  ShieldAlert,
  ArrowRight,
  Send,
  Loader2,
  MessageSquareQuote
} from 'lucide-react';

const ROBOT_TIPS = [
  {
    tag: '3D GEOSPATIAL AUDIT',
    title: 'Earth & India Globe',
    text: 'Scroll down to transition smoothly from the global Earth sphere directly into the high-resolution forensic map of India.',
    accent: 'blue'
  },
  {
    tag: 'BICAMERAL PARLIAMENT',
    title: 'Lok Sabha & Rajya Sabha',
    text: 'Auditing 543 Lok Sabha and 231 Rajya Sabha allocations across all 36 States & Union Territories with real MP directories.',
    accent: 'amber'
  },
  {
    tag: 'ANOMALY DETECTOR',
    title: 'Flagged Project #80673',
    text: 'Active critical audit detected in Punjab: +100% cost escalation flagged by our Isolation Forest AI engine.',
    accent: 'rose'
  },
  {
    tag: 'SPACE PARTICLES',
    title: 'Interactive Stardust',
    text: 'Move your cursor across the screen to watch cosmic particles part and disperse with realistic physics.',
    accent: 'cyan'
  }
];

const QUICK_QUESTIONS = [
  "What is MPLADS?",
  "Tell me about Punjab #80673",
  "How does AI detect anomalies?"
];

export const PortfolioRobot = ({ onSelectState }) => {
  const { isDark } = useTheme();
  const [tipIndex, setTipIndex] = useState(0);
  const [speechVisible, setSpeechVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [blink, setBlink] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Gemini 3.6 Chatbot State
  const [chatMode, setChatMode] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatAnswer, setChatAnswer] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isCrazyDashing, setIsCrazyDashing] = useState(false);

  const handleTriggerCrazyDash = () => {
    if (isCrazyDashing) return;
    setIsCrazyDashing(true);
    setIsWaving(true);
    setTimeout(() => {
      setIsCrazyDashing(false);
      setIsWaving(false);
    }, 3250);
  };

  // Periodic Blink Animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Auto-rotate helpful tips every 7 seconds when not chatting
  useEffect(() => {
    if (isMinimized || chatMode || isThinking) return;
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % ROBOT_TIPS.length);
    }, 7000);
    return () => clearInterval(tipInterval);
  }, [isMinimized, chatMode, isThinking]);

  // Track Mouse Movement for Head & Eye Look-At Tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized offset (-1 to 1) clamped
      const nx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.5)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.5)));
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAskGemini = async (queryText) => {
    const q = (queryText || userQuery).trim();
    if (!q || isThinking) return;

    setUserQuery('');
    setChatMode(true);
    setIsThinking(true);
    setIsWaving(true);
    setSpeechVisible(true);

    try {
      const reply = await askGeminiRobot(q, '/');
      setChatAnswer({ query: q, reply });
    } catch (err) {
      setChatAnswer({ query: q, reply: "I am analyzing the MoSPI MPLAD repository. Try asking about national utilization or project risk scores!" });
    } finally {
      setIsThinking(false);
      setTimeout(() => setIsWaving(false), 1000);
    }
  };

  const currentTip = ROBOT_TIPS[tipIndex];

  // Colors based on theme:
  // Light Mode: Porcelain White + Royal Gold Trims + Amber Accents
  // Dark Mode: Cyber Obsidian + Electric Neon Cyan + Tech Gunmetal
  const themeStyles = isDark ? {
    bodyBg: '#0f172a',
    bodyBorder: '#06b6d4',
    bodyHighlight: '#38bdf8',
    visorBg: '#030712',
    eyeColor: '#00f0ff',
    eyeGlow: 'rgba(0, 240, 255, 0.8)',
    trimColor: '#06b6d4',
    reactorColor: '#00f0ff',
    bubbleBg: 'bg-slate-950/95 border-cyan-500/40 text-slate-100 shadow-[0_12px_45px_rgba(6,182,212,0.3)]',
    cardBorder: 'border-cyan-500/30'
  } : {
    bodyBg: '#ffffff',
    bodyBorder: '#f59e0b',
    bodyHighlight: '#fbbf24',
    visorBg: '#0f172a',
    eyeColor: '#f59e0b',
    eyeGlow: 'rgba(245, 158, 11, 0.8)',
    trimColor: '#d97706',
    reactorColor: '#f59e0b',
    bubbleBg: 'bg-white/95 border-amber-400/70 text-slate-900 shadow-[0_12px_45px_rgba(217,119,6,0.22)]',
    cardBorder: 'border-amber-400/50'
  };

  const handleRobotClick = () => {
    setIsWaving(true);
    if (!chatMode) {
      setTipIndex(prev => (prev + 1) % ROBOT_TIPS.length);
    }
    setSpeechVisible(true);
    setTimeout(() => setIsWaving(false), 1200);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 right-8 z-40 select-none pointer-events-auto font-mono flex flex-col items-end gap-2"
    >
      {/* 1. Interactive Speech / Gemini Chat Bubble */}
      {speechVisible && !isMinimized && (
        <div 
          className={`w-76 sm:w-88 p-4 rounded-3xl border backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${themeStyles.bubbleBg}`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isThinking ? 'animate-ping bg-rose-500' : isDark ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
              <span className={`text-[10px] font-black tracking-wider uppercase ${isDark ? 'text-cyan-300' : 'text-amber-600'}`}>
                {chatMode ? '🤖 Gemini 3.6 Flash Chat' : currentTip.tag}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleTriggerCrazyDash}
                disabled={isCrazyDashing}
                className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                  isCrazyDashing 
                    ? 'animate-pulse bg-rose-500 text-white' 
                    : isDark 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30' 
                    : 'bg-amber-500/20 text-amber-700 border border-amber-500/40 hover:bg-amber-500/30'
                }`}
                title="Make Robot sprint across screen!"
              >
                <span>⚡ Dash</span>
              </button>
              <button
                type="button"
                onClick={() => setChatMode(prev => !prev)}
                className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  chatMode 
                    ? (isDark ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-amber-500/20 text-amber-700 border border-amber-500/40')
                    : (isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-black/5 hover:bg-black/10 text-slate-600')
                }`}
                title={chatMode ? 'Switch to Hints' : 'Switch to Gemini 3.6 Chat'}
              >
                {chatMode ? 'Hints' : 'Ask AI'}
              </button>
              {!chatMode && (
                <>
                  <button
                    type="button"
                    onClick={() => setTipIndex(prev => (prev - 1 + ROBOT_TIPS.length) % ROBOT_TIPS.length)}
                    className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 cursor-pointer"
                    title="Previous Tip"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipIndex(prev => (prev + 1) % ROBOT_TIPS.length)}
                    className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 cursor-pointer"
                    title="Next Tip"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setSpeechVisible(false)}
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-rose-500 cursor-pointer"
                title="Dismiss Bubble"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {chatMode ? (
            <div className="space-y-2.5">
              {chatAnswer ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <div className="text-[10px] text-slate-400 font-bold">Q: "{chatAnswer.query}"</div>
                  <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-100 font-sans bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-black/5 dark:border-white/10">
                    {chatAnswer.reply}
                  </p>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
                  Hello! I am your official MPLAD AI Guide powered by <strong>Gemini 3.6 Flash</strong>. Ask me anything about parliamentary works, state audits, or anomaly algorithms!
                </p>
              )}

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAskGemini(q)}
                    disabled={isThinking}
                    className={`text-[9px] px-2 py-0.5 rounded-full border transition-all text-left cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900/80 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20' 
                        : 'bg-white/90 border-amber-400/40 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Interactive Query Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAskGemini(); }} 
                className="flex items-center gap-1.5 mt-2"
              >
                <input 
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask Gemini 3.6 AI..."
                  disabled={isThinking}
                  className={`w-full text-xs px-3 py-1.5 rounded-xl border outline-none font-sans transition-all ${
                    isDark 
                      ? 'bg-slate-900/90 border-white/15 text-white placeholder:text-slate-500 focus:border-cyan-400' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isThinking || !userQuery.trim()}
                  className={`p-2 rounded-xl text-white transition-all shrink-0 cursor-pointer disabled:opacity-40 ${
                    isDark ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {isThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>
          ) : (
            <>
              <h5 className={`text-xs font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentTip.title}
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-sans">
                {currentTip.text}
              </p>

              <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => setChatMode(true)}
                  className={`font-bold flex items-center gap-1 cursor-pointer ${
                    isDark ? 'text-cyan-400 hover:underline' : 'text-amber-600 hover:underline'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Ask Robot AI</span>
                </button>
                <button
                  type="button"
                  onClick={handleRobotClick}
                  className={`font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                    isDark ? 'text-cyan-400' : 'text-amber-600'
                  }`}
                >
                  <span>Next Hint</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. Floating AI Companion Robot Widget */}
      <div className="flex items-center gap-2">
        <div 
          onClick={handleRobotClick}
          onDoubleClick={handleTriggerCrazyDash}
          className={`relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
            isCrazyDashing ? 'animate-crazy-robot-dash pointer-events-none' : ''
          }`}
          title="Click to interact, double click to make Robot sprint!"
        >
          {/* Crazy Dash Speed Sparks & Exhaust Trail */}
          {isCrazyDashing && (
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none animate-pulse">
              <span className="w-6 h-1 rounded-full bg-cyan-400 blur-[1px]" />
              <span className="w-4 h-1 rounded-full bg-amber-400 blur-[1px]" />
              <span className="w-2 h-1 rounded-full bg-white blur-[1px]" />
            </div>
          )}

          {/* Subtle Outer Energy Pulse Aura */}
          <div 
            className={`absolute -inset-1 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity animate-pulse ${
              isDark ? 'bg-cyan-500/40' : 'bg-amber-400/40'
            }`} 
          />

          {/* 3D Chibi SVG Animated Robot Avatar */}
          <svg 
            width="80" 
            height="86" 
            viewBox="0 0 100 110" 
            className="relative drop-shadow-xl overflow-visible"
            style={{
              transform: `translateY(${Math.sin(Date.now() / 600) * 4}px) rotate(${mousePos.x * 6}deg)`,
              transition: 'transform 0.15s ease-out'
            }}
          >
            <defs>
              {/* Metallic Body Gradient */}
              <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#1e293b' : '#ffffff'} />
                <stop offset="50%" stopColor={isDark ? '#0f172a' : '#f8fafc'} />
                <stop offset="100%" stopColor={isDark ? '#090e17' : '#e2e8f0'} />
              </linearGradient>

              {/* Gold or Cyan Trim Gradient */}
              <linearGradient id="robotTrimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#fbbf24'} />
                <stop offset="100%" stopColor={isDark ? '#0284c7' : '#d97706'} />
              </linearGradient>

              {/* Visor Glass Gradient */}
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0a0f1d" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="eyeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Floating Shadow */}
            <ellipse cx="50" cy="104" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />

            {/* Antenna Pole & Beacon */}
            <line x1="50" y1="20" x2="50" y2="9" stroke="url(#robotTrimGrad)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="50" cy="8" r="5" fill={isThinking ? '#ef4444' : themeStyles.reactorColor} filter="url(#eyeGlowFilter)">
              <animate attributeName="opacity" values="0.7;1;0.7" dur={isThinking ? '0.5s' : '1.8s'} repeatCount="indefinite" />
            </circle>

            {/* Left Ear Antenna */}
            <rect x="14" y="28" width="6" height="14" rx="3" fill="url(#robotTrimGrad)" />
            {/* Right Ear Antenna */}
            <rect x="80" y="28" width="6" height="14" rx="3" fill="url(#robotTrimGrad)" />

            {/* Head Capsule */}
            <rect 
              x="20" 
              y="18" 
              width="60" 
              height="44" 
              rx="18" 
              fill="url(#robotBodyGrad)" 
              stroke="url(#robotTrimGrad)" 
              strokeWidth="2.5" 
            />

            {/* Visor Display Screen */}
            <rect 
              x="26" 
              y="25" 
              width="48" 
              height="28" 
              rx="12" 
              fill="url(#visorGrad)" 
              stroke={isDark ? '#1e293b' : '#334155'} 
              strokeWidth="1.2" 
            />

            {/* Visor Upper Highlight Reflection */}
            <path 
              d="M 30 28 Q 50 31 70 28" 
              stroke="rgba(255,255,255,0.25)" 
              strokeWidth="1.5" 
              fill="none" 
            />

            {/* Expressive Robot Eyes (Look towards mouse Pos & Blink) */}
            {blink ? (
              // Blink Closed Lines
              <g stroke={themeStyles.eyeColor} strokeWidth="3" strokeLinecap="round">
                <line x1="34" y1="39" x2="44" y2="39" />
                <line x1="56" y1="39" x2="66" y2="39" />
              </g>
            ) : isWaving ? (
              // Happy Squint Arches ^ ^
              <g fill="none" stroke={themeStyles.eyeColor} strokeWidth="3" strokeLinecap="round">
                <path d="M 34 41 Q 39 35 44 41" />
                <path d="M 56 41 Q 61 35 66 41" />
              </g>
            ) : (
              // Open Glowing Eyes with Pupil Look-At
              <g filter="url(#eyeGlowFilter)">
                <ellipse 
                  cx={39 + mousePos.x * 3.5} 
                  cy={39 + mousePos.y * 2.5} 
                  rx="4.8" 
                  ry="5.5" 
                  fill={themeStyles.eyeColor} 
                />
                <circle 
                  cx={39 + mousePos.x * 3.5 + 1.2} 
                  cy={39 + mousePos.y * 2.5 - 1.5} 
                  r="1.4" 
                  fill="#ffffff" 
                />
                <ellipse 
                  cx={61 + mousePos.x * 3.5} 
                  cy={39 + mousePos.y * 2.5} 
                  rx="4.8" 
                  ry="5.5" 
                  fill={themeStyles.eyeColor} 
                />
                <circle 
                  cx={61 + mousePos.x * 3.5 + 1.2} 
                  cy={39 + mousePos.y * 2.5 - 1.5} 
                  r="1.4" 
                  fill="#ffffff" 
                />
              </g>
            )}

            {/* Cute Beaming Smile */}
            <path 
              d={`M 45 47 Q 50 ${isWaving ? 53 : 51} 55 47`} 
              stroke={themeStyles.eyeColor} 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Neck Joint */}
            <rect x="44" y="62" width="12" height="4" rx="2" fill="url(#robotTrimGrad)" />

            {/* Body Torso */}
            <path 
              d="M 28 66 Q 50 63 72 66 L 76 88 Q 50 92 24 88 Z" 
              fill="url(#robotBodyGrad)" 
              stroke="url(#robotTrimGrad)" 
              strokeWidth="2.5" 
            />

            {/* Chest Arc Reactor (Glowing Heart Core) */}
            <circle cx="50" cy="77" r="5.5" fill="url(#visorGrad)" stroke="url(#robotTrimGrad)" strokeWidth="1.5" />
            <circle cx="50" cy="77" r="3.2" fill={isThinking ? '#ef4444' : themeStyles.reactorColor} filter="url(#eyeGlowFilter)">
              <animate attributeName="r" values="2.6;3.6;2.6" dur={isThinking ? '0.7s' : '2s'} repeatCount="indefinite" />
            </circle>

            {/* Left Arm / Hand (Waves when clicked) */}
            {isWaving ? (
              <g transform="translate(18, 62) rotate(-35)">
                <rect x="-4" y="-12" width="8" height="16" rx="4" fill="url(#robotBodyGrad)" stroke="url(#robotTrimGrad)" strokeWidth="2" />
                <circle cx="0" cy="-14" r="5" fill="url(#robotTrimGrad)" />
              </g>
            ) : (
              <rect x="18" y="68" width="7" height="15" rx="3.5" fill="url(#robotBodyGrad)" stroke="url(#robotTrimGrad)" strokeWidth="1.8" />
            )}

            {/* Right Arm / Hand */}
            <rect x="75" y="68" width="7" height="15" rx="3.5" fill="url(#robotBodyGrad)" stroke="url(#robotTrimGrad)" strokeWidth="1.8" />
          </svg>
        </div>

        {/* Small Companion Controls */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setSpeechVisible(prev => !prev);
              if (!speechVisible) setChatMode(true);
            }}
            className={`p-1.5 rounded-xl border text-[10px] font-bold backdrop-blur-xl transition-all cursor-pointer ${
              speechVisible 
                ? (isDark ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-amber-500/20 text-amber-700 border-amber-500/40')
                : (isDark ? 'bg-slate-900/70 text-slate-400 border-white/10' : 'bg-white/70 text-slate-600 border-slate-300')
            }`}
            title="Chat with Gemini 3.6 Robot"
          >
            <Bot className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioRobot;
