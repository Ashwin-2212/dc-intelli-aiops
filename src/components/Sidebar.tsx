import React from 'react';
import {
  Activity,
  Layers,
  Server,
  Cpu,
  Thermometer,
  Zap,
  BatteryCharging,
  AlertTriangle,
  Flame,
  TrendingUp,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  Settings,
  GitBranch,
  GitMerge,
  Wrench,
  Boxes,
  Crown,
  Briefcase,
  Monitor,
  Radio,
  History,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../auth/AuthContext';
import { RoleType } from '../auth/types';
import { ROLE_CONFIGS } from '../auth/authConfig';
import { canRoleAccessView } from '../auth/permissions';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  currentRole = 'super_admin',
}) => {
  const { user, role: authRole, logout } = useAuth();

  // Normalize effective role
  const effectiveRole: RoleType =
    (authRole as RoleType) ||
    (currentRole === 'super_admin'
      ? 'ADMIN'
      : currentRole === 'manager'
      ? 'MANAGER'
      : currentRole === 'engineer'
      ? 'ENGINEER'
      : currentRole === 'viewer'
      ? 'ANALYST'
      : 'ADMIN');

  const roleConfig = ROLE_CONFIGS[effectiveRole] || ROLE_CONFIGS.ADMIN;

  const rawSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        {
          id: 'overview',
          label: 'Executive Cockpit',
          icon: Crown,
          color: 'text-purple-400',
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE & DIGITAL TWIN',
      items: [
        {
          id: 'digital-twin',
          label: 'Visual Digital Twin',
          icon: Layers,
          color: 'text-cyan-400',
        },
        {
          id: 'racks',
          label: 'Rack Matrix (42U)',
          icon: Boxes,
          color: 'text-blue-400',
        },
        {
          id: 'cooling',
          label: 'Cooling Intelligence',
          icon: Thermometer,
          color: 'text-sky-400',
        },
        {
          id: 'power',
          label: 'Power & Electrical (PUE)',
          icon: Zap,
          color: 'text-amber-400',
        },
      ],
    },
    {
      title: 'AI & PREDICTIVE INTELLIGENCE',
      items: [
        {
          id: 'telemetry-live',
          label: 'Live Telemetry Stream',
          icon: Activity,
          color: 'text-orange-400',
        },
        {
          id: 'anomalies',
          label: 'AI Anomaly Radar',
          icon: AlertTriangle,
          color: 'text-rose-400',
        },
        {
          id: 'predictive',
          label: 'Predictive Failure',
          icon: Flame,
          color: 'text-red-400',
        },
        {
          id: 'root-cause',
          label: 'Neural Root Cause (RCA)',
          icon: GitBranch,
          color: 'text-purple-400',
        },
        {
          id: 'what-if',
          label: 'What-If Capacity Sandbox',
          icon: SlidersHorizontal,
          color: 'text-emerald-400',
        },
      ],
    },
    {
      title: 'GOVERNANCE & ACTION',
      items: [
        {
          id: 'incidents',
          label: 'Maintenance & Work Orders',
          icon: Wrench,
          color: 'text-amber-400',
        },
        {
          id: 'reports',
          label: 'Audit & PDF Compliance',
          icon: FileText,
          color: 'text-blue-400',
        },
      ],
    },
  ];

  // Dynamically filter sections and items based on role permissions
  const filteredSections = rawSections
    .map((section) => {
      const allowedItems = section.items.filter((item) => {
        const itemWithRoles = item as { id: string; label: string; icon: any; color?: string; roles?: string[] };
        if (itemWithRoles.roles && !itemWithRoles.roles.includes(effectiveRole)) {
          return false;
        }
        return canRoleAccessView(effectiveRole, item.id);
      });
      return {
        ...section,
        items: allowedItems,
      };
    })
    .filter((section) => section.items.length > 0);

  const currentBadge = {
    label: roleConfig.title.toUpperCase(),
    color: roleConfig.color.badge,
  };

  const displayName = user?.name || (effectiveRole === 'ADMIN' ? 'Ashwin T' : 'Operations User');
  const displayTitle = user?.title || roleConfig.subtitle;

  return (
    <aside className="w-72 bg-[#08080c]/90 backdrop-blur-2xl border-r border-white/[0.07] flex flex-col h-full shrink-0 select-none shadow-[4px_0_30px_rgba(0,0,0,0.5)] z-10">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.35)] ring-1 ring-white/20">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent font-black tracking-tight text-base">
                DC-Intelli
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gradient-to-r from-purple-500/20 to-orange-500/20 text-orange-300 font-mono font-bold border border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.2)]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wide">Autonomous AIOps DCIM</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold px-3 py-1 font-mono flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>{section.title}</span>
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isSuper = item.id === 'super-admin';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? isSuper
                        ? 'bg-purple-950/70 text-purple-200 border border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.25)] font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-purple-400 before:to-indigo-500 before:shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                        : 'bg-gradient-to-r from-orange-500/15 via-white/[0.04] to-transparent text-white border border-white/[0.1] shadow-[0_0_20px_rgba(249,115,22,0.12)] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-orange-500 before:to-amber-400 before:shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                      : isSuper
                      ? 'text-purple-300 hover:bg-purple-950/30 border border-purple-900/30'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? isSuper
                            ? 'bg-purple-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            : 'bg-orange-500/20 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                          : 'bg-white/[0.02] group-hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors ${
                          isActive
                            ? isSuper
                              ? 'text-amber-400'
                              : 'text-orange-400'
                            : (item as any).color || 'text-zinc-400 group-hover:text-zinc-200'
                        }`}
                      />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Role Profile Box at Bottom */}
      <div className="p-3 border-t border-white/[0.07] bg-[#07070a]/90">
        <div className="p-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">
              System Authority
            </span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${currentBadge.color}`}>
              {currentBadge.label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 shadow-md ring-1 ring-white/10 ${
                  effectiveRole === 'ADMIN'
                    ? 'bg-purple-950/80 border-purple-500/60 text-amber-400 shadow-purple-950/50'
                    : 'bg-zinc-800/80 border-zinc-700/80 text-orange-400'
                }`}
              >
                {user?.avatar || (effectiveRole === 'ADMIN' ? <Crown className="w-4 h-4 fill-amber-400" /> : effectiveRole.slice(0, 2))}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-zinc-200 truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">
                  {displayTitle}
                </div>
              </div>
            </div>

            {/* Quick Logout button in sidebar */}
            <button
              onClick={logout}
              title="Sign Out Session"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/20 transition-all shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

