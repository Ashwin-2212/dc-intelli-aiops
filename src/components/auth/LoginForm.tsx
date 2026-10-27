import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { RoleType } from '../../auth/types';
import { RoleSelector } from './RoleSelector';
import { DEMO_ACCOUNTS } from '../../auth/authConfig';
import { useAuth } from '../../auth/AuthContext';

interface LoginFormProps {
  onSuccess: (role: RoleType) => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onForgotPassword }) => {
  const { login } = useAuth();

  // Form State - Default role is Data Center Manager
  const [selectedRole, setSelectedRole] = useState<RoleType>('MANAGER');
  const [email, setEmail] = useState<string>('manager@dcintelli.local');
  const [password, setPassword] = useState<string>('Manager@123');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status & Validation State
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; role?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string; role?: string } = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      errors.password = 'Please enter your password.';
    } else if (password.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    // Role validation
    if (!selectedRole) {
      errors.role = 'Please select a role.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (status === 'loading' || status === 'success') return;

    if (!validateForm()) {
      return;
    }

    setStatus('loading');

    try {
      const result = await login({
        email: email.trim(),
        password,
        role: selectedRole,
        rememberMe,
      });

      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          onSuccess(selectedRole);
        }, 600);
      } else {
        setStatus('error');
        setFormError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setStatus('error');
      setFormError('An unexpected error occurred. Please try again.');
    }
  };

  // Quick fill demo helper
  const handleQuickFill = (role: RoleType) => {
    const demo = DEMO_ACCOUNTS[role];
    if (demo) {
      setSelectedRole(role);
      setEmail(demo.user.email);
      setPassword(demo.password);
      setFieldErrors({});
      setFormError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Credentials Quick-Select Pill Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Quick Demo Autofill
          </span>
          <span className="text-xs text-zinc-400 font-mono font-semibold">1-Click Test</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(DEMO_ACCOUNTS) as RoleType[]).map((r) => {
            const isCurrent = selectedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleQuickFill(r)}
                className={`text-xs font-mono font-bold py-2.5 px-2.5 rounded-xl border transition-all text-center truncate cursor-pointer ${
                  isCurrent
                    ? 'bg-purple-950/90 border-purple-400 text-purple-100 shadow-md ring-1 ring-purple-400'
                    : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-200 hover:text-white hover:bg-zinc-700/80'
                }`}
                title={`Autofill ${DEMO_ACCOUNTS[r].user.name} (${r})`}
              >
                {r === 'ADMIN' ? '👑 Admin' : r === 'MANAGER' ? '🏢 Manager' : r === 'ENGINEER' ? '⚡ Engineer' : '🧠 Analyst'}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Global Error Banner */}
        {formError && (
          <div
            role="alert"
            className="p-3.5 bg-rose-950/50 border border-rose-500/60 rounded-xl flex items-start gap-3 text-rose-200 text-sm animate-in fade-in slide-in-from-top-1"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-sans font-medium">{formError}</div>
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="block text-sm font-bold text-zinc-200 font-mono">
            Work Email Address <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="name@dcintelli.local"
              className={`w-full bg-zinc-900 border rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-all font-sans focus:outline-none ${
                fieldErrors.email
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/40'
                  : 'border-zinc-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-rose-300 font-sans mt-1 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="auth-password" className="block text-sm font-bold text-zinc-200 font-mono">
              Password <span className="text-purple-400">*</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-purple-300 hover:text-purple-200 transition-colors font-sans hover:underline focus:outline-none cursor-pointer font-semibold"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              disabled={status === 'loading' || status === 'success'}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••••••"
              className={`w-full bg-zinc-900 border rounded-xl pl-12 pr-12 py-3 text-sm text-white placeholder-zinc-500 transition-all font-sans focus:outline-none ${
                fieldErrors.password
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/40'
                  : 'border-zinc-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1.5 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-rose-300 font-sans mt-1 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4.5 h-4.5 rounded bg-zinc-900 border-zinc-600 text-purple-600 focus:ring-purple-500/40 focus:ring-offset-0 focus:ring-offset-zinc-950 cursor-pointer accent-purple-600"
          />
          <label htmlFor="remember-me" className="text-sm text-zinc-300 select-none cursor-pointer font-sans">
            Remember my session on this device
          </label>
        </div>

        {/* Role Selection UX */}
        <div className="pt-2">
          <RoleSelector
            selectedRole={selectedRole}
            onSelectRole={(r) => {
              setSelectedRole(r);
              if (fieldErrors.role) setFieldErrors((prev) => ({ ...prev, role: undefined }));
              const demo = DEMO_ACCOUNTS[r];
              if (demo && (email.endsWith('@dcintelli.local') || !email)) {
                setEmail(demo.user.email);
                setPassword(demo.password);
              }
            }}
            disabled={status === 'loading' || status === 'success'}
          />
          {fieldErrors.role && (
            <p className="text-xs text-rose-300 font-sans mt-1.5 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fieldErrors.role}
            </p>
          )}
        </div>

        {/* Sign In Primary Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`w-full py-4 px-6 rounded-2xl text-base font-extrabold font-sans tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 mt-5 shadow-xl select-none outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 cursor-pointer ${
            status === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-950/60'
              : status === 'loading'
              ? 'bg-purple-700/90 text-purple-100 cursor-wait'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/70 hover:shadow-purple-900/80 active:scale-[0.99]'
          }`}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-purple-200" />
              <span>Signing in...</span>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Signed In — Initializing Dashboard...</span>
            </>
          ) : (
            <>
              <span>Sign In to Platform</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
