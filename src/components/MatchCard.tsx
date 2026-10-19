import React from 'react';
import type { Match } from '../types/football';
import { Star, MapPin, ChevronRight } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import { soundEffects } from '../utils/soundEffects';

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
  onToggleFavorite: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onSelect,
  onToggleFavorite,
}) => {
  const isLive = match.status === 'LIVE' || match.status === 'HT';
  const isNepalMatch = match.leagueCountry === 'Nepal' || match.homeTeam?.country === 'Nepal';
  const latestGoal = (match.events || []).find((e) => e.type === 'GOAL');

  return (
    <div
      onClick={() => onSelect(match)}
      className={`group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-xl hover:-translate-y-0.5 ${
        isLive
          ? 'border-red-400 dark:border-red-500/40 hover:border-red-500 dark:hover:border-red-500/80 shadow-red-500/10 dark:shadow-red-950/20'
          : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Header: League Name & Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-200/80 dark:border-slate-800/60 mb-3.5">
        <div className="flex items-center gap-2 font-medium">
          {match.leagueFlag === '🇳🇵' || isNepalMatch ? (
            <NepaliFlag size="sm" className="w-3.5 h-4" />
          ) : (
            <span>{match.leagueFlag || '⚽'}</span>
          )}
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[180px] sm:max-w-xs">
            {match.leagueName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          {match.status === 'LIVE' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/40 animate-pulse-subtle">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span>{match.minute}'</span>
            </span>
          )}
          {match.status === 'HT' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
              HALF TIME
            </span>
          )}
          {match.status === 'FINISHED' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              FT
            </span>
          )}
          {match.status === 'UPCOMING' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
              {match.startTime}
            </span>
          )}

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.id);
              soundEffects.playClick();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Pin to favorites"
          >
            <Star
              className={`w-4 h-4 ${
                match.isFavorite ? 'fill-amber-400 text-amber-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Score & Teams Arena */}
      <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 my-2">
        {/* Home Team */}
        <div className="col-span-5 flex items-center justify-end gap-2.5 text-right">
          <div className="truncate">
            <span className="block font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-white transition-colors truncate">
              {match.homeTeam?.name || 'Home Team'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {match.homeTeam?.country || ''} {match.homeTeam?.flag || ''}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-300 shrink-0 shadow-inner group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-colors overflow-hidden p-1">
            {match.homeTeam?.logo ? (
              <img src={match.homeTeam.logo} alt="" className="w-full h-full object-contain" />
            ) : (
              <span>{match.homeTeam?.shortName || 'HME'}</span>
            )}
          </div>
        </div>

        {/* Center Scoreboard */}
        <div className="col-span-2 flex flex-col items-center justify-center px-1">
          {match.status === 'UPCOMING' ? (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              VS
            </span>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight bg-slate-100 dark:bg-slate-950/80 px-2.5 sm:px-3.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <span className={isLive && match.homeScore > match.awayScore ? 'text-red-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}>
                {match.homeScore ?? 0}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-base sm:text-lg">-</span>
              <span className={isLive && match.awayScore > match.homeScore ? 'text-red-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}>
                {match.awayScore ?? 0}
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex items-center justify-start gap-2.5 text-left">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-300 shrink-0 shadow-inner group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-colors overflow-hidden p-1">
            {match.awayTeam?.logo ? (
              <img src={match.awayTeam.logo} alt="" className="w-full h-full object-contain" />
            ) : (
              <span>{match.awayTeam?.shortName || 'AWY'}</span>
            )}
          </div>
          <div className="truncate">
            <span className="block font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-white transition-colors truncate">
              {match.awayTeam?.name || 'Away Team'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {match.awayTeam?.country || ''} {match.awayTeam?.flag || ''}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Match Info Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{match.stadium || 'Stadium'}{match.city ? `, ${match.city}` : ''}</span>
        </div>

        {latestGoal && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[200px]">
            <span>⚽</span>
            <span className="truncate">{latestGoal.playerName} ({latestGoal.minute}')</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors shrink-0 font-bold text-[11px]">
          <span>Full Data</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
