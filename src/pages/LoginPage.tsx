import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Activity,
  ShieldCheck,
  Zap,
  Radio,
  Sparkles,
  Server,
  Lock,
  Cpu,
  Layers,
  Thermometer,
} from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { RoleType } from '../auth/types';

interface LoginPageProps {
  onLoginSuccess: (role: RoleType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle animated data center telemetry canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes representing sensor telemetry points
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      type: 'server' | 'cooling' | 'power';
    }

    const nodes: Node[] = Array.from({ length: 32 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 2 + 1.5,
      alpha: Math.random() * 0.5 + 0.3,
      type: i % 3 === 0 ? 'server' : i % 3 === 1 ? 'cooling' : 'power',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle isometric grid lines
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 45;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw connections between close nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);

        if (node.type === 'cooling') {
          ctx.fillStyle = `rgba(6, 182, 212, ${node.alpha})`;
        } else if (node.type === 'power') {
          ctx.fillStyle = `rgba(245, 158, 11, ${node.alpha})`;
        } else {
          ctx.fillStyle = `rgba(168, 85, 247, ${node.alpha})`;
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050508] text-zinc-100 flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans selection:bg-purple-500 selection:text-white">
      {/* Container with subtle glow frame */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-[#09090e] border border-zinc-800 shadow-2xl shadow-purple-950/20 overflow-hidden relative">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Enterprise Data Center Brand & Live Telemetry Visual */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 p-8 sm:p-10 lg:p-14 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800 bg-gradient-to-br from-[#0b0b14] via-[#090910] to-[#06060a] overflow-hidden">
          {/* Background Canvas */}
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* Radial Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Brand Header */}
          <div className="relative z-10 space-y-7">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 bg-gradient-to-br from-purple-600 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-400/40">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">DC-Intelli</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-sm text-zinc-400 font-mono mt-0.5">Autonomous DCIM & AIOps Platform</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Intelligent Observability for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-orange-300 to-amber-400">
                  Modern Data Centers
                </span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-lg">
                Continuous telemetry, predictive thermal modeling, PUE energy optimization, and closed-loop AIOps for mission-critical digital infrastructure.
              </p>
            </div>
          </div>

          {/* Middle: Live System Indicators */}
          <div className="relative z-10 my-10 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
              Live Telemetry Core Status
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Infrastructure Online */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xs flex items-center gap-3 shadow-sm">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <div className="text-sm font-bold text-white">Infrastructure</div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold">Online 99.999%</div>
                </div>
              </div>

              {/* Telemetry Connected */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xs flex items-center gap-3 shadow-sm">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <div>
                  <div className="text-sm font-bold text-white">Telemetry</div>
                  <div className="text-xs font-mono text-cyan-400 font-semibold">Connected 100Hz</div>
                </div>
              </div>

              {/* AI Engine Ready */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xs flex items-center gap-3 shadow-sm">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <div>
                  <div className="text-sm font-bold text-white">AI Engine</div>
                  <div className="text-xs font-mono text-purple-400 font-semibold">Ready Gemini 3.7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Technical Capability Highlights */}
          <div className="relative z-10 pt-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-300 font-semibold">
            <span className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              42U Matrix Telemetry
            </span>
            <span className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Thermal Drift Radar
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              PUE 1.18 Target
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Enterprise Authentication Card */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 p-8 sm:p-10 lg:p-14 flex flex-col justify-between bg-[#08080c] relative">
          <div>
            {/* Card Header */}
            <div className="mb-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-purple-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Enterprise Portal Access
                </span>
                <span className="text-xs text-zinc-400 font-mono font-semibold">v2.4.0-PRO</span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight text-white">Sign in to your workspace</h3>
              <p className="text-sm text-zinc-300">
                Enter your authorized credentials and select your role privilege tier.
              </p>
            </div>

            {/* Login Form */}
            <LoginForm
              onSuccess={onLoginSuccess}
              onForgotPassword={() => setIsForgotModalOpen(true)}
            />
          </div>

          {/* Security-Style UX Footer */}
          <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-400 font-sans">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-300" />
              <span className="text-zinc-300 font-semibold">Protected workspace</span>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Your session is securely managed.
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};
