import React, { useState } from 'react';
import {
  Crown,
  ShieldAlert,
  Sliders,
  Zap,
  Flame,
  BatteryWarning,
  Server,
  RotateCcw,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  RefreshCw,
  Terminal,
  Activity,
  ToggleLeft,
  ToggleRight,
  Database,
  Cpu,
  Power,
  ShieldCheck,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { UserRole, SimulationScenario } from '../types';

interface SuperAdminControlViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  setActiveView: (view: string) => void;
  onOpenCopilot: (prompt?: string) => void;
}

export const SuperAdminControlView: React.FC<SuperAdminControlViewProps> = ({
  currentRole,
  onRoleChange,
  setActiveView,
  onOpenCopilot,
}) => {
  const engine = TelemetryEngine.getInstance();
  const facility = engine.facilities[0];
  const currentScenario = engine.currentScenario;

  const [activeTab, setActiveTab] = useState<'master_controls' | 'simulator' | 'rbac_matrix' | 'system_logs'>(
    'master_controls'
  );

  // Master switch states
  const [substationFeederActive, setSubstationFeederActive] = useState<boolean>(true);
  const [cracOverride, setCracOverride] = useState<boolean>(false);
  const [autoWorkOrderDispatch, setAutoWorkOrderDispatch] = useState<boolean>(true);
  const [telemetryFrequencySec, setTelemetryFrequencySec] = useState<number>(3);
  const [cmdbAutoReconcile, setCmdbAutoReconcile] = useState<boolean>(true);

  // Managed User Directory for Super Admin
  const [usersList, setUsersList] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
      department: string;
      status: 'active' | 'suspended';
      emergencyOverride: boolean;
    }>
  >([
    {
      id: 'usr-root-001',
      name: 'Ashwin T (You)',
      email: 'ashwin.t@dc-intelli.internal',
      role: 'super_admin',
      department: 'Infrastructure Architecture & Root Governance',
      status: 'active',
      emergencyOverride: true,
    },
    {
      id: 'usr-admin-002',
      name: 'Ashwin Surya',
      email: 'ashwin@dc-intelli.internal',
      role: 'dc_admin',
      department: 'Data Center Site Administration',
      status: 'active',
      emergencyOverride: true,
    },
    {
      id: 'usr-mgr-003',
      name: 'Marcus Chen',
      email: 'marcus.chen@dc-intelli.internal',
      role: 'manager',
      department: 'Data Center Operations & Capacity',
      status: 'active',
      emergencyOverride: false,
    },
    {
      id: 'usr-eng-004',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@dc-intelli.internal',
      role: 'engineer',
      department: 'HVAC & Electrical Power Engineering',
      status: 'active',
      emergencyOverride: false,
    },
    {
      id: 'usr-tech-005',
      name: 'Devon Miller',
      email: 'devon.miller@dc-intelli.internal',
      role: 'technician',
      department: 'Facility NOC Command Center',
      status: 'active',
      emergencyOverride: false,
    },
    {
      id: 'usr-view-006',
      name: 'Elena Rostova',
      email: 'elena.rostova@dc-intelli.internal',
      role: 'viewer',
      department: 'Executive Governance & ESG Audit',
      status: 'active',
      emergencyOverride: false,
    },
  ]);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const triggerNotify = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleRoleUpgrade = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    triggerNotify(`Updated user authority rank to: ${newRole.toUpperCase()}`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
    triggerNotify('User operational status updated.');
  };

  const handleToggleEmergencyAccess = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, emergencyOverride: !u.emergencyOverride } : u
      )
    );
    triggerNotify('Emergency Root Override privilege updated.');
  };

  const handleTriggerScenario = (scenario: SimulationScenario) => {
    engine.setScenario(scenario);
    triggerNotify(`INJECTED SCENARIO: ${scenario.replace('_', ' ').toUpperCase()}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Super Admin Supreme Authority Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-purple-950/40 border-2 border-purple-500/50 shadow-xl shadow-purple-950/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-48 h-48 text-purple-300" />
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded-xl shadow-inner">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-wide font-sans">
                    SUPER ADMIN MASTER HEADQUARTERS
                  </h1>
                  <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 text-xs font-mono font-bold rounded border border-purple-400">
                    SUPREME AUTHORITY (100%)
                  </span>
                </div>
                <p className="text-zinc-400 text-xs font-mono mt-1">
                  Root Governance • Global Killswitches • Physical Incident Injector • RBAC Hierarchy Override
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleTriggerScenario('normal');
                triggerNotify('All infrastructure telemetry restored to nominal baseline.');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs font-mono transition-all shadow-md shadow-emerald-950"
            >
              <RotateCcw className="w-4 h-4" />
              RESTORE ALL NOMINAL
            </button>
            <button
              onClick={() => onOpenCopilot('What are the critical vulnerabilities and active risks across all facilities?')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs font-mono transition-all shadow-md shadow-purple-950"
            >
              <Bot className="w-4 h-4" />
              AI ROOT AUDIT
            </button>
          </div>
        </div>

        {notificationMsg && (
          <div className="mt-4 p-3 bg-purple-900/60 border border-purple-400 text-purple-100 text-xs font-mono rounded-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {notificationMsg}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-purple-800/40 pt-4">
          <button
            onClick={() => setActiveTab('master_controls')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'master_controls'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-purple-950/40 border border-zinc-800'
            }`}
          >
            <Power className="w-4 h-4" />
            Master Circuit & Power Controls
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'simulator'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-purple-950/40 border border-zinc-800'
            }`}
          >
            <Radio className="w-4 h-4 text-red-400" />
            Physical Incident Injector
          </button>
          <button
            onClick={() => setActiveTab('rbac_matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'rbac_matrix'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-purple-950/40 border border-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            RBAC Authority Matrix ({usersList.length} Accounts)
          </button>
          <button
            onClick={() => setActiveTab('system_logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === 'system_logs'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'bg-zinc-900 text-zinc-300 hover:bg-purple-950/40 border border-zinc-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Super Admin Audit Trail
          </button>
        </div>
      </div>

      {/* TAB 1: MASTER CONTROLS */}
      {activeTab === 'master_controls' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Substation Bus Bar Transfer */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                Substation Feeder A/B Bus
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${substationFeederActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                {substationFeederActive ? 'GRID SYNCHRONIZED' : 'GENERATOR BYPASS'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Primary 33kV utility feeder connection. Flipping switch transfers facility load to N+1 standby diesel generator banks.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <span className="text-xs font-mono text-zinc-300">Feeder Status:</span>
              <button
                onClick={() => {
                  setSubstationFeederActive(!substationFeederActive);
                  triggerNotify(substationFeederActive ? 'Switched to Emergency Generator Bus.' : 'Synchronized with Utility Grid.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                  substationFeederActive ? 'bg-zinc-800 text-amber-300 hover:bg-zinc-700' : 'bg-emerald-700 text-zinc-950'
                }`}
              >
                {substationFeederActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-rose-400" />}
                {substationFeederActive ? 'FORCE GEN BYPASS' : 'RECONNECT GRID'}
              </button>
            </div>
          </div>

          {/* Card 2: CRAC Emergency Overdrive */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <Flame className="w-4 h-4 text-cyan-400" />
                CRAC Emergency 100% CFM
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${cracOverride ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
                {cracOverride ? 'OVERDRIVE ACTIVE' : 'PID CONTROLLED'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Bypasses VFD thermal PID loop to force all 12 CRAC units to maximum 100% blower speed across all aisles.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <span className="text-xs font-mono text-zinc-300">VFD Blower Speed:</span>
              <button
                onClick={() => {
                  setCracOverride(!cracOverride);
                  triggerNotify(cracOverride ? 'Returned CRAC to automatic PID modulation.' : 'Forced 100% CRAC overdrive.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                  cracOverride ? 'bg-cyan-600 text-zinc-950' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {cracOverride ? 'DISABLE OVERDRIVE' : 'ENGAGE 100% CFM'}
              </button>
            </div>
          </div>

          {/* Card 3: Telemetry Polling Rate */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <Activity className="w-4 h-4 text-purple-400" />
                Telemetry Pipeline Rate
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 rounded font-bold">
                {telemetryFrequencySec}s INTERVAL
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Adjusts global SNMPv3 / Redfish / Modbus ingestion cycle frequency across 400+ physical sensors.
            </p>
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800">
              {[1, 3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setTelemetryFrequencySec(sec);
                    triggerNotify(`Telemetry engine ingestion rate set to: ${sec}s`);
                  }}
                  className={`flex-1 py-1 rounded text-xs font-mono font-bold ${
                    telemetryFrequencySec === sec
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Card 4: Autonomous AI Work Order Dispatch */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Autonomous AI Work Orders
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${autoWorkOrderDispatch ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'}`}>
                {autoWorkOrderDispatch ? 'AUTO-DISPATCH' : 'MANUAL APPROVAL'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              When AIOps detects risk &gt; 80%, automatically issues Jira/ServiceNow maintenance work orders.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <span className="text-xs font-mono text-zinc-300">Policy:</span>
              <button
                onClick={() => {
                  setAutoWorkOrderDispatch(!autoWorkOrderDispatch);
                  triggerNotify(`Auto work-order dispatch ${!autoWorkOrderDispatch ? 'ENABLED' : 'DISABLED'}`);
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg font-bold"
              >
                {autoWorkOrderDispatch ? 'SWITCH TO MANUAL' : 'ENABLE AUTONOMOUS'}
              </button>
            </div>
          </div>

          {/* Card 5: CMDB Drift Auto-Reconciliation */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                <Database className="w-4 h-4 text-blue-400" />
                CMDB Drift Reconciliation
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${cmdbAutoReconcile ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-zinc-800 text-zinc-400'}`}>
                {cmdbAutoReconcile ? 'ACTIVE RECONCILE' : 'REPORT ONLY'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Auto-syncs discrepancies between physical BMC Redfish network scans and asset database inventory.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
              <span className="text-xs font-mono text-zinc-300">Reconcile Mode:</span>
              <button
                onClick={() => {
                  setCmdbAutoReconcile(!cmdbAutoReconcile);
                  triggerNotify('CMDB auto-reconciliation mode toggled.');
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg font-bold"
              >
                TOGGLE MODE
              </button>
            </div>
          </div>

          {/* Card 6: Emergency Facility Lockdown */}
          <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Facility Emergency Lockdown
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-700 rounded font-bold">
                ROOT ARMED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Locks all server hall mantrap doors, isolates non-critical compute clusters, and initiates VESDA air sampling.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-rose-900/40">
              <span className="text-xs font-mono text-rose-400">Master Interlock:</span>
              <button
                onClick={() => triggerNotify('⚠️ EMERGENCY DRILL: Mantrap interlocks and fire-suppression pre-actions verified.')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono rounded-lg shadow-md shadow-rose-950"
              >
                TEST INTERLOCK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENT INJECTOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-zinc-200">Real-Time Incident Injection Console</h3>
                <p className="text-xs text-zinc-400">
                  Trigger cascading failures to evaluate correlation engines, thermal physics models, and SLA MTTR.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                handleTriggerScenario('normal');
                triggerNotify('Active incidents cleared. Telemetry normalized.');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-lg border border-zinc-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All to Normal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incident 1: Cooling Loop Failure */}
            <div className="bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 rounded-xl p-5 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Flame className="w-4 h-4" />
                  CRAC-02 Cooling Loop Compressor Failure
                </span>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 text-[10px] font-mono rounded border border-cyan-800">
                  THERMAL CASCADE
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Compressor seizure in CRAC-02 causing Zone A supply temp to surge to 37°C. Inlet temps on Racks R-04 &amp; R-05 rise to 33.8°C with severe hot-air recirculation.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400">Affected: 2 Racks, 14 Servers</span>
                <button
                  onClick={() => handleTriggerScenario('cooling_failure')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs font-mono rounded-lg transition-all"
                >
                  TRIGGER COOLING FAILURE
                </button>
              </div>
            </div>

            {/* Incident 2: Power Spike */}
            <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-5 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  Substation Feeder A Power Spike (990 kW)
                </span>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-mono rounded border border-amber-800">
                  ELECTRICAL SURGE
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Simulates 22% utility grid voltage surge, driving facility load to 990 kW and PUE to 1.54. UPS-01 operates at 90% capacity ceiling with harmonic distortion.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400">Affected: PUE 1.54, UPS-01</span>
                <button
                  onClick={() => handleTriggerScenario('power_spike')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs font-mono rounded-lg transition-all"
                >
                  TRIGGER POWER SPIKE
                </button>
              </div>
            </div>

            {/* Incident 3: UPS Battery Cell Degradation */}
            <div className="bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-5 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <BatteryWarning className="w-4 h-4" />
                  UPS-03 VRLA Battery String Degradation
                </span>
                <span className="px-2 py-0.5 bg-purple-950 text-purple-300 text-[10px] font-mono rounded border border-purple-800">
                  BATTERY CELL DEGRADATION
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Internal cell resistance spikes to 34.8mΩ on String 2B. Battery State of Health drops to 38%, reducing emergency runtime from 28 minutes to 8 minutes.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400">Affected: 8m Runtime remaining</span>
                <button
                  onClick={() => handleTriggerScenario('ups_degradation')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono rounded-lg transition-all"
                >
                  TRIGGER UPS DEGRADATION
                </button>
              </div>
            </div>

            {/* Incident 4: High Compute Load Surge */}
            <div className="bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 rounded-xl p-5 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Server className="w-4 h-4" />
                  High-Density AI Training Compute Surge
                </span>
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 text-[10px] font-mono rounded border border-rose-800">
                  COMPUTE SURGE
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Cluster-wide LLM distributed training run spikes CPU across Racks R-01 through R-04 to 92%, triggering localized hot-aisle air recirculation.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400">Affected: All Zone A Racks</span>
                <button
                  onClick={() => handleTriggerScenario('high_load')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono rounded-lg transition-all"
                >
                  TRIGGER COMPUTE SURGE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC AUTHORITY MATRIX */}
      {activeTab === 'rbac_matrix' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-zinc-200 text-sm">
                Enterprise Role-Based Access Control (RBAC) Master Directory
              </h3>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-950 px-2.5 py-1 rounded border border-purple-800">
              SUPER ADMIN OVERRIDE PRIVILEGES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase">
                <tr>
                  <th className="py-3 px-4">User &amp; Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Current Authority Rank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Root Emergency Access</th>
                  <th className="py-3 px-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                        {usr.role === 'super_admin' && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        {usr.name}
                      </div>
                      <div className="text-[11px] text-zinc-400">{usr.email}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{usr.department}</td>
                    <td className="py-3 px-4">
                      <select
                        value={usr.role}
                        onChange={(e) => handleRoleUpgrade(usr.id, e.target.value as UserRole)}
                        className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 rounded px-2 py-1 focus:outline-none focus:border-purple-500 font-mono"
                      >
                        <option value="super_admin">👑 Super Admin (Full Control)</option>
                        <option value="dc_admin">🛡️ DC Admin</option>
                        <option value="manager">📊 Operations Manager</option>
                        <option value="engineer">🔧 Infrastructure Engineer</option>
                        <option value="technician">⚡ Facility Technician</option>
                        <option value="viewer">👁️ Read-Only Viewer</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          usr.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {usr.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEmergencyAccess(usr.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${
                          usr.emergencyOverride
                            ? 'bg-purple-950 text-purple-300 border border-purple-700'
                            : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {usr.emergencyOverride ? <Lock className="w-3 h-3 text-purple-400" /> : <Unlock className="w-3 h-3 text-zinc-500" />}
                        {usr.emergencyOverride ? 'GRANTED' : 'DENIED'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(usr.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          usr.status === 'active'
                            ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {usr.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUPER ADMIN AUDIT TRAIL */}
      {activeTab === 'system_logs' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-zinc-200 text-sm">Security &amp; Operational Audit Trail</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Cryptographically Signed System Stream</span>
          </div>

          <div className="bg-zinc-950 rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-2 max-h-96 overflow-y-auto border border-zinc-800">
            <div className="text-emerald-400">[ROOT-AUDIT] Super Admin Ashwin T authenticated with Supreme Authority (100% control).</div>
            <div className="text-purple-400">[RBAC-POLICY] System authority hierarchy enforced: Super Admin &gt; DC Admin &gt; Manager &gt; Engineer &gt; Technician &gt; Viewer.</div>
            <div className="text-zinc-400">[TELEMETRY-STREAM] Ingesting 412 physical metrics via SNMPv3 and Redfish BMC adapters.</div>
            <div className="text-amber-400">[SUBSTATION-FEEDER] 33kV utility feed synchronized; Standby Generator N+1 banks primed.</div>
            <div className="text-cyan-400">[CRAC-CONTROLS] 12 CRAC units operating with active thermal containment balancing.</div>
            <div className="text-zinc-400">[NEURAL-ANOMALY] Multi-variate deviation scoring active with 0.94 sensitivity index.</div>
            <div className="text-emerald-400">[SECURITY-AUDIT] Zero unauthorized privilege escalations detected across all clusters.</div>
          </div>
        </div>
      )}
    </div>
  );
};
