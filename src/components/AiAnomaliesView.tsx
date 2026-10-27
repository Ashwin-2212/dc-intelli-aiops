import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  GitMerge,
  Wrench,
  Search,
  Check,
  TrendingUp,
  Activity,
  Zap,
  Layers,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  seedSubThresholdAnomalies,
} from '../services/anomalyDetectionEngine';
import { SubThresholdAnomalyRecord, AnomalyDetectionMethod } from '../types';

interface AiAnomaliesViewProps {
  setActiveView: (view: string) => void;
  onGenerateWorkOrder: (anomaly: any) => void;
}

export const AiAnomaliesView: React.FC<AiAnomaliesViewProps> = ({
  setActiveView,
  onGenerateWorkOrder,
}) => {
  const [anomalies, setAnomalies] = useState<SubThresholdAnomalyRecord[]>(
    seedSubThresholdAnomalies
  );
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeAnomalyId, setActiveAnomalyId] = useState<string>('ANOM-CPU-SURGE-001');

  const activeAnomaly =
    anomalies.find((a) => a.id === activeAnomalyId) || anomalies[0];

  const updateStatus = (
    id: string,
    newStatus: SubThresholdAnomalyRecord['status']
  ) => {
    setAnomalies(
      anomalies.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filtered = anomalies.filter((a) => {
    if (selectedMethod !== 'all' && a.detectionMethod !== selectedMethod)
      return false;
    if (selectedSeverity !== 'all' && a.severity !== selectedSeverity)
      return false;
    return true;
  });

  const getMethodBadge = (method: AnomalyDetectionMethod) => {
    switch (method) {
      case 'isolation_forest':
        return { label: 'Isolation Forest', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' };
      case 'z_score':
        return { label: 'Z-Score (>3.5σ)', color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' };
      case 'moving_averages':
        return { label: 'Moving Averages (EWMA)', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
      case 'rolling_baseline':
        return { label: 'Rolling Baseline', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
      case 'time_series_forecasting':
        return { label: 'Time-Series Forecast', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
      case 'statistical_thresholds':
      default:
        return { label: 'Statistical Thresholds', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' };
    }
  };

  const getSeverityBadge = (sev: SubThresholdAnomalyRecord['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white font-bold animate-pulse shadow-md shadow-rose-950/50';
      case 'HIGH':
        return 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-950/40';
      case 'MEDIUM':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              AI Sub-Threshold Anomaly Detection
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold">
              Feature 9 Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Detect subtle rate-of-change, velocity spikes, and distribution outliers before static thresholds trigger.
          </p>
        </div>

        {/* Algorithm & Severity Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">All Methods (6 ML Models)</option>
            <option value="isolation_forest">Isolation Forest</option>
            <option value="z_score">Z-Score</option>
            <option value="moving_averages">Moving Averages</option>
            <option value="rolling_baseline">Rolling Baseline</option>
            <option value="time_series_forecasting">Time-Series Forecasting</option>
            <option value="statistical_thresholds">Statistical Thresholds</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* FEATURE 9 CANONICAL EXAMPLE SHOWCASE HERO CARD */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-rose-950/20 border-2 border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                  Canonical Sub-Threshold Anomaly Demonstration
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {activeAnomaly.detectionMethod.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-bold font-mono text-white mt-0.5">
                {activeAnomaly.deviceName} — {activeAnomaly.metric}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Select Anomaly:</span>
            <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {anomalies.map((anom) => (
                <button
                  key={anom.id}
                  onClick={() => setActiveAnomalyId(anom.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeAnomalyId === anom.id
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {anom.id.split('-')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canonical Sequence Comparison Banner (Normal: 40->45->48->51 vs Anomaly: 40->45->48->72->94) */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3 font-mono">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Pattern Recognition Comparison:</span>
            <span className="text-emerald-400 text-[11px]">
              Sub-Threshold Detection: Alert generated at Step 4 (72%) BEFORE static 95% threshold!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Normal Sequence */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-1">
              <span className="text-emerald-400 font-bold uppercase text-[10px]">
                Normal Historical Sequence:
              </span>
              <div className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <span>CPU: 40</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span>45</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span>48</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span className="text-white underline">51</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Expected trajectory: Stable linear growth (+2-3% per step).
              </p>
            </div>

            {/* Anomaly Sequence */}
            <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg space-y-1">
              <span className="text-rose-400 font-bold uppercase text-[10px]">
                Detected Velocity Anomaly (Unusual Behavior):
              </span>
              <div className="text-base font-bold text-rose-300 flex items-center gap-2">
                <span>40</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span>45</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span>48</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span className="text-amber-400 bg-amber-500/20 px-1 rounded">72</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                <span className="text-rose-400 bg-rose-500/20 px-1 rounded underline">94</span>
              </div>
              <p className="text-[10px] text-rose-300 mt-1">
                Exponential velocity surge: +24% in step 4 triggers Isolation Forest outlier alert.
              </p>
            </div>
          </div>
        </div>

        {/* 7 Required Fields Display Cards Grid */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-orange-400" />
            7 Mandatory Anomaly Telemetry Telemetry Attributes
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
            {/* 1. Metric */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">1. Metric</span>
              <div className="font-bold text-white truncate" title={activeAnomaly.metric}>
                {activeAnomaly.metric}
              </div>
            </div>

            {/* 2. Expected Value */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">2. Expected Value</span>
              <div className="font-bold text-emerald-400 text-sm">
                {activeAnomaly.expectedValue}
              </div>
            </div>

            {/* 3. Actual Value */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">3. Actual Value</span>
              <div className="font-bold text-rose-400 text-sm">
                {activeAnomaly.actualValue}
              </div>
            </div>

            {/* 4. Deviation */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-500 uppercase">4. Deviation</span>
              <div className="font-bold text-orange-400 text-xs truncate" title={activeAnomaly.deviation}>
                {activeAnomaly.deviation}
              </div>
            </div>

            {/* 5. Severity */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">5. Severity</span>
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getSeverityBadge(activeAnomaly.severity)}`}>
                  {activeAnomaly.severity}
                </span>
              </div>
            </div>

            {/* 6. Timestamp */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">6. Timestamp</span>
              <div className="text-[11px] font-bold text-zinc-300">
                {activeAnomaly.timestamp.split(' ')[1] || activeAnomaly.timestamp}
              </div>
            </div>

            {/* 7. Confidence */}
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase">7. Confidence</span>
              <div className="font-bold text-cyan-400 text-sm">
                {activeAnomaly.confidence}%
              </div>
            </div>
          </div>
        </div>

        {/* Time-Series Trajectory Chart (Actual vs Expected vs Static Threshold) */}
        <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              Sub-Threshold Step Trajectory (Actual Surge vs Normal Expected Baseline)
            </span>
            <span className="text-zinc-400 text-[11px]">
              Static Trip Limit: <strong className="text-rose-400">{activeAnomaly.staticThresholdLimit}</strong>
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeAnomaly.timeSeriesHistory}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="label" stroke="#71717a" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <ReferenceLine
                  y={parseFloat(String(activeAnomaly.staticThresholdLimit)) || 95}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Static Threshold Alarm',
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="normalBaseline"
                  name="Expected Baseline"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Value"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-800 text-xs font-mono">
          <div className="text-zinc-400">
            Status: <span className="text-white font-bold">{activeAnomaly.status}</span> • Diagnostic:{' '}
            <span className="text-zinc-300">{activeAnomaly.rootCauseInsight}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeAnomaly.status !== 'ACKNOWLEDGED' && (
              <button
                onClick={() => updateStatus(activeAnomaly.id, 'ACKNOWLEDGED')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            )}

            <button
              onClick={() => onGenerateWorkOrder(activeAnomaly)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Generate Work Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complete Anomaly Feed List with All 6 Algorithms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            Detected Anomaly Event Log ({filtered.length})
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            Multivariate Stream Engine Polling
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filtered.map((anomaly) => {
            const methodInfo = getMethodBadge(anomaly.detectionMethod);
            const isSelected = activeAnomalyId === anomaly.id;

            return (
              <div
                key={anomaly.id}
                onClick={() => setActiveAnomalyId(anomaly.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900/90 border-rose-500/70 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
                    : 'bg-[#0a0a0a] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white">
                          {anomaly.deviceName}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${getSeverityBadge(anomaly.severity)}`}>
                          {anomaly.severity}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${methodInfo.color}`}>
                          {methodInfo.label}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">
                        ID: {anomaly.id} • Rack: {anomaly.rackId} • Confidence: {anomaly.confidence}% • {anomaly.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-zinc-500">Actual vs Expected:</span>
                    <span className="text-rose-400 font-bold">{anomaly.actualValue}</span>
                    <span className="text-zinc-600">vs</span>
                    <span className="text-emerald-400 font-bold">{anomaly.expectedValue}</span>
                  </div>
                </div>

                {/* Telemetry Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs font-mono">
                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-zinc-500 text-[10px] uppercase">Metric & Deviation</span>
                    <div className="font-bold text-zinc-200">{anomaly.metric}</div>
                    <div className="text-orange-400 text-[11px]">{anomaly.deviation}</div>
                  </div>

                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg md:col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase">Diagnostic Insight & Recommendation</span>
                    <div className="text-zinc-300 text-[11px]">{anomaly.rootCauseInsight}</div>
                    <div className="text-emerald-400 text-[11px] mt-1 font-semibold">
                      Action: {anomaly.recommendedAction}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
