import React, { useState } from 'react';
import type { Match } from '../types/football';
import { UserCheck, Shield } from 'lucide-react';

interface LineupPitchProps {
  match: Match;
}

export const LineupPitch: React.FC<LineupPitchProps> = ({ match }) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

  const currentLineup = selectedTeam === 'home' ? match.homeLineup : match.awayLineup;

  const startingXI = currentLineup?.startingXI || [];
  const substitutes = currentLineup?.substitutes || [];

  if (!currentLineup || startingXI.length === 0) {
    return (
      <div className="p-8 text-center text-slate-300 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
        <Shield className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="font-bold text-white text-sm">Lineups Not Announced Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Official starting formations and substitutes are typically confirmed by coaches 45–60 minutes before kickoff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Team Toggle Selector */}
      <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedTeam('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTeam === 'home'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {match.homeTeam?.name || 'Home'} ({match.homeLineup?.formation || 'XI'})
          </button>
          <button
            onClick={() => setSelectedTeam('away')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTeam === 'away'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {match.awayTeam?.name || 'Away'} ({match.awayLineup?.formation || 'XI'})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium shrink-0 hidden sm:block">
          <span className="text-slate-500 mr-1">Coach:</span>
          <span className="text-slate-200 font-semibold">{currentLineup.manager || 'Head Coach'}</span>
        </div>
      </div>

      {/* 2D Realistic Football Pitch */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-gradient-to-b from-emerald-800 to-emerald-950 rounded-2xl overflow-hidden border-2 border-emerald-600/40 shadow-2xl p-4">
        
        {/* Pitch Turf Stripes Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i % 2 === 0 ? 'bg-black/30' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {/* Pitch Markings SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Outer Boundary */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          
          {/* Halfway line */}
          <line x1="5" y1="50" x2="95" y2="50" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="1" fill="#FFFFFF" />

          {/* Top Penalty Box (Opponent's goal) */}
          <rect x="25" y="5" width="50" height="18" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="36" y="5" width="28" height="6" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <path d="M 38 23 A 8 8 0 0 0 62 23" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />

          {/* Bottom Penalty Box (Current team defending) */}
          <rect x="25" y="77" width="50" height="18" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="36" y="89" width="28" height="6" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <path d="M 38 77 A 8 8 0 0 1 62 77" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
        </svg>

        {/* Tactical Player Nodes */}
        <div className="relative w-full h-full">
          {startingXI.map((player) => {
            const posX = player.x ?? 50;
            const posY = player.y ?? 50;

            return (
              <div
                key={player.id}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              >
                {/* Jersey Badge Circle */}
                <div
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm text-white border-2 shadow-lg transition-transform group-hover:scale-115 ${
                    player.position === 'GK'
                      ? 'bg-amber-500 border-amber-300'
                      : selectedTeam === 'home'
                      ? 'bg-red-600 border-red-300'
                      : 'bg-blue-600 border-blue-300'
                  }`}
                >
                  <span>{player.number}</span>

                  {/* Captain arm-band */}
                  {player.isCaptain && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] font-black px-1 rounded-full shadow">
                      C
                    </span>
                  )}

                  {/* Goal indicator */}
                  {player.goals && player.goals > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-[10px] rounded-full px-1 shadow">
                      ⚽{player.goals > 1 ? player.goals : ''}
                    </span>
                  )}

                  {/* Card indicator */}
                  {player.yellowCards && player.yellowCards > 0 && (
                    <span className="absolute -top-1 -left-1 w-2.5 h-3 bg-amber-400 rounded-[1px] border border-amber-600 shadow" />
                  )}
                </div>

                {/* Player Name Pill */}
                <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] sm:text-xs font-semibold text-slate-100 whitespace-nowrap shadow-md border border-slate-800 group-hover:border-slate-500 transition-colors">
                  {(player.name || 'Player').split(' ').pop()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes & Bench Section */}
      {substitutes.length > 0 && (
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Substitutes Bench ({substitutes.length})</span>
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {substitutes.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2 p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 text-xs"
              >
                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-300 text-[11px] shrink-0">
                  {sub.number}
                </span>
                <span className="truncate text-slate-200 font-medium">{sub.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineupPitch;
