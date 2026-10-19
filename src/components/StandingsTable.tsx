import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';
import { fetchLiveStandings } from '../services/liveFootballApi';
import type { StandingTeam } from '../types/football';

interface StandingsTableProps {
  language: Language;
}

type SupportedLeague = 'premier-league' | 'la-liga' | 'serie-a' | 'bundesliga' | 'ligue-1';

export const StandingsTable: React.FC<StandingsTableProps> = ({ language }) => {
  const [selectedLeague, setSelectedLeague] = useState<SupportedLeague>('premier-league');
  const [liveTable, setLiveTable] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLiveStandings(selectedLeague)
      .then((data) => {
        if (!isMounted) return;
        setLiveTable(data || []);
      })
      .catch(() => {
        if (isMounted) setLiveTable([]);
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
    { id: 'ligue-1', label: 'Ligue 1', flag: '🇫🇷' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
      {/* Header and League Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.standings}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-mono font-bold">
              Official Live Table
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

      {/* Standings Table */}
      <div className="overflow-x-auto mt-4 scrollbar-none">
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
            <span>Loading official standings...</span>
          </div>
        ) : liveTable.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Official standings currently unavailable from feed for this competition.
          </div>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">{t.rank}</th>
                <th className="pb-3">{t.team}</th>
                <th className="pb-3 text-center">{t.played}</th>
                <th className="pb-3 text-center">{t.won}</th>
                <th className="pb-3 text-center">{t.drawn}</th>
                <th className="pb-3 text-center">{t.lost}</th>
                <th className="pb-3 text-center hidden md:table-cell">{t.gf}</th>
                <th className="pb-3 text-center hidden md:table-cell">{t.ga}</th>
                <th className="pb-3 text-center">{t.gd}</th>
                <th className="pb-3 text-center font-black text-slate-900 dark:text-white">{t.pts}</th>
                <th className="pb-3 text-center hidden sm:table-cell">{t.form}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {liveTable.map((row) => (
                <tr
                  key={row.team.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-slate-700 dark:text-slate-200"
                >
                  {/* Rank & Zone Indicator */}
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1 h-5 rounded-full ${
                          row.zone === 'ucl'
                            ? 'bg-blue-600'
                            : row.zone === 'uel'
                            ? 'bg-amber-500'
                            : row.zone === 'relegation'
                            ? 'bg-red-600'
                            : 'bg-transparent'
                        }`}
                      />
                      <span className="font-mono font-bold text-xs">{row.rank}</span>
                    </div>
                  </td>

                  {/* Team Info */}
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      {row.team.logo ? (
                        <img src={row.team.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {row.team.shortName?.slice(0, 2)}
                        </div>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-none">
                        {row.team.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 text-center font-mono">{row.played}</td>
                  <td className="py-3 text-center font-mono">{row.won}</td>
                  <td className="py-3 text-center font-mono">{row.drawn}</td>
                  <td className="py-3 text-center font-mono">{row.lost}</td>
                  <td className="py-3 text-center font-mono text-slate-400 hidden md:table-cell">{row.gf}</td>
                  <td className="py-3 text-center font-mono text-slate-400 hidden md:table-cell">{row.ga}</td>
                  <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="py-3 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                    {row.points}
                  </td>

                  {/* Form Icons */}
                  <td className="py-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {(row.form || []).map((f, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded text-[9px] font-mono font-black flex items-center justify-center text-white ${
                            f === 'W' ? 'bg-emerald-600' : f === 'D' ? 'bg-slate-400' : 'bg-rose-600'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center gap-4 pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>UEFA Champions League</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>UEFA Europa League</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Relegation Zone</span>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
