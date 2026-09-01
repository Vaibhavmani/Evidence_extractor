import React from 'react';
import { ShieldCheck, Trash2, HardDrive } from 'lucide-react';

interface NavbarProps {
  onClearData: () => void;
  hasLoadedFile: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onClearData, hasLoadedFile }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-500/10 p-2 rounded-xl border border-brand-500/20 text-brand-500">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Secure Excel Media Extractor
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-normal">
                v1.0 Local Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400">Zero-cloud local processing engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local Processing Active (0 Uploads)</span>
          </div>

          {hasLoadedFile && (
            <button
              onClick={onClearData}
              className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              title="Wipe parsed workbooks and extracted blobs from memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
