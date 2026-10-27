import React, { useState } from 'react';
import {
  Settings,
  Flame,
  Zap,
  BatteryCharging,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Radio,
  Sliders,
  Shield,
  SlidersHorizontal,
  Bell,
  Cpu,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';

export const SettingsAdminView: React.FC = () => {
  const engine = TelemetryEngine.getInstance();
  const [activeScenario, setActiveScenario] = useState<string>('nominal');
  const [scenarioNotification, setScenarioNotification] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T000/B000/XXXX');
  const [emailAlerts, setEmailAlerts] = useState('ops-lead@alphacore-dc.internal');

  const triggerScenario = (type: 'crac_failure' | 'power_spike' | 'ups_failure' | 'nominal', label: string) => {
    engine.triggerFailureScenario(type);
    setActiveScenario(type);
    setScenarioNotification(`Scenario triggered: ${label}. Telemetry stream updating dynamically.`);
    setTimeout(() => setScenarioNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0a] border border-zinc-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-400" />
              Facility Administration & Chaos Simulation Sandbox
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono font-bold">
              Chaos Engineering Mode
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Inject controlled thermodynamic and electrical faults to evaluate AI anomaly radar and automatic failover response.
          </p>
        </div>
      </div>

      {scenarioNotification && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-300 text-xs font-mono flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span>{scenarioNotification}</span>
        </div>
      )}

      {/* Fault Injection Chaos Engine */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-500" />
          Real-Time Fault Injection Triggers (Live Physics Loop)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scenario 1 */}
          <button
            onClick={() => triggerScenario('crac_failure', 'CRAC-02 Cooling Degradation')}
            className={`p-4 rounded-xl border text-left font-mono transition-all cursor-pointer ${
              activeScenario === 'crac_failure'
                ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500 text-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400">CRAC-02 Thermal Fail</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Forces CRAC-02 fan speed drop to 32%, triggering thermal spikes in R-04/R-05 up to 34°C.
            </p>
          </button>

          {/* Scenario 2 */}
          <button
            onClick={() => triggerScenario('power_spike', 'Cyber Monday Workload Surge')}
            className={`p-4 rounded-xl border text-left font-mono transition-all cursor-pointer ${
              activeScenario === 'power_spike'
                ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500 text-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">Peak Power Surge</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Spikes CPU workloads to 95% across all racks, pushing substation power to 960 kW.
            </p>
          </button>

          {/* Scenario 3 */}
          <button
            onClick={() => triggerScenario('ups_failure', 'UPS-02 Battery Degradation')}
            className={`p-4 rounded-xl border text-left font-mono transition-all cursor-pointer ${
              activeScenario === 'ups_failure'
                ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 text-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">UPS-02 Bus Warning</span>
              <BatteryCharging className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Simulates battery string impedance rise, dropping runtime reserve from 34m to 14m.
            </p>
          </button>

          {/* Scenario 4 */}
          <button
            onClick={() => triggerScenario('nominal', 'Nominal Healthy Baseline')}
            className={`p-4 rounded-xl border text-left font-mono transition-all cursor-pointer ${
              activeScenario === 'nominal'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Nominal State</span>
              <RotateCcw className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Restores optimal ASHRAE cold aisle temperatures (21°C) and balanced PUE (1.38).
            </p>
          </button>
        </div>
      </div>

      {/* Alert Webhooks & Notification Settings */}
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" />
          Alert Routing & Webhook Integrations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-400">Slack / PagerDuty Incident Webhook URL:</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400">Escalation On-Call Email Distribution:</label>
            <input
              type="email"
              value={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* System Platform Information */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-500">
        <div>
          <span>DC-Intelli Enterprise AIOps v4.2.0 • Build 2026.08</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>Engine: TypeScript / React 19 / Express</span>
          <span>AI: Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};
