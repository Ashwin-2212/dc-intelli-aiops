import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Thermometer,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import { ClosedLoopLearningEngine } from '../services/telemetry/ClosedLoopLearningEngine';
import { DecisionActionOption, ClosedLoopOutcomeRecord } from '../types/telemetryIntelligence';

interface TelemetryClosedLoopViewProps {
  onOpenCopilot?: (prompt?: string) => void;
}

export const TelemetryClosedLoopView: React.FC<TelemetryClosedLoopViewProps> = ({ onOpenCopilot }) => {
  const closedLoopEngine = ClosedLoopLearningEngine.getInstance();
  const [outcomes, setOutcomes] = useState<ClosedLoopOutcomeRecord[]>(closedLoopEngine.getOutcomeHistory());
  const [options, setOptions] = useState<DecisionActionOption[]>(closedLoopEngine.getActionOptions('CRAC-02'));
  const [selectedAsset, setSelectedAsset] = useState<string>('CRAC-02');
  const [approvedNotification, setApprovedNotification] = useState<string | null>(null);

  const stats = closedLoopEngine.getSuccessMetrics();

  const handleApprove = (actionId: string) => {
    const outcome = closedLoopEngine.approveAction(selectedAsset, actionId, 'Super Admin');
    setOutcomes(closedLoopEngine.getOutcomeHistory());
    setOptions(closedLoopEngine.getActionOptions(selectedAsset));
    setApprovedNotification(`Action ${actionId} approved & executed. Target recovery tracked successfully!`);
    setTimeout(() => setApprovedNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0d0d12] via-zinc-900 to-[#121016] border border-zinc-800/90 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              AI Decision Engine & Closed-Loop Learning
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                SUCCESS RATE: {stats.successRatePercent}%
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Continuous learning loop tracking recommendation accuracy, human authorizations, and verified post-remediation outcomes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 font-mono text-xs text-zinc-300">
          <span>Target Asset:</span>
          <select
            value={selectedAsset}
            onChange={(e) => {
              setSelectedAsset(e.target.value);
              setOptions(closedLoopEngine.getActionOptions(e.target.value));
            }}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="CRAC-02" className="bg-zinc-900">CRAC-02 (Thermal Overheat)</option>
            <option value="SRV-R-04-02" className="bg-zinc-900">SRV-R-04-02 (Compute Node Surge)</option>
          </select>
        </div>
      </div>

      {approvedNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl font-mono text-xs flex items-center justify-between shadow-lg">
          <span>👑 {approvedNotification}</span>
          <button onClick={() => setApprovedNotification(null)} className="text-emerald-300 font-bold">✕</button>
        </div>
      )}

      {/* Closed-Loop Learning KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Actions Tracked</div>
          <div className="text-xl font-bold font-mono text-white">{stats.totalActionsTracked}</div>
          <div className="text-[10px] text-emerald-400 font-mono">Validated Loop</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Recommendation Success</div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.successRatePercent}%</div>
          <div className="text-[10px] text-zinc-400 font-mono">Target recovery met</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">Avg Recovery Time</div>
          <div className="text-xl font-bold font-mono text-purple-400">{stats.avgRecoveryMinutes} min</div>
          <div className="text-[10px] text-zinc-400 font-mono">From approval to baseline</div>
        </div>

        <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl space-y-1">
          <div className="text-[11px] text-zinc-400 font-mono">RCA Accuracy Score</div>
          <div className="text-xl font-bold font-mono text-orange-400">{stats.rcaAccuracyAverage}%</div>
          <div className="text-[10px] text-zinc-400 font-mono">Evidence ground truth</div>
        </div>
      </div>

      {/* Decision Engine Recommended Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Prescriptive Remediation Options for {selectedAsset}
            </h2>
            <p className="text-xs text-zinc-400">
              Evaluated for thermal impact, power delta, operational risk, and financial cost. Human approval required for high-risk actions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => (
            <div
              key={opt.actionId}
              className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-4 shadow-lg hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white">{opt.title}</h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-1">{opt.description}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  opt.operationalRisk === 'HIGH'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : opt.operationalRisk === 'MEDIUM'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {opt.operationalRisk} RISK
                </span>
              </div>

              {/* Estimated Impact Matrix */}
              <div className="grid grid-cols-4 gap-2 text-[10px] font-mono bg-black/40 p-2.5 rounded-xl border border-zinc-800">
                <div>
                  <div className="text-zinc-500">Thermal Delta</div>
                  <div className="text-emerald-400 font-bold">{opt.estimatedTemperatureImpactC}°C</div>
                </div>
                <div>
                  <div className="text-zinc-500">Power Delta</div>
                  <div className="text-amber-400 font-bold">{opt.estimatedPowerImpactKw} kW</div>
                </div>
                <div>
                  <div className="text-zinc-500">Recovery Time</div>
                  <div className="text-purple-300 font-bold">{opt.estimatedRecoveryMinutes} min</div>
                </div>
                <div>
                  <div className="text-zinc-500">Cost Estimate</div>
                  <div className="text-zinc-200 font-bold">${opt.estimatedCostUsd}</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {opt.requiresHumanApproval ? '🔒 Requires Root Authority' : '⚡ Safe Auto-Dispatch'}
                </span>

                {opt.approvalStatus === 'APPROVED' ? (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold">
                    ✓ APPROVED & LOGGED
                  </span>
                ) : (
                  <button
                    onClick={() => handleApprove(opt.actionId)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-orange-500 hover:opacity-90 text-white rounded-lg text-xs font-mono font-bold shadow-md shadow-purple-500/20"
                  >
                    Authorize & Execute
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closed-Loop Verification Outcome History */}
      <div className="p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Closed-Loop Outcome Verification History
            </h2>
            <p className="text-xs text-zinc-400">
              Auditable log of executed actions with pre-action vs post-action telemetry deltas proving successful resolution.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <th className="pb-2.5">Outcome ID</th>
                <th className="pb-2.5">Target Asset</th>
                <th className="pb-2.5">Executed Action</th>
                <th className="pb-2.5">Pre → Post Metric</th>
                <th className="pb-2.5">Recovery Time</th>
                <th className="pb-2.5">RCA Accuracy</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {outcomes.map((o) => (
                <tr key={o.outcomeId} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 text-zinc-400">{o.outcomeId}</td>
                  <td className="py-3 font-bold text-white">{o.targetAsset}</td>
                  <td className="py-3 text-zinc-300 max-w-xs truncate">{o.selectedAction}</td>
                  <td className="py-3">
                    <span className="text-red-400 font-bold">{o.preActionMetricValue}{o.metricUnit}</span>
                    <span className="text-zinc-500 mx-1.5">→</span>
                    <span className="text-emerald-400 font-bold">{o.postActionMetricValue}{o.metricUnit}</span>
                  </td>
                  <td className="py-3 text-purple-300">{o.recoveryDurationMinutes} min</td>
                  <td className="py-3 text-orange-400 font-bold">{o.rcaAccuracyRating}%</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[10px] uppercase font-bold">
                      {o.outcomeStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
