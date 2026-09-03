import React, { useState, useEffect } from 'react';
import { Bot, X, Send, Sparkles, CheckCircle, AlertCircle, FileSearch, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AIAssistantDrawer = ({ isOpen, onClose, contextProjectId = null, initialQuery = null }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello, Officer. I am the MoSPI MPLAD Intelligence Assistant. Ask me anything about project risk scores, cost deviations, completion verifications, or duplicate expenditure signatures in the active dataset.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const sampleQuestions = contextProjectId ? [
    `Why was Project #${contextProjectId} flagged?`,
    `Compare Project #${contextProjectId} with similar category works.`,
    `Show expenditure transactions for Project #${contextProjectId}.`,
    `What evidence supports the risk score for Project #${contextProjectId}?`
  ] : [
    "Show me the highest-risk projects requiring review.",
    "Why was Project 80673 flagged?",
    "Which constituencies have the highest concentration of risk indicators?",
    "Show projects with high cost deviation.",
    "How many projects require completion verification?",
    "Show top duplicate transaction vendor signatures."
  ];

  const handleSend = async (textToSend = null) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.queryAI(q, contextProjectId);
      const aiMsg = {
        sender: 'ai',
        text: res.answer,
        citations: res.cited_project_ids || [],
        grounding: res.grounding_data || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "An error occurred while querying the intelligence database. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">
                  MoSPI AI Decision-Support Assistant
                </h3>
                {contextProjectId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30 font-mono">
                    Project #{contextProjectId}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Factual query execution with record citations • Zero Hallucinations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                {/* Citations & Link buttons */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cited Records:</span>
                    {m.citations.map((pid) => (
                      <button
                        key={pid}
                        onClick={() => {
                          onClose();
                          navigate(`/project/${pid}`);
                        }}
                        className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <FileSearch className="w-3 h-3 text-blue-600" />
                        <span>Project #{pid}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-4 py-3 rounded-2xl w-fit shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="font-semibold">Querying verified database...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-3 bg-slate-100 border-t border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> {contextProjectId ? `Investigate Project #${contextProjectId}` : 'Suggested Officer Queries'}
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 whitespace-nowrap transition-colors shadow-2xs font-medium"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={contextProjectId ? `Ask about Project #${contextProjectId}...` : "Ask question regarding projects, anomalies, MPs..."}
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantDrawer;
