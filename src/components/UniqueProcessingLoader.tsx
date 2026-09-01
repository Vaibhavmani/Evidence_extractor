import React from 'react';
import { Database, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

interface UniqueProcessingLoaderProps {
  message: string;
  subtext?: string;
}

export const UniqueProcessingLoader: React.FC<UniqueProcessingLoaderProps> = ({
  message,
  subtext = 'Processing data locally inside your browser memory...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      {/* Unique Animated Loader Graphic */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Ambient Backlight Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/30 via-emerald-500/20 to-purple-500/30 blur-xl animate-pulse" />

        {/* Outer Orbiting Ring 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-brand-500/40 animate-[spin_8s_linear_infinite]" />

        {/* Outer Counter-Spinning Pulsing Ring 2 */}
        <div className="absolute inset-2 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-brand-400 border-l-transparent animate-[spin_3s_linear_infinite_reverse]" />

        {/* Glowing Radar Pulse Wave */}
        <div className="absolute inset-4 rounded-full border border-brand-400/20 bg-brand-500/5 animate-ping opacity-30" />

        {/* Center Tech Core Container */}
        <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-brand-500/40 shadow-xl shadow-brand-500/20 flex items-center justify-center overflow-hidden">
          {/* Animated Scanning Beam line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-400/30 to-transparent animate-[translateY_2s_ease-in-out_infinite]" />

          {/* Central Hardware Core Icon */}
          <Database className="w-7 h-7 text-brand-400 animate-pulse relative z-10" />
        </div>

        {/* Orbiting Satellite Dot 1 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[ping_1.5s_infinite]" />

        {/* Orbiting Satellite Dot 2 */}
        <div className="absolute bottom-1 right-2 w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_8px_#38bdf8]" />
      </div>

      {/* Dynamic Status Text */}
      <div className="space-y-1.5 max-w-sm mx-auto">
        <p className="text-sm font-bold text-slate-100 flex items-center justify-center gap-2">
          <Cpu className="w-4 h-4 text-brand-400 animate-pulse" />
          <span>{message}</span>
        </p>
        {subtext && (
          <p className="text-xs text-slate-400 font-medium">
            {subtext}
          </p>
        )}
      </div>

      {/* Security Status Capsule */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>100% Local Encrypted Parsing Active</span>
      </div>
    </div>
  );
};
