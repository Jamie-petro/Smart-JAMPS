import React from 'react';
import { Compass, FileText, Moon, Sun, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenExport: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onRunAIAudit: () => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  isDark,
  toggleTheme,
  onRunAIAudit,
  isAnalyzing
}) => {
  const navItems = [
    { id: 'overview', label: 'Proposal Dossier' },
    { id: 'timeline', label: 'Clearance Roadmap' },
    { id: 'agencies', label: 'Agency Matrix' },
    { id: 'funding', label: 'Funding & Co-Eligibility' },
    { id: 'archives', label: 'NLB Heritage Archives' },
    { id: 'ai-audit', label: 'AI Proposal Enhancer' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-rose-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                Arts to Places
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-normal block">
                Singapore Placemaking Navigator
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Theme toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="https://share.gemini.google/3iOhLJGpEr7L"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors border border-rose-200/80 dark:border-rose-900/60"
              title="Open Arts Placemaking AI Navigator in Google Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Gemini Session</span>
              <ExternalLink className="w-3 h-3 text-rose-500" />
            </a>

            <button
              onClick={onOpenExport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200/60 dark:border-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Dossier</span>
            </button>

            <button
              onClick={onRunAIAudit}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 active:scale-95 rounded-lg transition-all shadow-sm disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Auditing...' : 'Run AI Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-200/60 dark:border-slate-800 gap-1 scrollbar-none">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === item.id
                ? 'bg-rose-700 text-white'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
