import React from 'react';
import { Volume2, VolumeX, Sparkles, ShieldCheck, Search, Globe, Sun, Moon } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';
import { liveEngine } from '../services/liveEngine';
import type { Theme } from '../utils/theme';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          
          {/* Brand Logo & Nepali Flag */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <NepaliFlag size="md" className="hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center font-sans">
                    <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">
                      Bhakundo
                    </span>
                    <span className="text-red-600 dark:text-red-500 text-sm ml-1.5 hidden sm:inline-block font-semibold">
                      ({t.appName === 'भाकुण्डो' ? 'Bhakundo' : 'भाकुण्डो'})
                    </span>
                  </span>
                  
                  {/* Pulsing live indicator ball */}
                  <span className="relative flex h-2.5 w-2.5 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold hidden md:block">
                  {t.tagline}
                </span>
              </div>
            </div>

            {/* AD-FREE GUARANTEE BADGE */}
            <div 
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-sm cursor-default"
              title={t.adFreeTooltip}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.adFreeBadge}</span>
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-700/70 focus:border-red-500 dark:focus:border-red-500/80 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Goal Simulation Trigger */}
            <button
              onClick={() => {
                liveEngine.triggerTestGoal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              title="Test real-time goal alerts with stadium audio and confetti"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden sm:inline">{t.simulateGoal}</span>
              <span className="sm:hidden">⚽ Goal</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => {
                onToggleTheme();
                soundEffects.playClick();
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-300 transition-all cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                soundEffects.playClick();
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                soundEnabled
                  ? 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={soundEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Switcher (EN / नेपाली) */}
            <button
              onClick={() => {
                const nextLang = language === 'en' ? 'ne' : 'en';
                onLanguageChange(nextLang);
                soundEffects.playClick();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
              title="Toggle English / नेपाली"
            >
              <Globe className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
