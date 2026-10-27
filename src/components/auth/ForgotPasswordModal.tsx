import React, { useEffect, useRef } from 'react';
import { KeyRound, X, Mail, ShieldAlert, CheckCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0c0c10] border border-zinc-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Subtle decorative gradient top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-orange-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 id="forgot-password-title" className="text-base font-bold text-white tracking-tight">
              Password Recovery
            </h3>
            <p className="text-xs text-zinc-400">Enterprise Access Security</p>
          </div>
        </div>

        {/* Notice Body */}
        <div className="space-y-4 text-xs text-zinc-300">
          <div className="p-3.5 bg-zinc-900/90 border border-zinc-800/90 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-200">
                Password recovery is not connected in the prototype.
              </p>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Automated self-service password reset is disabled for mission-critical data center access.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold">
              Action Required
            </div>
            <p className="text-zinc-300">
              Contact your system administrator or the NOC Security Operations Desk to request a credential reset or temporary bypass token.
            </p>
            <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Admin Desk:</span>
              <span className="text-purple-300 font-semibold">admin@dcintelli.local</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors border border-zinc-700"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
