import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Flame,
  AlertTriangle,
  History,
  Activity,
  Cpu,
  Thermometer,
  Zap,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { TelemetryReplayEngine } from '../services/telemetry/TelemetryReplayEngine';
import { CounterfactualEngine } from '../services/telemetry/CounterfactualEngine';
import { IncidentReplayFrame } from '../types/telemetryIntelligence';

interface TelemetryIncidentReplayViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetryIncidentReplayView: React.FC<TelemetryIncidentReplayViewProps> = ({ onOpenCopilot }) => {
  const replayEngine = TelemetryReplayEngine.getInstance();
  const frames = replayEngine.getIncidentReplay();

  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(3); // Default at T+0 trigger
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'REPLAY' | 'COUNTERFACTUAL'>('REPLAY');

  const counterfactualEngine = CounterfactualEngine.getInstance();
  const counterfactual = counterfactualEngine.generateCounterfactual();

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const currentFrame: IncidentReplayFrame = frames[currentFrameIndex] || frames[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Incident Replay & Counterfactual Intelligence
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono font-bold border border-orange-500/30">
                FRAME {currentFrameIndex + 1}/{frames.length}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Step-by-step historical playback of physical telemetry before, during, and after major infrastructure incidents.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('REPLAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'REPLAY' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ▶ Timeline Replay
          </button>
          <button
            onClick={() => setActiveTab('COUNTERFACTUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'COUNTERFACTUAL' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🔮 Counterfactual ("What-If")
          </button>
        </div>
      </div>

      {activeTab === 'REPLAY' ? (
        <div className="space-y-6">
          {/* Interactive Player Scrubber Card */}
          <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-6">
            {/* Scrubber Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="font-bold text-orange-400">{currentFrame.relativeTimeStr}</span>
                <span>Phase: <strong className="text-white">{currentFrame.activeIncidentPhase}</strong></span>
                <span>{currentFrame.timestamp.replace('T', ' ').slice(0, 19)}</span>
              </div>

              {/* Scrubber track */}
              <div className="relative w-full h-3 bg-zinc-800 rounded-full cursor-pointer">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentFrameIndex + 1) / frames.length) * 100}%` }}
                ></div>

                {/* Scrubber Points */}
                <div className="absolute inset-0 flex justify-between items-center px-1">
                  {frames.map((f, idx) => (
                    <button
                      key={f.frameIndex}
                      onClick={() => setCurrentFrameIndex(idx)}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        idx === currentFrameIndex
                          ? 'bg-white border-orange-500 scale-125 shadow-md shadow-orange-500/50'
                          : idx < currentFrameIndex
                          ? 'bg-orange-500 border-orange-400'
                          : 'bg-zinc-700 border-zinc-600'
                      }`}
                      title={f.relativeTimeStr}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentFrameIndex === 0}
                className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Replay' : 'Play Timeline'}
              </button>

              <button
                onClick={() => setCurrentFrameIndex((prev) => Math.min(frames.length - 1, prev + 1))}
                disabled={currentFrameIndex === frames.length - 1}
                className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentFrameIndex(0)}
                className="p-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white ml-2"
                title="Reset to T-12m"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Frame Event Highlight Banner */}
            <div className={`p-4 rounded-xl border font-mono text-xs ${
              currentFrame.activeIncidentPhase === 'INCIDENT_DECLARED'
                ? 'bg-red-950/40 border-red-500/60 text-red-200'
                : currentFrame.activeIncidentPhase === 'MULTI_METRIC_CASCADE'
                ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-200'
            }`}>
              <div className="font-bold flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Replay Annotation: {currentFrame.relativeTimeStr}</span>
              </div>
              <p>{currentFrame.highlightMessage}</p>
            </div>
          </div>

          {/* Replay State Snapshot Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {Object.entries(currentFrame.assetMetrics).map(([assetId, metrics]) => (
              <div key={assetId} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-white">{assetId}</span>
                  <span className="text-[10px] text-zinc-400">Replay Telemetry</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Temperature:</span>
                    <span className={`font-bold ${metrics.temp > 70 ? 'text-red-400' : 'text-orange-400'}`}>
                      {metrics.temp}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">CPU Load:</span>
                    <span className="text-blue-400 font-bold">{metrics.cpu}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Power:</span>
                    <span className="text-amber-400 font-bold">{metrics.power} W</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Counterfactual "What Would Have Happened?" View */
        <div className="space-y-6">
          <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                Counterfactual Branching: Without Intervention vs With Action
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Comparing the projected failure trajectory without human action against the actual stabilized recovery branch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch A: Without Intervention */}
              <div className="p-5 bg-red-950/20 border border-red-500/40 rounded-xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-red-400 font-bold">
                  <span>Branch A: Without Intervention</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-[10px]">
                    PREDICTED COLLAPSE
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {counterfactual.withoutIntervention.predictedOutcome}
                </p>

                <div className="space-y-2 pt-2 border-t border-red-500/20">
                  <div className="text-zinc-400">Trajectory Points (Projected °C):</div>
                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg">
                    {counterfactual.withoutIntervention.trajectoryPoints.map((p) => (
                      <div key={p.minuteOffset} className="text-center">
                        <div className="text-[10px] text-zinc-500">T+{p.minuteOffset}m</div>
                        <div className="font-bold text-red-400">{p.projectedValue}°C</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-red-300">
                  Estimated time to thermal silicon trip: <strong>{counterfactual.withoutIntervention.estimatedTimeToTripMinutes} min</strong>
                </div>
              </div>

              {/* Branch B: With Recommended Action */}
              <div className="p-5 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Branch B: With Recommended Action</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px]">
                    STABILIZED RECOVERY
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Action: {counterfactual.withRecommendedAction.actionTaken}
                </p>

                <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                  <div className="text-zinc-400">Recovery Trajectory (°C):</div>
                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg">
                    {counterfactual.withRecommendedAction.trajectoryPoints.map((p) => (
                      <div key={p.minuteOffset} className="text-center">
                        <div className="text-[10px] text-zinc-500">T+{p.minuteOffset}m</div>
                        <div className="font-bold text-emerald-400">{p.projectedValue}°C</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-300">
                  Expected recovery: <strong>{counterfactual.withRecommendedAction.expectedRecoveryTimeMinutes} min</strong> (Confidence: {counterfactual.withRecommendedAction.confidenceScore}%)
                </div>
              </div>
            </div>

            <div className="p-3 bg-black/50 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400">
              {counterfactual.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
