import React, { useState, useEffect } from 'react';
import { Award, RefreshCw } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';
import { fetchLiveTopScorers } from '../services/liveFootballApi';
import type { TopScorer } from '../types/football';

interface TopScorersProps {
  language: Language;
}

type SupportedLeague = 'premier-league' | 'la-liga' | 'serie-a' | 'bundesliga';

export const TopScorers: React.FC<TopScorersProps> = ({ language }) => {
  const [selectedLeague, setSelectedLeague] = useState<SupportedLeague>('premier-league');
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLiveTopScorers(selectedLeague)
      .then((data) => {
        if (!isMounted) return;
        setScorers(data || []);
      })
      .catch(() => {
        if (isMounted) setScorers([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLeague]);

  const leagueOptions: { id: SupportedLeague; label: string; flag: string }[] = [
    { id: 'premier-league', label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'la-liga', label: 'La Liga', flag: '🇪🇸' },
    { id: 'serie-a', label: 'Serie A', flag: '🇮🇹' },
    { id: 'bundesliga', label: 'Bundesliga', flag: '🇩🇪' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
      {/* Header and League Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.topScorers} (Golden Boot Race)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-mono font-bold">
              Official Live Stats
            </span>
          </h3>
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar">
          {leagueOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedLeague(opt.id);
                soundEffects.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLeague === opt.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scorers List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800/60 mt-3">
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
            <span>Loading official top scorers...</span>
          </div>
        ) : scorers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Official statistics currently unavailable from feed for this competition.
          </div>
        ) : (
          scorers.map((scorer) => (
            <div
              key={`${scorer.rank}-${scorer.playerName}`}
              className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2.5 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                    scorer.rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : scorer.rank === 2
                      ? 'bg-slate-200 dark:bg-slate-300 text-slate-900'
                      : scorer.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {scorer.rank}
                </span>

                {/* Player Photo or Initials */}
                {scorer.playerPhoto ? (
                  <img
                    src={scorer.playerPhoto}
                    alt={scorer.playerName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    {scorer.playerName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{scorer.playerName}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    {scorer.team.logo && (
                      <img src={scorer.team.logo} alt="" className="w-3.5 h-3.5 object-contain inline" />
                    )}
                    <span>{scorer.team.name}</span>
                  </p>
                </div>
              </div>

              {/* Stats right */}
              <div className="flex items-center gap-4 font-mono">
                {scorer.matchesPlayed > 0 && (
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Matches</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {scorer.matchesPlayed}
                    </span>
                  </div>
                )}
                {scorer.assists > 0 && (
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assists</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {scorer.assists}
                    </span>
                  </div>
                )}
                <div className="text-right min-w-[45px]">
                  <span className="text-[10px] text-red-600 dark:text-red-400 uppercase tracking-wider block font-bold">
                    Goals
                  </span>
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    {scorer.goals}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopScorers;
