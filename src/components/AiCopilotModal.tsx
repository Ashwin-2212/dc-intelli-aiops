import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  Terminal,
  Copy,
  Check,
  Flame,
  Wrench,
  RotateCcw,
  ShieldCheck,
  Activity,
  ArrowRight,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { AiCopilotEngine } from '../services/aiCopilotEngine';
import { CopilotMessage } from '../types';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
  const copilotEngine = AiCopilotEngine.getInstance();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am the **DC-Intelli AI Copilot**. I have read-only access to live Redfish telemetry, physical topology, 42U rack capacity, thermal CFD models, and incident graphs. How can I assist you with infrastructure diagnostics?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canonicalQuestions = [
    'Which servers are overheating?',
    'Why is SERVER-001 unhealthy?',
    'What caused the latest critical incident?',
    'Which rack consumes the most power?',
    'What will CPU capacity look like in 90 days?',
    'Which devices have the highest failure risk?',
    'How can I reduce power consumption?',
    'What happens if I add 20 servers?',
  ];

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage: CopilotMessage = {
      id: `USR-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Try live backend AIOps endpoint first
      const res = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && (data.reply || data.response) && data.source === 'gemini-3.7-flash') {
          const aiResponse: CopilotMessage = {
            id: `COP-${Date.now()}`,
            sender: 'assistant',
            text: data.reply || data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: 'AI_NEURAL_GROUNDED_QUERY',
          };
          setMessages((prev) => [...prev, aiResponse]);
          setIsLoading(false);
          return;
        }
      }

      // High-fidelity local expert engine reasoning grounded in live telemetry
      setTimeout(() => {
        const responseMessage = copilotEngine.processQuery(promptText);
        setMessages((prev) => [...prev, responseMessage]);
        setIsLoading(false);
      }, 400);
    } catch (err: any) {
      console.error('Error communicating with Copilot:', err);
      const fallbackResponse = copilotEngine.processQuery(promptText);
      setMessages((prev) => [...prev, fallbackResponse]);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-white/[0.12] rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.85)] ring-1 ring-purple-500/30 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-zinc-950 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(147,51,234,0.35)] ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  AI Data Center Copilot
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold border border-emerald-500/25 flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Read-Only Safety Protocol Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Architecture: Question → Intent Detection → Approved Tools → Telemetry Grounding → Answer + Evidence.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.1] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Canonical Example Prompt Question Chips */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs font-mono custom-scrollbar">
          <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0">
            Example Queries (8 Core Scenarios):
          </span>
          {canonicalQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(q)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg shrink-0 transition-colors border border-zinc-800 hover:border-orange-500/40 text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 font-mono text-xs custom-scrollbar">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-3 leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none shadow-md'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-xl'
                  }`}
                >
                  {/* Intent & Read-Only Tool Execution Badge */}
                  {!isUser && m.intent && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-2 text-[10px]">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold uppercase">
                        Intent: {m.intent}
                      </span>
                      {m.toolInvocations && m.toolInvocations.map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20 truncate"
                          title={t.resultSummary}
                        >
                          <Terminal className="w-3 h-3 inline mr-1" />
                          Tool: {t.toolName}()
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap text-[12px]">{m.text}</div>

                  {/* Structured Telemetry Evidence Card (Answer + Evidence Architecture) */}
                  {!isUser && m.evidence && (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-[11px] mt-2">
                      <div className="flex items-center justify-between text-orange-400 font-bold uppercase text-[10px] border-b border-zinc-800/80 pb-1.5">
                        <span>Telemetry Evidence & Root Cause</span>
                        <span>Confidence: {m.evidence.confidenceScore}%</span>
                      </div>

                      {m.evidence.signals && m.evidence.signals.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {m.evidence.signals.map((sig, idx) => (
                            <div key={idx} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                              <span className="text-zinc-500 text-[10px] block">{sig.metric}</span>
                              <span className="font-bold text-white">{sig.value}</span>
                              {sig.delta && (
                                <span className="text-orange-400 text-[10px] ml-1">({sig.delta})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {m.evidence.probableCause && (
                        <div className="text-zinc-300 pt-1">
                          <strong className="text-zinc-500 uppercase text-[10px] block">Probable Cause:</strong>
                          {m.evidence.probableCause}
                        </div>
                      )}

                      {m.evidence.recommendedAction && (
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
                          <strong>Recommended Action:</strong> {m.evidence.recommendedAction}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[10px] opacity-60 pt-1">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="hover:opacity-100 flex items-center gap-1 text-zinc-400 hover:text-white"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-700">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs font-mono text-zinc-400">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span className="animate-pulse">
                AI Copilot executing read-only telemetry query & topological reasoning...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/[0.08]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(input);
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask Copilot: 'Why is SERVER-001 unhealthy?', 'What happens if I add 20 servers?'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.18] text-white text-xs font-mono px-4 py-3 rounded-2xl focus:outline-none focus:border-purple-500/70 focus:bg-white/[0.06] placeholder-zinc-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-mono text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-[1.03] active:scale-98"
            >
              <span>Query</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
