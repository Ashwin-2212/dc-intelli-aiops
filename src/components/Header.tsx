import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Play,
  Pause,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Zap,
  Crown,
  User,
  LogOut,
  ChevronDown,
  Clock,
  ShieldCheck,
  Building2,
  Brain,
  Wrench,
  Database,
} from 'lucide-react';
import { TelemetryEngine } from '../services/telemetrySimulator';
import { UserRole, SimulationScenario } from '../types';
import { useAuth } from '../auth/AuthContext';
import { ROLE_CONFIGS } from '../auth/authConfig';
import { RoleType } from '../auth/types';
import { systemService } from '../services/api';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenCopilot: () => void;
  onOpenSimulationModal?: () => void;
  onSearchSelect?: (query: string) => void;
  activeView?: string;
  setActiveView?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole = 'super_admin',
  onRoleChange,
  onOpenCopilot,
  onOpenSimulationModal,
  onSearchSelect,
  activeView = 'super-admin',
  setActiveView,
}) => {
  const engine = TelemetryEngine.getInstance();
  const facility = engine.facilities[0];
  const activeAnomaliesCount = engine.anomalies.filter((a) => a.status === 'active').length;
  const isRunning = engine.isRunning;
  const currentScenario = engine.currentScenario;

  const { user, role: authRole, logout, switchRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Live MongoDB connection status
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; database?: string; pingMs?: number }>({ connected: false });

  useEffect(() => {
    let isMounted = true;
    const checkDb = async () => {
      try {
        const start = performance.now();
        const res = await systemService.getHealth();
        const pingMs = Math.round(performance.now() - start);
        if (isMounted) {
          const isConnected = Boolean(
            res && (
              res.database?.connected === true ||
              res.database?.state === 'connected' ||
              res.database?.status === 'connected' ||
              res.status === 'ok'
            )
          );
          if (isConnected) {
            setDbStatus({
              connected: true,
              database: res.database?.databaseName || res.database?.database || 'data_center_aiops',
              pingMs,
            });
          } else {
            setDbStatus({ connected: false });
          }
        }
      } catch {
        if (isMounted) setDbStatus({ connected: false });
      }
    };

    checkDb();
    const interval = setInterval(checkDb, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getScenarioBadge = (sc: SimulationScenario) => {
    switch (sc) {
      case 'cooling_failure':
        return {
          label: 'CRAC-02 FAULT SIMULATION',
          color: 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse',
        };
      case 'high_load':
        return {
          label: 'HIGH COMPUTE SURGE',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        };
      case 'power_spike':
        return {
          label: 'POWER GRID TRANSIENT',
          color: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
        };
      case 'ups_degradation':
        return {
          label: 'UPS BATTERY DEGRADATION',
          color: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
        };
      default:
        return {
          label: 'NORMAL OPERATION',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const scenarioInfo = getScenarioBadge(currentScenario);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSelect) {
      onSearchSelect(searchQuery.trim());
      setSearchQuery('');
    }
  };

  // User display metadata
  const effectiveRole: RoleType = (authRole as RoleType) || (currentRole === 'super_admin' ? 'ADMIN' : 'MANAGER');
  const roleConfig = ROLE_CONFIGS[effectiveRole] || ROLE_CONFIGS.ADMIN;
  const userName = user?.name || (effectiveRole === 'ADMIN' ? 'Ashwin T' : 'Operations Lead');
  const userTitle = user?.title || roleConfig.subtitle;
  const lastLoginTime = user?.lastLogin || '12:00 UTC';

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#09090c]/95 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0 shrink-0">
      {/* Left: Quick Status Metrics */}
      <div className="flex items-center gap-6">
        {/* Stream Live Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRunning ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
            {isRunning ? 'Telemetry Live' : 'Simulation Paused'}
          </span>
        </div>

        {/* MongoDB Connection Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            dbStatus.connected
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
          }`}
          title={
            dbStatus.connected
              ? `Connected to MongoDB database: ${dbStatus.database || 'data_center_aiops'} (${dbStatus.pingMs}ms ping)`
              : 'Connecting to MongoDB...'
          }
        >
          <Database className={`w-3.5 h-3.5 ${dbStatus.connected ? 'text-emerald-400' : 'text-zinc-500'}`} />
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              {dbStatus.connected ? 'MongoDB Live' : 'Connecting...'}
            </span>
          </span>
        </div>

        {/* DC Health */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900/60 border border-zinc-800/60 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Health</span>
          <span
            className={`text-xs font-bold font-mono ${
              facility.overallHealth > 80
                ? 'text-emerald-400'
                : facility.overallHealth > 65
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {facility.overallHealth}%
          </span>
          <div className="flex gap-0.5">
            <div className={`w-1 h-3 rounded-xs ${facility.overallHealth > 50 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
            <div className={`w-1 h-3 rounded-xs ${facility.overallHealth > 75 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
            <div className={`w-1 h-3 rounded-xs ${facility.overallHealth > 85 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
          </div>
        </div>

        {/* PUE Quick */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-900/60 border border-zinc-800/60 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">PUE</span>
          <span className="text-xs font-bold font-mono text-zinc-100">{facility.pue.toFixed(2)}</span>
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase ${
              facility.pue <= 1.4 ? 'text-emerald-400' : facility.pue <= 1.55 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {facility.pue <= 1.4 ? 'Optimal' : facility.pue <= 1.55 ? 'Nominal' : 'High'}
          </span>
        </div>

        {/* Live Fault Scenario Badge */}
        <button
          onClick={onOpenSimulationModal}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium transition-all hover:opacity-90 ${scenarioInfo.color}`}
          title="Click to change simulation fault scenario"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          <span>{scenarioInfo.label}</span>
          <Sliders className="w-3 h-3 ml-0.5 opacity-70" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-6 hidden xl:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search racks, cooling units, incidents, or ask copilot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:border-purple-500 transition-colors font-sans"
          />
        </form>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Simulation Pause/Play Toggle */}
        <button
          onClick={() => engine.toggleRunning()}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
            isRunning
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
          title={isRunning ? 'Pause real-time telemetry stream' : 'Resume real-time telemetry stream'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
          <span className="hidden sm:inline">{isRunning ? 'Pause Tick' : 'Resume Tick'}</span>
        </button>

        {/* AI Anomalies Pill Button */}
        <button
          onClick={() => setActiveView && setActiveView('anomalies')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeAnomaliesCount > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>{activeAnomaliesCount}</span>
          <span className="hidden sm:inline">Anomalies</span>
        </button>

        {/* Gemini AIOps Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:from-purple-500 hover:to-indigo-500 transition-all font-sans"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">AIOps Copilot</span>
        </button>

        {/* Enterprise Authenticated User Profile Badge & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            aria-expanded={isProfileMenuOpen}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 rounded-xl transition-all select-none group focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {user?.avatar ? user.avatar : effectiveRole === 'ADMIN' ? '👑' : userName.slice(0, 2).toUpperCase()}
            </div>

            {/* Name and Role */}
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors truncate max-w-[120px]">
                {userName}
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${roleConfig.color.badge}`}>
                  {roleConfig.title}
                </span>
              </div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0c0c12] border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              {/* Profile Top Section */}
              <div className="flex items-start gap-3 pb-3 border-b border-zinc-800/80">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-base font-bold shadow-md shrink-0">
                  {user?.avatar || '👑'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{userName}</h4>
                  <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'admin@dcintelli.local'}</p>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5 truncate">{userTitle}</p>
                </div>
              </div>

              {/* Role & Session Details */}
              <div className="py-3 border-b border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Role Tier:
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${roleConfig.color.badge}`}>
                    {roleConfig.title}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    Last Login:
                  </span>
                  <span className="text-[11px] font-mono text-zinc-300">{lastLoginTime}</span>
                </div>
              </div>

              {/* Quick Role Switcher for Testing Prototype */}
              <div className="py-2.5 border-b border-zinc-800/80">
                <div className="text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1.5">
                  Switch Active Role (Demo)
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                  {(['ADMIN', 'MANAGER', 'ENGINEER', 'ANALYST'] as RoleType[]).map((r) => {
                    const isSelected = effectiveRole === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          if (onRoleChange) {
                            onRoleChange(r === 'ADMIN' ? 'super_admin' : r.toLowerCase() as UserRole);
                          }
                          setIsProfileMenuOpen(false);
                        }}
                        className={`px-2 py-1 rounded text-left border transition-all ${
                          isSelected
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {r === 'ADMIN' ? '👑 Admin' : r === 'MANAGER' ? '🏢 Manager' : r === 'ENGINEER' ? '⚡ Engineer' : '🧠 Analyst'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-rose-800/40 rounded-xl text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

