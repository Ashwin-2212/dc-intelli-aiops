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
    <aside className="w-72 bg-[#0a0a0c] border-r border-zinc-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold tracking-tight text-base">DC-Intelli</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">Autonomous DCIM</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold px-3 py-1 font-mono">
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isSuper = item.id === 'super-admin';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? isSuper
                        ? 'bg-purple-950/90 text-purple-200 border border-purple-500/80 shadow-md shadow-purple-950 font-bold'
                        : 'bg-zinc-800/90 text-white border border-zinc-700/80 shadow-xs'
                      : isSuper
                      ? 'text-purple-300 hover:bg-purple-950/30 border border-purple-900/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? isSuper
                            ? 'text-amber-400'
                            : 'text-orange-400'
                          : (item as any).color || 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Role Profile Box at Bottom */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#09090c]">
        <div className="p-2.5 bg-zinc-900/80 border border-zinc-800/70 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-wider">
              System Authority
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${currentBadge.color}`}>
              {currentBadge.label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${
                  effectiveRole === 'ADMIN'
                    ? 'bg-purple-950 border-purple-500 text-amber-400'
                    : 'bg-zinc-800 border-zinc-700 text-orange-400'
                }`}
              >
                {user?.avatar || (effectiveRole === 'ADMIN' ? <Crown className="w-3.5 h-3.5 fill-amber-400" /> : effectiveRole.slice(0, 2))}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-zinc-200 truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">
                  {displayTitle}
                </div>
              </div>
            </div>

            {/* Quick Logout button in sidebar */}
            <button
              onClick={logout}
              title="Sign Out Session"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

