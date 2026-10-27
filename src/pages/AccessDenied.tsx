import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLE_CONFIGS } from '../auth/authConfig';
import { getDefaultLandingView } from '../auth/permissions';

interface AccessDeniedProps {
  onReturnToDashboard: () => void;
  restrictedViewName?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  onReturnToDashboard,
  restrictedViewName,
}) => {
  const { user, role } = useAuth();
  const roleConfig = role ? ROLE_CONFIGS[role] : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[#0c0c12] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Top Warning Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/50">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Security Boundary Enforced
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Your current account credentials and role clearance level do not authorize access to this facility control module or administrative resource.
          </p>
        </div>

        {/* Context Information Box */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-400">Authenticated User:</span>
            <span className="text-zinc-200 font-bold">{user?.name || 'Authorized Operator'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-zinc-400">Assigned Privilege Tier:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${roleConfig?.color.badge || 'text-zinc-300'}`}>
              {roleConfig?.title || role || 'STANDARD'}
            </span>
          </div>
          {restrictedViewName && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Target Resource:</span>
              <span className="text-amber-400 font-semibold">{restrictedViewName}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReturnToDashboard}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
