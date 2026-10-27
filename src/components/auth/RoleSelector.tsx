import React from 'react';
import { Shield, Building2, Activity, Brain, Check } from 'lucide-react';
import { RoleType } from '../../auth/types';
import { ROLE_CONFIGS } from '../../auth/authConfig';

interface RoleSelectorProps {
  selectedRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  disabled?: boolean;
}

const roleIcons: Record<RoleType, React.ElementType> = {
  ADMIN: Shield,
  MANAGER: Building2,
  ENGINEER: Activity,
  ANALYST: Brain,
};

const roles: RoleType[] = ['ADMIN', 'MANAGER', 'ENGINEER', 'ANALYST'];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, role: RoleType, index: number) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectRole(role);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % roles.length;
      onSelectRole(roles[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + roles.length) % roles.length;
      onSelectRole(roles[prevIndex]);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">
          Sign In As <span className="text-purple-400">*</span>
        </label>
        <span className="text-xs font-mono text-zinc-400 font-medium">Select assigned role</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select System Role"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {roles.map((roleKey, idx) => {
          const config = ROLE_CONFIGS[roleKey];
          const Icon = roleIcons[roleKey];
          const isSelected = selectedRole === roleKey;

          return (
            <div
              key={roleKey}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : isSelected ? 0 : -1}
              onClick={() => !disabled && onSelectRole(roleKey)}
              onKeyDown={(e) => handleKeyDown(e, roleKey, idx)}
              className={`relative flex items-start gap-3.5 p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isSelected
                  ? 'bg-purple-950/50 border-purple-400 shadow-xl shadow-purple-950/60 ring-1 ring-purple-400'
                  : 'bg-zinc-900/90 border-zinc-750 hover:bg-zinc-800/80 hover:border-zinc-600'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-purple-500/30 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-zinc-800 text-zinc-300 group-hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-bold tracking-tight truncate ${
                      isSelected ? 'text-white' : 'text-zinc-200'
                    }`}
                  >
                    {config.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-snug mt-1 line-clamp-1">
                  {config.subtitle}
                </p>
              </div>

              {/* Selected Checkmark Indicator */}
              <div
                className={`absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-purple-500 text-white shadow-sm ring-2 ring-purple-400'
                    : 'border border-zinc-600 bg-zinc-900/60 opacity-40'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
