import React from 'react';
import { Star, Trophy, Pause, FastForward } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';

export type FilterCategory = 'all' | 'live' | 'nepal' | 'premier-league' | 'champions-league' | 'la-liga' | 'favorites';

interface LeagueFilterProps {
  activeFilter: FilterCategory;
  onFilterChange: (cat: FilterCategory) => void;
  language: Language;
  liveCount: number;
  selectedDate: string;
  onDateChange: (dateOffset: 'yesterday' | 'today' | 'tomorrow') => void;
  activeDateTab: 'yesterday' | 'today' | 'tomorrow';
  simulationSpeed: 'paused' | 'normal' | 'fast';
  onSpeedChange: (speed: 'paused' | 'normal' | 'fast') => void;
}

export const LeagueFilter: React.FC<LeagueFilterProps> = ({
  activeFilter,
  onFilterChange,
  language,
  liveCount,
  onDateChange,
  activeDateTab,
  simulationSpeed,
  onSpeedChange,
}) => {
  const t = translations[language];

  const categories: { id: FilterCategory; label: string; icon?: React.ReactNode; badge?: number }[] = [
    { id: 'all', label: t.allMatches },
    {
      id: 'live',
      label: t.liveNow,
      icon: (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
      ),
      badge: liveCount,
    },
    {
      id: 'nepal',
      label: t.nepalLeague,
      icon: <NepaliFlag size="sm" className="w-3.5 h-4" />,
    },
    { id: 'premier-league', label: 'Premier League', icon: <span className="text-xs">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span> },
    { id: 'champions-league', label: 'Champions League', icon: <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> },
    { id: 'la-liga', label: 'La Liga', icon: <span className="text-xs">🇪🇸</span> },
    { id: 'favorites', label: t.favorites, icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar: Date Selector & Simulation Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* Date Navigator */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs font-bold">
          <button
            onClick={() => {
              onDateChange('yesterday');
              soundEffects.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDateTab === 'yesterday'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ne' ? 'हिजो' : 'Yesterday'}
          </button>
          <button
            onClick={() => {
              onDateChange('today');
              soundEffects.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDateTab === 'today'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ne' ? 'आज (Today)' : 'Today'}
          </button>
          <button
            onClick={() => {
              onDateChange('tomorrow');
              soundEffects.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDateTab === 'tomorrow'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ne' ? 'भोलि' : 'Tomorrow'}
          </button>
        </div>

        {/* Live Pace Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-semibold">
            {t.livePace}:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                onSpeedChange('paused');
                soundEffects.playClick();
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                simulationSpeed === 'paused'
                  ? 'bg-amber-100 dark:bg-amber-600/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Pause Live Clock"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onSpeedChange('normal');
                soundEffects.playClick();
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                simulationSpeed === 'normal'
                  ? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Normal Pace (ticks every 4s)"
            >
              1x Live
            </button>
            <button
              onClick={() => {
                onSpeedChange('fast');
                soundEffects.playClick();
              }}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                simulationSpeed === 'fast'
                  ? 'bg-red-100 dark:bg-red-600/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Fast Pace (ticks every 1.5s)"
            >
              <FastForward className="w-3 h-3" />
              <span>Fast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main League & Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onFilterChange(cat.id);
                soundEffects.playClick();
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/25 ring-1 ring-red-400/40'
                  : 'bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              {typeof cat.badge === 'number' && cat.badge > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white text-red-600'
                      : 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30'
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeagueFilter;
