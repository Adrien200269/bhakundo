import React from 'react';
import type { Match } from '../types/football';
import type { Language } from '../utils/translations';
import { Sparkles, Trophy, Flame, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import NepaliFlag from './NepaliFlag';

interface BentoGridProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  onFilterCategory: (category: any) => void;
  language: Language;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  matches,
  onSelectMatch,
  onFilterCategory,
  language,
}) => {

  // Pick the most exciting featured live match (preferably Nepal match or high-scoring live fixture)
  const featuredMatch =
    matches.find((m) => m.leagueCountry === 'Nepal' && (m.status === 'LIVE' || m.status === 'HT')) ||
    matches.find((m) => m.status === 'LIVE' || m.status === 'HT') ||
    matches[0];

  // Calculate live dynamic dashboard statistics
  const totalGoalsToday = matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);
  const liveCount = matches.filter((m) => m.status === 'LIVE' || m.status === 'HT').length;

  return (
    <section className="space-y-3">
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'ne' ? 'प्रत्यक्ष खेल केन्द्र' : 'Matchday Bento Hub'}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                Live Data
              </span>
            </h2>
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
          {liveCount} Live • {matches.length} Total Fixtures
        </span>
      </div>

      {/* Bento Grid Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        
        {/* TILE 1: FEATURED HERO LIVE MATCH (Spans 2 columns) */}
        {featuredMatch && (
          <div
            onClick={() => onSelectMatch(featuredMatch)}
            className="md:col-span-2 group relative bg-gradient-to-br from-slate-900 via-[#0e1726] to-[#0a0f1d] text-white rounded-3xl p-5 sm:p-6 border border-slate-700/80 hover:border-red-500/80 shadow-lg hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px]"
          >
            {/* Subtle Pitch Grass Grid Markings in Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar: League badge & Live Minute status */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                {featuredMatch.leagueCountry === 'Nepal' ? (
                  <NepaliFlag size="sm" className="w-3.5 h-4" />
                ) : (
                  <span>{featuredMatch.leagueFlag || '⚽'}</span>
                )}
                <span className="uppercase tracking-wider text-[11px] truncate max-w-[160px] sm:max-w-xs">
                  {featuredMatch.leagueName}
                </span>
              </div>

              {featuredMatch.status === 'LIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-md animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>LIVE {featuredMatch.minute}'</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {featuredMatch.status}
                </span>
              )}
            </div>

            {/* Middle: Big Scoreboard */}
            <div className="relative z-10 my-4 grid grid-cols-12 items-center gap-2">
              {/* Home Team */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  {featuredMatch.homeTeam?.logo ? (
                    <img src={featuredMatch.homeTeam.logo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span>{featuredMatch.homeTeam?.shortName}</span>
                  )}
                </div>
                <div className="truncate">
                  <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-red-400 transition-colors truncate">
                    {featuredMatch.homeTeam?.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {featuredMatch.homeTeam?.country} {featuredMatch.homeTeam?.flag}
                  </span>
                </div>
              </div>

              {/* Score Number Display */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight flex items-center gap-1.5 text-white bg-white/5 px-3 py-1 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <span className="text-red-400">{featuredMatch.homeScore ?? 0}</span>
                  <span className="text-slate-500 text-lg sm:text-2xl">:</span>
                  <span className="text-blue-400">{featuredMatch.awayScore ?? 0}</span>
                </div>
              </div>

              {/* Away Team */}
              <div className="col-span-5 flex items-center justify-end gap-3 text-right">
                <div className="truncate">
                  <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors truncate">
                    {featuredMatch.awayTeam?.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {featuredMatch.awayTeam?.country} {featuredMatch.awayTeam?.flag}
                  </span>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  {featuredMatch.awayTeam?.logo ? (
                    <img src={featuredMatch.awayTeam.logo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span>{featuredMatch.awayTeam?.shortName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Strip: Venue & Action Button */}
            <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
                📍 {featuredMatch.stadium || 'Stadium'}
              </span>

              <span className="flex items-center gap-1 font-bold text-red-400 group-hover:text-white transition-colors shrink-0">
                <span>Open Match Centre</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        )}

        {/* TILE 2: MATCHDAY SPOTLIGHT */}
        <div
          onClick={() => onFilterCategory(matches.some((m) => m.leagueCountry === 'Nepal' || m.homeTeam?.country === 'Nepal') ? 'nepal' : 'premier-league')}
          className="group relative bg-gradient-to-br from-red-600 via-rose-600 to-[#003893] text-white rounded-3xl p-5 border border-red-500/50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {matches.some((m) => m.leagueCountry === 'Nepal' || m.homeTeam?.country === 'Nepal') ? (
                <>
                  <NepaliFlag size="sm" className="w-4 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    Nepal Focus
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    Top Competition
                  </span>
                </>
              )}
            </div>
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>

          <div className="my-2">
            <h3 className="font-black text-lg leading-snug">
              {matches.some((m) => m.leagueCountry === 'Nepal' || m.homeTeam?.country === 'Nepal')
                ? 'Nepali Football Spotlight'
                : 'Premier League Matchday'}
            </h3>
            <p className="text-xs text-red-100/90 leading-relaxed mt-1">
              {matches.some((m) => m.leagueCountry === 'Nepal' || m.homeTeam?.country === 'Nepal')
                ? 'Official fixture updates and live coverage.'
                : 'Live scores, real-time commentary, statistics, and official lineups.'}
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold">
            <span className="text-red-100">
              {matches.some((m) => m.leagueCountry === 'Nepal' || m.homeTeam?.country === 'Nepal')
                ? 'Nepal Football'
                : 'Live Worldwide'}
            </span>
            <span className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-xl transition-all">
              <span>View Matches</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* TILE 3: LIVE STATS & MOMENTUM METER */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Trophy className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Matchday Stats
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <div className="my-3 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white block">
                {totalGoalsToday}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Goals Scored
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-2xl font-black font-mono text-red-600 dark:text-red-400 block">
                {liveCount}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Active Matches
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Clean sheets, live xG & H2H</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Live Official Feed</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
