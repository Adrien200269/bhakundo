import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Search, Globe, Sun, Moon, Settings, X, Clock } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';
import type { Theme } from '../utils/theme';
import { getKathmanduTimeString } from '../utils/dateRange';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings?: () => void;
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
  onOpenSettings,
}) => {
  const t = translations[language];
  const [ktmTime, setKtmTime] = useState<string>(() => getKathmanduTimeString(new Date(), false));

  useEffect(() => {
    const timer = setInterval(() => {
      setKtmTime(getKathmanduTimeString(new Date(), false));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs dark:shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          
          {/* Brand Logo & Nepali Flag */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative group cursor-pointer">
                <NepaliFlag size="md" className="hover:scale-105 transition-transform drop-shadow-sm" />
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#DC143C] dark:text-[#ff385c] flex items-center font-brand">
                    <span>{t.appName}</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#DC143C] dark:bg-[#ff385c] ml-1.5 shadow-sm shadow-red-500/50 animate-pulse" />
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold hidden md:block">
                  {t.tagline}
                </span>
              </div>
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
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 focus:border-red-500 dark:focus:border-red-500 rounded-full pl-10 pr-12 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-400 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Live Kathmandu Time Pill */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shadow-xs"
              title="Live Kathmandu Time (Asia/Kathmandu, UTC+5:45)"
            >
              <Clock className="w-3.5 h-3.5 text-[#DC143C] dark:text-[#ff385c]" />
              <span>{ktmTime}</span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => {
                onToggleTheme();
                soundEffects.playClick();
              }}
              className="h-9 w-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all cursor-pointer shadow-xs group"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Sound Mute/Unmute Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                soundEffects.playClick();
              }}
              className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
                soundEnabled
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100/60 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
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
              className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-xs"
              title="Toggle English / नेपाली"
            >
              <Globe className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            {/* Settings Trigger */}
            {onOpenSettings && (
              <button
                onClick={() => {
                  onOpenSettings();
                  soundEffects.playClick();
                }}
                className="h-9 w-9 rounded-xl hidden sm:flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                title="Settings & API Configuration"
              >
                <Settings className="w-4 h-4 hover:rotate-90 transition-transform duration-300" />
              </button>
            )}
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
