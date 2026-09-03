import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const DemoBanner = ({ currentStep = 1, setStep, onOpenAI }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const steps = [
    { num: 1, title: 'National Overview', path: '/' },
    { num: 2, title: 'Filter High-Risk Works', path: '/high-risk' },
    { num: 3, title: 'Inspect Flagged Project', path: '/project/80673' },
    { num: 4, title: 'Explainable AI Breakdown', path: '/project/80673#ai-breakdown' },
    { num: 5, title: 'Comparable Works Benchmark', path: '/project/80673#comparable' },
    { num: 6, title: 'Duplicate Transactions', path: '/anomalies' },
    { num: 7, title: 'Constituency Intelligence', path: '/mps' },
    { num: 8, title: 'State Geographic Map', path: '/states' },
    { num: 9, title: 'Interactive AI Assistant', action: 'ai' },
    { num: 10, title: 'Data Transparency & Audit', path: '/transparency' }
  ];

  const handleStepClick = (step) => {
    if (setStep) setStep(step.num);
    if (step.action === 'ai') {
      if (onOpenAI) onOpenAI();
    } else if (step.path) {
      navigate(step.path);
    }
  };

  return (
    <div className={`rounded-2xl border shadow-md px-4 py-2.5 backdrop-blur-xl transition-all duration-200 overflow-hidden ${
      isDark ? 'bg-[#0c1017]/90 border-white/10 text-slate-200' : 'bg-amber-50/90 border-amber-200/90 text-slate-900'
    }`}>
      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-xs">
            SIH DEMO
          </span>
          <div>
            <h4 className={`text-xs font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              5-Minute Jury Presentation Flow:
            </h4>
            <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Click any step below to jump directly to the verified live data analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-1 xl:pb-0">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => handleStepClick(s)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer group ${
                isDark 
                  ? 'border-white/10 hover:border-amber-400/50 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white' 
                  : 'border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-slate-800 hover:text-slate-950'
              }`}
            >
              <span className={`w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center font-mono transition-colors ${
                isDark 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950' 
                  : 'bg-amber-100 text-amber-900 border border-amber-300/80 group-hover:bg-amber-500 group-hover:text-slate-950'
              }`}>
                {s.num}
              </span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
