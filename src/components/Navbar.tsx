import React from 'react';
import { Activity, Database, GitMerge, Sliders, Play, Settings } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  r2Score: number;
}

export default function Navbar({ activeSection, onNavigate, r2Score }: NavbarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: GitMerge },
    { id: 'dataset', label: 'Dataset', icon: Database },
    { id: 'preprocessing', label: 'Preprocessing', icon: Settings },
    { id: 'training', label: 'Model Training', icon: Play },
    { id: 'predict', label: 'Predict Price', icon: Sliders },
    { id: 'experiments', label: 'Experiments', icon: Activity },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div 
          onClick={() => onNavigate('overview')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="nav-brand"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 group-hover:border-emerald-400 transition-colors">
            <span className="text-emerald-400 font-mono text-sm font-bold">L²</span>
          </div>
          <div>
            <h1 className="text-white font-sans font-semibold text-base leading-none tracking-tight">
              Linear Regression Lab
            </h1>
            <span className="text-slate-400 text-xs font-mono">Boston Housing (MEDV) simulator</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-1.5" id="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Quick status pill */}
        <div className="hidden lg:flex items-center gap-3" id="nav-status">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 text-[11px] font-mono rounded-full border border-slate-800 text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Compiled OLS Model: <strong className="text-white">R² = {r2Score.toFixed(3)}</strong>
          </div>
        </div>
      </div>
    </nav>
  );
}
