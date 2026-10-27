import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Zap,
  Thermometer,
  Wind,
  ShieldAlert,
  ArrowRight,
  Activity,
  Calendar,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { reconstructedIncidentsData } from '../services/incidentTimelineEngine';
import { ReconstructedIncidentTimeline, IncidentTimelineStep } from '../types';

export const IncidentTimelineView: React.FC = () => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-TIMELINE-001');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(5); // Default to last step (Critical alert)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const selectedIncident: ReconstructedIncidentTimeline =
    reconstructedIncidentsData.find((inc) => inc.incidentId === selectedIncidentId) ||
    reconstructedIncidentsData[0];

  const getStepIcon = (event: string) => {
    const e = event.toLowerCase();
    if (e.includes('cpu')) return <Cpu className="w-4 h-4 text-purple-400" />;
    if (e.includes('power') || e.includes('current')) return <Zap className="w-4 h-4 text-yellow-400" />;
    if (e.includes('temp')) return <Thermometer className="w-4 h-4 text-orange-400" />;
    if (e.includes('fan')) return <Wind className="w-4 h-4 text-cyan-400" />;
    if (e.includes('warning')) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <Flame className="w-4 h-4 text-rose-400" />;
  };

  const getStepBadge = (sev: IncidentTimelineStep['severity']) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500 text-white font-bold animate-pulse';
      case 'warning':
        return 'bg-amber-500 text-black font-extrabold';
      case 'info':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Incident Timeline Reconstruction Studio
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Feature 11 Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Chronological forensic playback: What happened → When → In what order → What was affected.
          </p>
        </div>

        {/* Incident Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Select Incident:</span>
          <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 font-mono text-xs">
            {reconstructedIncidentsData.map((inc) => (
              <button
                key={inc.incidentId}
                onClick={() => {
                  setSelectedIncidentId(inc.incidentId);
                  setActiveStepIndex(inc.steps.length - 1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedIncidentId === inc.incidentId
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {inc.incidentId.replace('INC-TIMELINE-', 'INC-')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Incident Card & Playback Controls */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 border-2 border-orange-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
              <span>{selectedIncident.incidentId}</span>
              <span>•</span>
              <span>Target: {selectedIncident.targetDevice}</span>
            </div>
            <h2 className="text-lg font-bold font-mono text-white mt-1">
              {selectedIncident.incidentTitle}
            </h2>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              Duration: {selectedIncident.durationMinutes} minutes ({selectedIncident.startedAt} → {selectedIncident.resolvedAt})
            </div>
          </div>

          {/* Forensic Playback Controls */}
          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveStepIndex(0)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="Reset to Beginning (14:01)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setActiveStepIndex((prev) => (prev < selectedIncident.steps.length - 1 ? prev + 1 : 0))
              }
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Step Forward</span>
            </button>
          </div>
        </div>

        {/* 4-Question Understanding Triad Banner (What happened -> When -> Order -> Affected) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">1. What Happened</span>
            <div className="font-bold text-white text-xs truncate">
              {selectedIncident.steps[activeStepIndex]?.event}
            </div>
            <div className="text-[10px] text-orange-400">
              {selectedIncident.steps[activeStepIndex]?.value}
            </div>
          </div>

          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">2. When</span>
            <div className="font-bold text-emerald-400 text-sm">
              {selectedIncident.steps[activeStepIndex]?.time} UTC
            </div>
            <div className="text-[10px] text-zinc-400">Step {activeStepIndex + 1} of {selectedIncident.steps.length}</div>
          </div>

          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">3. In What Order</span>
            <div className="font-bold text-cyan-400 text-xs">
              Sequential Cascade
            </div>
            <div className="text-[10px] text-zinc-400">14:01 → 14:06 Progression</div>
          </div>

          <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">4. What Was Affected</span>
            <div className="font-bold text-rose-400 text-xs truncate" title={selectedIncident.steps[activeStepIndex]?.affectedEntity}>
              {selectedIncident.steps[activeStepIndex]?.affectedEntity}
            </div>
            <div className="text-[10px] text-zinc-500">Target Asset & Subsystem</div>
          </div>
        </div>

        {/* INTERACTIVE STEP-BY-STEP RECONSTRUCTED TIMELINE (14:01 -> 14:06 Exact Progression) */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-orange-400" />
            Interactive Incident Progression Sequence (6 Milestones)
          </span>

          <div className="space-y-2 font-mono">
            {selectedIncident.steps.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-zinc-900 border-orange-500/80 shadow-lg shadow-orange-950/20 ring-1 ring-orange-500/40'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                      {getStepIcon(step.event)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-400">{step.time}</span>
                        <span className="text-xs font-bold text-white">{step.event}</span>
                        <span className={`text-[9px] px-2 py-0.2 rounded-full uppercase ${getStepBadge(step.severity)}`}>
                          {step.severity}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Metric: <strong className="text-zinc-200">{step.metric}</strong> ({step.value})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase block">Affected Entity</span>
                      <span className="text-zinc-300 text-[11px]">{step.affectedEntity}</span>
                    </div>
                    <div className="hidden sm:block text-[11px] text-zinc-400 max-w-xs truncate" title={step.statusDescription}>
                      {step.statusDescription}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RCA & Mitigation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-orange-400 font-bold uppercase text-[10px]">Reconstructed Root Cause</span>
            <p className="text-zinc-300 leading-relaxed">{selectedIncident.rootCauseSummary}</p>
          </div>
          <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
            <span className="text-emerald-400 font-bold uppercase text-[10px]">Executed Mitigation Plan</span>
            <p className="text-zinc-300 leading-relaxed">{selectedIncident.mitigationSummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
