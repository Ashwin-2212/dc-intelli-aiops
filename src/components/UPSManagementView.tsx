import React from 'react';
import {
  BatteryCharging,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flame,
  Shield,
  Layers,
  Thermometer,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';

export const UPSManagementView: React.FC = () => {
  const engine = TelemetryEngine.getInstance();
  const upsUnits = engine.upsUnits;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono">
              Uninterruptible Power Supply (UPS) & Battery Strings
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              N+1 Redundant Battery Trains
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Valve-Regulated Lead-Acid (VRLA) & Lithium-Ion battery string impedance, State of Health (SOH), and reserve runtime.
          </p>
        </div>
      </div>

      {/* UPS Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upsUnits.map((ups) => {
          const isCritical = ups.status === 'critical';
          const isWarning = ups.status === 'warning';
          return (
            <div
              key={ups.id}
              className={`p-5 bg-[#0a0a0a] border rounded-2xl space-y-4 shadow-xl transition-all ${
                isCritical
                  ? 'border-rose-500 shadow-rose-950/40 ring-1 ring-rose-500'
                  : isWarning
                  ? 'border-amber-500/80 shadow-amber-950/30'
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-zinc-900 rounded-xl text-orange-400">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">{ups.id}</h3>
                    <span className="text-[10px] text-zinc-500 font-mono">{ups.zone}</span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-mono uppercase font-bold ${
                    isCritical
                      ? 'bg-rose-500 text-white'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {ups.status}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-mono">{ups.name}</p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 text-[10px]">State of Health (SOH)</span>
                  <div
                    className={`text-base font-bold mt-0.5 ${
                      ups.batteryHealthPercent > 80
                        ? 'text-emerald-400'
                        : ups.batteryHealthPercent > 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {ups.batteryHealthPercent}%
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 text-[10px]">Runtime Reserve</span>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {ups.runtimeRemainingMinutes} Mins
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 text-[10px]">Current Load</span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {ups.currentLoadKw} kW ({ups.loadPercent}%)
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 text-[10px]">Cell Temp</span>
                  <div className="text-base font-bold text-white mt-0.5">{ups.temperatureC}°C</div>
                </div>
              </div>

              {/* Load Bar */}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Capacity Loading ({ups.capacityKva} kVA)</span>
                  <span className="text-white">{ups.loadPercent}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      ups.loadPercent > 80 ? 'bg-rose-500' : ups.loadPercent > 65 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${ups.loadPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Battery Degradation & Failure Notice */}
              {ups.failureProbability > 30 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-rose-400 font-bold">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Degradation Risk
                    </span>
                    <span>{ups.failureProbability}% Risk</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Battery String 2B impedance elevation detected. Replacement scheduled within 18 days.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
