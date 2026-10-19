import React, { useMemo } from 'react';
import type { Match } from '../types/football';
import type { Language } from '../utils/translations';
import { Flame, ChevronRight, Zap, Radio, Activity } from 'lucide-react';
import NepaliFlag from './NepaliFlag';

interface RightSidebarTickerProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  language: Language;
}

export const RightSidebarTicker: React.FC<RightSidebarTickerProps> = ({
  matches,
  onSelectMatch,
  language,
}) => {
  // Extract all real match incidents (goals, cards, substitutions, commentary highlights)
  const tickerEvents = useMemo(() => {
    const list: {
      id: string;
      match: Match;
      minute: number;
      type: 'goal' | 'card' | 'sub' | 'highlight';
      text: string;
      teamName: string;
      teamLogo?: string;
    }[] = [];

    matches.forEach((m) => {
      // 1. Goals and key official events
      (m.events || []).forEach((ev) => {
        const team = ev.teamId === m.homeTeam?.id ? m.homeTeam : m.awayTeam;
        list.push({
          id: `ev-${m.id}-${ev.id}`,
          match: m,
          minute: ev.minute,
          type: ev.type === 'GOAL' ? 'goal' : ev.type.includes('CARD') ? 'card' : 'sub',
          text: ev.type === 'GOAL'
            ? `GOAL! ${ev.playerName}${ev.assistPlayerName ? ` (assist: ${ev.assistPlayerName})` : ''}`
            : ev.description || `${ev.type.replace('_', ' ')}: ${ev.playerName}`,
          teamName: team?.shortName || team?.name || 'Team',
          teamLogo: team?.logo,
        });
      });

      // 2. Commentary chances / highlights from live feed
      (m.commentary || []).slice(0, 3).forEach((comm) => {
        if (comm.type === 'goal' || comm.type === 'chance') {
          list.push({
            id: `comm-${m.id}-${comm.id}`,
            match: m,
            minute: comm.minute || m.minute || 1,
            type: comm.type === 'goal' ? 'goal' : 'highlight',
            text: comm.text,
            teamName: m.homeTeam?.shortName || 'Live',
            teamLogo: m.homeTeam?.logo,
          });
        }
      });
    });

    // Strictly real data only - no synthetic mock fallback!
    // Sort by minute descending
    return list.sort((a, b) => b.minute - a.minute);
  }, [matches]);

  const liveMatches = useMemo(() => {
    return matches.filter((m) => m.status === 'LIVE' || m.status === 'HT');
  }, [matches]);

  // Duplicate items for continuous looping animation if events exist
  const duplicatedEvents = useMemo(() => {
    if (tickerEvents.length === 0) return [];
    return [...tickerEvents, ...tickerEvents];
  }, [tickerEvents]);

  return (
    <aside className="space-y-4">
      {/* 1. Live Match Event Stream (Scrolling Animation Widget) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-xl overflow-hidden relative group">
        
        {/* Widget Header with Pulse */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{language === 'ne' ? 'प्रत्यक्ष घटनाक्रम' : 'Live Match Stream'}</span>
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDuration: '2s' }} />
            </h3>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60">
            {liveMatches.length} LIVE
          </span>
        </div>

        {/* Scrolling Event Ticker Box */}
        <div className="relative h-72 sm:h-80 overflow-hidden flex flex-col justify-center">
          {tickerEvents.length > 0 ? (
            <>
              {/* Top & Bottom gradient mask for smooth fade in/out */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

              {/* Animated Scrolling List */}
              <div className="animate-scroll-vertical space-y-2.5 pt-2">
                {duplicatedEvents.map((item, idx) => {
                  const isGoal = item.type === 'goal';
                  const isCard = item.type === 'card';

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => item.match?.id && onSelectMatch(item.match)}
                      className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                        isGoal
                          ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/20 border-red-200 dark:border-red-500/40 text-red-950 dark:text-red-200'
                          : isCard
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                            isGoal
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {item.minute}'
                          </span>
                          <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                            {item.teamName}
                          </span>
                        </div>

                        <span className="text-[11px]">
                          {isGoal ? '⚽ GOAL' : isCard ? '🟨 Card' : '⚡ Moment'}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-[11px] leading-snug font-medium text-slate-700 dark:text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Clean honest empty state when no events logged */
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500 space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {language === 'ne' ? 'कुनै प्रत्यक्ष घटना छैन' : 'No Match Incidents Yet'}
                </p>
                <p className="text-[11px] leading-relaxed max-w-[220px]">
                  {language === 'ne'
                    ? 'खेल सुरु भएपछि प्रत्यक्ष गोल, कार्ड र महत्वपूर्ण पलहरू यहाँ स्ट्रिम हुनेछन्।'
                    : 'Official live match goals, cards, and commentary will stream here in real time.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stream Footer Hint */}
        <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>{tickerEvents.length > 0 ? 'Hover to pause stream' : 'Awaiting kickoff'}</span>
          <span className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
            <span>Live Auto-Sync</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
          </span>
        </div>
      </div>

      {/* 2. Nepal Super League Spotlight Card */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-[#003893] text-white rounded-3xl p-4.5 shadow-lg relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-15 w-28 h-28 pointer-events-none">
          <NepaliFlag size="lg" className="w-full h-full object-contain" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <NepaliFlag size="sm" className="w-4 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
            Nepal Football Hub
          </span>
        </div>

        <h4 className="font-black text-base leading-tight mb-1">
          Nepal Super League & National Team
        </h4>
        <p className="text-xs text-red-100/90 leading-relaxed mb-3">
          Official live coverage for Dasharath Rangasala fixtures, NSL derbies, and Asian Cup Qualifiers.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>National Team & NSL</span>
          </div>

          <span className="px-2 py-1 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1">
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. Official Live Coverage Feeds Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="leading-snug">
          <span className="font-bold block text-slate-900 dark:text-white">
            {language === 'ne' ? 'आधिकारिक प्रत्यक्ष फिड' : 'Official Live Feeds'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'ne'
              ? '२२+ अन्तर्राष्ट्रिय तथा महादेशीय प्रतियोगिताहरू सक्रिय'
              : 'Real-time score & stat feeds across 22+ official global competitions'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebarTicker;
