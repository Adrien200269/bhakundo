import React, { useState } from 'react';
import type { Match } from '../types/football';
import { X, MapPin, User, Users, Clock, Activity, Shield, MessageSquare, History, Sparkles, RefreshCw } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import LineupPitch from './LineupPitch';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
  language: Language;
  isLoading?: boolean;
  onSimulateGoal?: (matchId: string) => void;
}

type TabType = 'timeline' | 'stats' | 'lineups' | 'h2h' | 'commentary';

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
  language,
  isLoading = false,
  onSimulateGoal,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  if (!match) return null;

  const t = translations[language];
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  const events = match.events || [];
  const commentary = match.commentary || [];
  const h2h = match.h2h || [];

  const defaultStats = {
    possession: [50, 50] as [number, number],
    shots: [0, 0] as [number, number],
    shotsOnTarget: [0, 0] as [number, number],
    xG: [0, 0] as [number, number],
    corners: [0, 0] as [number, number],
    fouls: [0, 0] as [number, number],
    yellowCards: [0, 0] as [number, number],
    redCards: [0, 0] as [number, number],
    offsides: [0, 0] as [number, number],
    passes: [0, 0] as [number, number],
    passAccuracy: [0, 0] as [number, number],
  };

  const stats = match.stats || defaultStats;

  // Safe comparative stat bar with 50/50 balance when both zero
  const renderStatBar = (
    label: string,
    homeValRaw: number | undefined,
    awayValRaw: number | undefined,
    isPercentage = false
  ) => {
    const homeVal = typeof homeValRaw === 'number' && !isNaN(homeValRaw) ? homeValRaw : 0;
    const awayVal = typeof awayValRaw === 'number' && !isNaN(awayValRaw) ? awayValRaw : 0;

    let homePercent = 50;
    let awayPercent = 50;

    if (isPercentage) {
      homePercent = homeVal;
      awayPercent = awayVal || (100 - homePercent);
    } else {
      const sum = homeVal + awayVal;
      if (sum > 0) {
        homePercent = Math.round((homeVal / sum) * 100);
        awayPercent = 100 - homePercent;
      }
    }

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-white font-mono">{homeVal}{isPercentage ? '%' : ''}</span>
          <span className="text-slate-400 font-medium">{label}</span>
          <span className="text-white font-mono">{awayVal}{isPercentage ? '%' : ''}</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${homePercent}%` }}
            className={`h-full transition-all duration-300 ${
              homeVal === 0 && awayVal === 0 && !isPercentage
                ? 'bg-slate-700'
                : 'bg-gradient-to-r from-red-600 to-rose-500'
            }`}
          />
          <div
            style={{ width: `${awayPercent}%` }}
            className={`h-full transition-all duration-300 ${
              homeVal === 0 && awayVal === 0 && !isPercentage
                ? 'bg-slate-700'
                : 'bg-gradient-to-l from-blue-600 to-cyan-500'
            }`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="relative bg-gradient-to-b from-[#131b2e] to-slate-900 px-6 pt-5 pb-6 border-b border-slate-800">
          <button
            onClick={() => {
              onClose();
              soundEffects.playClick();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Competition Header */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            {match.leagueCountry === 'Nepal' ? (
              <NepaliFlag size="sm" className="w-3.5 h-4" />
            ) : (
              <span>{match.leagueFlag || '⚽'}</span>
            )}
            <span className="uppercase tracking-widest">{match.leagueName}</span>
          </div>

          {/* Big Live Scoreboard */}
          <div className="grid grid-cols-12 items-center gap-3">
            {/* Home Team */}
            <div className="col-span-5 flex flex-col items-center sm:items-end text-center sm:text-right">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-500/40 flex items-center justify-center font-black text-xl text-white shadow-xl mb-2 overflow-hidden p-1">
                {match.homeTeam?.logo ? (
                  <img src={match.homeTeam.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span>{match.homeTeam?.shortName || 'HME'}</span>
                )}
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {match.homeTeam?.name || 'Home Team'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {match.homeTeam?.country || ''} {match.homeTeam?.flag || ''}
              </span>
            </div>

            {/* Score Center */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              {match.status === 'UPCOMING' ? (
                <div className="text-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">VS</span>
                  <div className="text-sm font-bold text-blue-400 mt-1">{match.startTime}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl font-black font-mono text-white tracking-wider flex items-center gap-1.5">
                    <span className="text-red-400">{match.homeScore ?? 0}</span>
                    <span className="text-slate-500 text-2xl sm:text-3xl">:</span>
                    <span className="text-blue-400">{match.awayScore ?? 0}</span>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="mt-2">
                    {match.status === 'LIVE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600/30 text-red-300 border border-red-500/40 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>LIVE {match.minute}'</span>
                      </span>
                    )}
                    {match.status === 'HT' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        HALF TIME
                      </span>
                    )}
                    {match.status === 'FINISHED' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        FULL TIME
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/40 flex items-center justify-center font-black text-xl text-white shadow-xl mb-2 overflow-hidden p-1">
                {match.awayTeam?.logo ? (
                  <img src={match.awayTeam.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span>{match.awayTeam?.shortName || 'AWY'}</span>
                )}
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {match.awayTeam?.name || 'Away Team'}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {match.awayTeam?.country || ''} {match.awayTeam?.flag || ''}
              </span>
            </div>
          </div>

          {/* Match Venue & Details strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.stadium || 'Stadium'}{match.city ? `, ${match.city}` : ''}</span>
            </div>
            {match.referee && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Ref: {match.referee}</span>
              </div>
            )}
            {match.attendance && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Att: {match.attendance}</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading Live Details Banner */}
        {isLoading && (
          <div className="bg-red-950/40 border-b border-red-500/20 px-4 py-2 flex items-center justify-center gap-2 text-xs text-red-300 font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Updating live match events, rosters & statistics...</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'timeline', label: t.timeline, icon: Clock },
              { id: 'stats', label: t.stats, icon: Activity },
              { id: 'lineups', label: t.lineup, icon: Shield },
              { id: 'h2h', label: t.h2h, icon: History },
              { id: 'commentary', label: t.commentary, icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    soundEffects.playClick();
                  }}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick simulation goal in modal */}
          {isLive && onSimulateGoal && (
            <button
              onClick={() => onSimulateGoal(match.id)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Simulate Goal</span>
            </button>
          )}
        </div>

        {/* Modal Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <Clock className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="font-semibold text-slate-300 text-sm">No Events Recorded Yet</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {match.status === 'UPCOMING'
                      ? 'Events will appear here in real time as the match kicks off.'
                      : 'No key incident cards, goals, or substitutions logged for this fixture.'}
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {events.map((ev) => {
                    const isHomeTeam = ev.teamId === match.homeTeam?.id;
                    const team = isHomeTeam ? match.homeTeam : match.awayTeam;

                    return (
                      <div key={ev.id} className="relative flex items-start gap-3">
                        {/* Minute node */}
                        <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                          {ev.minute}'
                        </div>

                        {/* Event Card */}
                        <div
                          className={`flex-1 p-3 rounded-xl border text-xs ${
                            ev.type === 'GOAL'
                              ? 'bg-red-950/30 border-red-500/40'
                              : ev.type === 'YELLOW_CARD'
                              ? 'bg-amber-950/20 border-amber-500/30'
                              : ev.type === 'RED_CARD'
                              ? 'bg-rose-950/30 border-rose-600/50'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5 text-white">
                              {ev.type === 'GOAL' && <span>⚽ GOAL!</span>}
                              {ev.type === 'YELLOW_CARD' && <span>🟨 Yellow Card</span>}
                              {ev.type === 'RED_CARD' && <span>🟥 Red Card</span>}
                              {ev.type === 'SUBSTITUTION' && <span>🔄 Substitution</span>}
                              {ev.type === 'VAR' && <span>🖥️ VAR Decision</span>}
                              <span className="text-slate-200 font-semibold">{ev.playerName || 'Player'}</span>
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">{team?.name || ''}</span>
                          </div>

                          {ev.assistPlayerName && (
                            <p className="text-slate-400 text-[11px] mt-1">
                              Assist: <span className="text-slate-200">{ev.assistPlayerName}</span>
                            </p>
                          )}
                          {ev.subInPlayerName && (
                            <p className="text-slate-400 text-[11px] mt-1">
                              Sub In: <span className="text-emerald-400">{ev.subInPlayerName}</span>
                            </p>
                          )}
                          {ev.description && (
                            <p className="text-slate-300 text-[11px] mt-1.5 italic">
                              "{ev.description}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              {renderStatBar(t.possession, stats.possession?.[0] ?? 50, stats.possession?.[1] ?? 50, true)}
              {renderStatBar(t.totalShots, stats.shots?.[0] ?? 0, stats.shots?.[1] ?? 0)}
              {renderStatBar(t.shotsOnTarget, stats.shotsOnTarget?.[0] ?? 0, stats.shotsOnTarget?.[1] ?? 0)}
              {renderStatBar(t.expectedGoals, stats.xG?.[0] ?? 0, stats.xG?.[1] ?? 0)}
              {renderStatBar(t.corners, stats.corners?.[0] ?? 0, stats.corners?.[1] ?? 0)}
              {renderStatBar(t.fouls, stats.fouls?.[0] ?? 0, stats.fouls?.[1] ?? 0)}
              {renderStatBar(t.yellowCards, stats.yellowCards?.[0] ?? 0, stats.yellowCards?.[1] ?? 0)}
              {renderStatBar(t.passAccuracy, stats.passAccuracy?.[0] ?? 80, stats.passAccuracy?.[1] ?? 80, true)}
            </div>
          )}

          {/* TAB 3: LINEUPS PITCH */}
          {activeTab === 'lineups' && <LineupPitch match={match} />}

          {/* TAB 4: HEAD-TO-HEAD (H2H) */}
          {activeTab === 'h2h' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Meetings Between Teams ({h2h.length})
              </h4>
              {h2h.length > 0 ? (
                h2h.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="text-slate-400 text-[11px] font-mono">
                      {h.date} • {h.competition}
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-slate-200">
                      <span className="truncate max-w-[120px] text-right">{h.homeTeam}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-400">
                        {h.homeScore} - {h.awayScore}
                      </span>
                      <span className="truncate max-w-[120px] text-left">{h.awayTeam}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <History className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="font-semibold text-slate-300 text-sm">No Prior H2H Matches Found</p>
                  <p className="text-xs text-slate-400">
                    These clubs have no recent historical meetings on record.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMMENTARY */}
          {activeTab === 'commentary' && (
            <div className="space-y-2.5">
              {commentary.length > 0 ? (
                commentary.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                      c.type === 'goal'
                        ? 'bg-red-950/40 border-red-500/40 text-red-200 font-medium'
                        : c.type === 'card'
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-slate-400 shrink-0">
                      {c.minute ? `${c.minute}'` : '•'}
                    </span>
                    <p className="leading-relaxed">{c.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <MessageSquare className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="font-semibold text-slate-300 text-sm">Live Commentary Awaiting Kickoff</p>
                  <p className="text-xs text-slate-400">
                    Minute-by-minute text commentary will start streaming when the referee blows the whistle.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailModal;
