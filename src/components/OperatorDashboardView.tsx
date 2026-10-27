import React, { useState } from 'react';
import {
  Monitor,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Bell,
  Activity,
  Zap,
  Radio,
  Clock,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { UserRole } from '../types';

interface OperatorDashboardViewProps {
  currentRole?: UserRole;
  setActiveView: (view: string) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const OperatorDashboardView: React.FC<OperatorDashboardViewProps> = ({
  currentRole,
  setActiveView,
  onOpenCopilot,
}) => {
  const engine = TelemetryEngine.getInstance();
  const facility = engine.facilities[0];
  const anomalies = engine.anomalies;
  const racks = engine.racks;

  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [ackFeedback, setAckFeedback] = useState<string | null>(null);

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts((prev) => [...prev, alertId]);
    setAckFeedback(`Alert #${alertId} acknowledged by NOC Operator.`);
    setTimeout(() => setAckFeedback(null), 3000);
  };

  const highestTempRack = [...racks].sort((a, b) => b.inletTempC - a.inletTempC)[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Operator Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-zinc-900 to-amber-950/40 border border-amber-600/40 shadow-lg shadow-amber-950/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl">
              <Monitor className="w-6 h-6 text-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white font-sans">
                  NOC COMMAND CENTER &amp; LIVE TELEMETRY STREAM
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-500/30 text-amber-200 text-xs font-mono font-semibold rounded border border-amber-400">
                  LIVE NOC OPERATOR
                </span>
              </div>
              <p className="text-zinc-400 text-xs font-mono mt-0.5">
                Real-Time Alarm Stream • Threshold Flapping Prevention • Instant Event Acknowledgment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              TELEMETRY STREAM: 100% ONLINE
            </div>
          </div>
        </div>

        {ackFeedback && (
          <div className="mt-4 p-3 bg-amber-950/90 border border-amber-500 text-amber-200 text-xs font-mono rounded-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {ackFeedback}
          </div>
        )}
      </div>

      {/* Live NOC Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono">
            <span>ACTIVE ANOMALIES</span>
            <Bell className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{anomalies.length}</div>
          <div className="text-[11px] text-zinc-400 font-mono">
            {anomalies.filter((a) => a.severity === 'critical').length} Critical, {anomalies.filter((a) => a.severity === 'warning').length} Warning
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono">
            <span>MAX INLET TEMP</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{highestTempRack?.inletTempC.toFixed(1) || '33.8'}°C</div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Rack {highestTempRack?.name || 'R-04'} (ASHRAE limit 27°C)
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono">
            <span>TOTAL FACILITY LOAD</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{facility.totalFacilityPowerKw?.toFixed(1) || '842.5'} kW</div>
          <div className="text-[11px] text-zinc-400 font-mono">
            PUE: {facility.pue?.toFixed(2) || '1.40'} (Nominal)
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
          <div className="flex justify-between items-center text-zinc-400 text-xs font-mono">
            <span>UNACKNOWLEDGED</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {anomalies.filter((a) => !acknowledgedAlerts.includes(a.id)).length}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">Requires NOC Sign-off</div>
        </div>
      </div>

      {/* Main NOC Alarm Ticker & Active Ingestion Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-zinc-200 text-sm">
              Live Alarm Stream &amp; Operator Triage Queue
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">Continuous 1s Ingestion Loop</span>
        </div>

        <div className="divide-y divide-zinc-800">
          {anomalies.map((anomaly) => {
            const isAck = acknowledgedAlerts.includes(anomaly.id);
            return (
              <div
                key={anomaly.id}
                className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  isAck ? 'bg-zinc-950/40 opacity-70' : 'bg-zinc-900 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`p-2 rounded-lg mt-0.5 ${
                      anomaly.severity === 'critical'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-200">{anomaly.deviceName || anomaly.deviceId}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          anomaly.severity === 'critical'
                            ? 'bg-rose-900/60 text-rose-200'
                            : 'bg-amber-900/60 text-amber-200'
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">{anomaly.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{anomaly.possibleCause || anomaly.recommendedAction}</p>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      Metric: <span className="text-cyan-300">{anomaly.metric}</span> | Value: <span className="text-amber-300">{anomaly.currentValue}</span> (Expected: {anomaly.expectedRange})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {isAck ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      ACKNOWLEDGED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(anomaly.id)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-mono font-bold rounded-lg transition-all shadow-sm"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
