import React, { useState, useMemo } from 'react';
import type { Match, Player } from '../types/football';
import { UserCheck, Shield, Users, LayoutGrid, List } from 'lucide-react';

interface LineupPitchProps {
  match: Match;
}

export const LineupPitch: React.FC<LineupPitchProps> = ({ match }) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch');

  const currentLineup = selectedTeam === 'home' ? match.homeLineup : match.awayLineup;
  const currentTeam = selectedTeam === 'home' ? match.homeTeam : match.awayTeam;

  const rawStartingXI = currentLineup?.startingXI || [];
  const substitutes = currentLineup?.substitutes || [];

  // Self-healing tactical positioner: ensures players NEVER bunch into a single line
  const startingXI = useMemo(() => {
    if (rawStartingXI.length === 0) return [];

    // Check if the current data has collapsed coordinates (e.g. 4+ players sharing identical y)
    const yCounts: Record<number, number> = {};
    rawStartingXI.forEach((p) => {
      const yVal = Math.round(p.y ?? 50);
      yCounts[yVal] = (yCounts[yVal] || 0) + 1;
    });

    const isCollapsed = Object.values(yCounts).some((count) => count >= 4);

    // If coordinates are already healthy and distinct, use them
    if (!isCollapsed && rawStartingXI.every((p) => typeof p.x === 'number' && typeof p.y === 'number')) {
      return rawStartingXI;
    }

    // Auto-distribute tactically by position:
    const gks: Player[] = [];
    const defs: Player[] = [];
    const mids: Player[] = [];
    const fwds: Player[] = [];

    rawStartingXI.forEach((p) => {
      const pos = (p.position || 'MID').toUpperCase();
      if (pos === 'GK') gks.push(p);
      else if (pos === 'DEF') defs.push(p);
      else if (pos === 'FWD') fwds.push(p);
      else mids.push(p);
    });

    // If defs or fwds are empty, infer by jersey/order to preserve tactical lines
    if (defs.length === 0 && mids.length > 5) {
      // Split overloaded mids into defs, mids, fwds
      const defendersCount = 4;
      const transferredDefs = mids.splice(0, defendersCount);
      defs.push(...transferredDefs);
    }
    if (fwds.length === 0 && mids.length > 4) {
      const forwardsCount = 2;
      const transferredFwds = mids.splice(mids.length - forwardsCount, forwardsCount);
      fwds.push(...transferredFwds);
    }

    const distributeRow = (row: Player[], yPos: number) => {
      const count = row.length;
      if (count === 0) return;
      if (count === 1) {
        row[0].x = 50;
        row[0].y = yPos;
        return;
      }
      const sidePadding = count >= 5 ? 12 : 16;
      const availableWidth = 100 - sidePadding * 2;
      const step = availableWidth / (count - 1);
      row.forEach((p, idx) => {
        p.x = Math.round(sidePadding + step * idx);
        p.y = yPos;
      });
    };

    distributeRow(gks, 88);
    distributeRow(defs, 70);
    distributeRow(mids, 46);
    distributeRow(fwds, 20);

    return [...gks, ...defs, ...mids, ...fwds];
  }, [rawStartingXI]);

  if (!currentLineup || rawStartingXI.length === 0) {
    return (
      <div className="p-8 text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <Shield className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Lineups Not Announced Yet</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Official starting formations and substitutes are typically confirmed by coaches 45–60 minutes before kickoff.
        </p>
      </div>
    );
  }

  const isHome = selectedTeam === 'home';

  return (
    <div className="space-y-4">
      {/* Team Toggle Selector Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-950/90 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Home / Away Tabs */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          {/* Home Team Button */}
          <button
            onClick={() => setSelectedTeam('home')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTeam === 'home'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/40'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {match.homeTeam?.logo ? (
              <img src={match.homeTeam.logo} alt="" className="w-4 h-4 object-contain rounded-full bg-white p-0.5" />
            ) : null}
            <span className="truncate max-w-[120px]">{match.homeTeam?.name || 'Home'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              selectedTeam === 'home' ? 'bg-red-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {match.homeLineup?.formation || 'XI'}
            </span>
          </button>

          {/* Away Team Button */}
          <button
            onClick={() => setSelectedTeam('away')}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTeam === 'away'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {match.awayTeam?.logo ? (
              <img src={match.awayTeam.logo} alt="" className="w-4 h-4 object-contain rounded-full bg-white p-0.5" />
            ) : null}
            <span className="truncate max-w-[120px]">{match.awayTeam?.name || 'Away'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              selectedTeam === 'away' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {match.awayLineup?.formation || 'XI'}
            </span>
          </button>
        </div>

        {/* View Mode Toggle & Coach info */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 px-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="text-slate-400 dark:text-slate-500 mr-1">Coach:</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold">{currentLineup.manager || 'Head Coach'}</span>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('pitch')}
              title="2D Pitch View"
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === 'pitch'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Roster List View"
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2D Realistic Football Pitch */}
      {viewMode === 'pitch' ? (
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950 rounded-2xl overflow-hidden border-2 border-emerald-600/50 shadow-2xl p-4 select-none">
          
          {/* Pitch Turf Stripes Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 ${i % 2 === 0 ? 'bg-black/35' : 'bg-white/10'}`}
              />
            ))}
          </div>

          {/* Pitch Markings SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Outer Boundary */}
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            
            {/* Halfway line & Center Circle */}
            <line x1="5" y1="50" x2="95" y2="50" stroke="#FFFFFF" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="1" fill="#FFFFFF" />

            {/* Top Penalty Box (Opponent Goal / Attack direction) */}
            <rect x="25" y="5" width="50" height="18" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <rect x="36" y="5" width="28" height="6" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M 38 23 A 8 8 0 0 0 62 23" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />

            {/* Bottom Penalty Box (Current team goalkeeper & defense) */}
            <rect x="25" y="77" width="50" height="18" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <rect x="36" y="89" width="28" height="6" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M 38 77 A 8 8 0 0 1 62 77" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />

            {/* Corner Arcs */}
            <path d="M 5 8 A 3 3 0 0 0 8 5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M 92 5 A 3 3 0 0 0 95 8" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M 5 92 A 3 3 0 0 1 8 95" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            <path d="M 92 95 A 3 3 0 0 1 95 92" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          </svg>

          {/* Tactical Player Nodes */}
          <div className="relative w-full h-full">
            {startingXI.map((player) => {
              const posX = player.x ?? 50;
              const posY = player.y ?? 50;
              const isGK = player.position === 'GK';

              // Extract last name for clear display
              const displayName = (player.name || 'Player').split(' ').pop() || player.name;

              return (
                <div
                  key={player.id}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10 hover:z-30 transition-transform duration-200"
                >
                  {/* Jersey Badge Circle */}
                  <div
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm text-white border-2 shadow-xl transition-all group-hover:scale-120 group-hover:shadow-2xl ${
                      isGK
                        ? 'bg-amber-500 border-amber-200 ring-2 ring-amber-500/50'
                        : isHome
                        ? 'bg-red-600 border-red-200 ring-2 ring-red-600/40'
                        : 'bg-blue-600 border-blue-200 ring-2 ring-blue-600/40'
                    }`}
                  >
                    <span>{player.number}</span>

                    {/* Captain Arm-band Badge */}
                    {player.isCaptain && (
                      <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[9px] font-black px-1 rounded-full shadow-md border border-yellow-200">
                        C
                      </span>
                    )}

                    {/* Goal Scorer Badge */}
                    {player.goals && player.goals > 0 && (
                      <span className="absolute -bottom-1.5 -right-1.5 bg-slate-900 border border-emerald-400 text-[10px] rounded-full px-1 shadow-md">
                        ⚽{player.goals > 1 ? player.goals : ''}
                      </span>
                    )}

                    {/* Yellow/Red Card Indicator */}
                    {player.redCards && player.redCards > 0 ? (
                      <span className="absolute -top-1.5 -left-1.5 w-2.5 h-3.5 bg-red-600 rounded-[1px] border border-white shadow-md" />
                    ) : player.yellowCards && player.yellowCards > 0 ? (
                      <span className="absolute -top-1.5 -left-1.5 w-2.5 h-3.5 bg-amber-400 rounded-[1px] border border-amber-600 shadow-md" />
                    ) : null}
                  </div>

                  {/* Player Name Pill */}
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm text-[10px] sm:text-xs font-semibold text-slate-100 max-w-[70px] sm:max-w-[84px] truncate text-center shadow-lg border border-slate-700/80 group-hover:border-slate-400 transition-colors">
                    {displayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View (Alternative for detailed inspection) */
        <div className="bg-white dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Starting XI • {currentTeam?.name} ({currentLineup.formation})</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {startingXI.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 text-white ${
                    player.position === 'GK'
                      ? 'bg-amber-500'
                      : isHome
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                  }`}>
                    {player.number}
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{player.name}</span>
                    {player.isCaptain && <span className="ml-1.5 text-[10px] text-yellow-600 dark:text-yellow-400 font-extrabold">(C)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {player.goals && player.goals > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">⚽ {player.goals}</span>
                  )}
                  {player.yellowCards && player.yellowCards > 0 && (
                    <span className="w-2.5 h-3.5 bg-amber-400 rounded-[1px] inline-block" />
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {player.position}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitutes & Bench Section */}
      {substitutes.length > 0 && (
        <div className="bg-white dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Substitutes Bench ({substitutes.length})</span>
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {substitutes.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs shadow-xs"
              >
                <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px] shrink-0">
                  {sub.number}
                </span>
                <span className="truncate text-slate-800 dark:text-slate-200 font-medium">{sub.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineupPitch;
