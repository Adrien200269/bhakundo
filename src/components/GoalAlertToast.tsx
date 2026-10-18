import React from 'react';
import type { Match, MatchEvent } from '../types/football';
import { X, ChevronRight } from 'lucide-react';

interface GoalAlertToastProps {
  goalAlert: { match: Match; event: MatchEvent } | null;
  onDismiss: () => void;
  onSelectMatch: (match: Match) => void;
}

export const GoalAlertToast: React.FC<GoalAlertToastProps> = ({
  goalAlert,
  onDismiss,
  onSelectMatch,
}) => {
  if (!goalAlert) return null;

  const { match, event } = goalAlert;
  const scoringTeam =
    event.teamId === match.homeTeam?.id ? match.homeTeam : match.awayTeam;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-in transition-all">
      <div className="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 border-2 border-red-500 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-slate-900 dark:text-white">
        
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-xs uppercase font-black tracking-widest text-red-600 dark:text-red-400 flex items-center gap-1">
              ⚽ GOAL ALERT! ({event.minute}')
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-3">
          <div className="text-3xl">⚽</div>
          <div className="flex-1">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{event.playerName}</span>
              {scoringTeam?.flag && <span className="text-sm">{scoringTeam.flag}</span>}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-300 font-bold">
              {scoringTeam?.name || 'Team'}
            </p>
          </div>
        </div>

        {/* Updated Scoreline */}
        <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{match.homeTeam?.shortName || 'HME'}</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-wider">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </span>
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{match.awayTeam?.shortName || 'AWY'}</span>
        </div>

        {/* View Match CTA */}
        <button
          onClick={() => {
            onSelectMatch(match);
            onDismiss();
          }}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <span>View Match Data & Lineups</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default GoalAlertToast;
