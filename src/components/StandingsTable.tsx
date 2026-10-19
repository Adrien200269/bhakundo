import React, { useState, useEffect } from 'react';
import { MOCK_STANDINGS } from '../data/mockData';
import { Trophy, RefreshCw } from 'lucide-react';
import NepaliFlag from './NepaliFlag';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';
import { fetchLiveStandings } from '../services/liveFootballApi';
import type { StandingTeam } from '../types/football';

interface StandingsTableProps {
  language: Language;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ language }) => {
  const [selectedLeague, setSelectedLeague] = useState<'nsl' | 'premier-league' | 'la-liga'>('premier-league');
  const [liveTable, setLiveTable] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const t = translations[language];

  useEffect(() => {
    if (selectedLeague === 'nsl') {
      setLiveTable(MOCK_STANDINGS.nsl.table);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchLiveStandings(selectedLeague)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          setLiveTable(data);
        } else {
          setLiveTable(MOCK_STANDINGS[selectedLeague]?.table || []);
        }
      })
      .catch(() => {
        if (isMounted) setLiveTable(MOCK_STANDINGS[selectedLeague]?.table || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLeague]);

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
      {/* Header and League Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.standings}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-mono font-bold">
              Live Season
            </span>
          </h3>
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => {
              setSelectedLeague('premier-league');
              soundEffects.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedLeague === 'premier-league'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
            <span>Premier League</span>
          </button>
          <button
            onClick={() => {
              setSelectedLeague('la-liga');
              soundEffects.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedLeague === 'la-liga'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>🇪🇸</span>
            <span>La Liga</span>
          </button>
          <button
            onClick={() => {
              setSelectedLeague('nsl');
              soundEffects.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedLeague === 'nsl'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <NepaliFlag size="sm" className="w-3.5 h-4" />
            <span>Nepal Super League</span>
          </button>
        </div>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto mt-4 scrollbar-none">
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
            <span>Loading live official standings...</span>
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
                  {/* Rank */}
                  <td className="py-3 pl-2 font-mono">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md font-bold text-xs ${
                        row.zone === 'champions' || row.zone === 'ucl'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          : row.zone === 'relegation'
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30'
                          : row.zone === 'uel'
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>

                  {/* Team Name */}
                  <td className="py-3 font-bold flex items-center gap-2">
                    {row.team.logo ? (
                      <img src={row.team.logo} alt="" className="w-5 h-5 object-contain" />
                    ) : row.team.flag ? (
                      <span className="text-sm">{row.team.flag}</span>
                    ) : null}
                    <span className="text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-xs">{row.team.name}</span>
                  </td>

                  {/* Numbers */}
                  <td className="py-3 text-center font-mono">{row.played}</td>
                  <td className="py-3 text-center font-mono">{row.won}</td>
                  <td className="py-3 text-center font-mono">{row.drawn}</td>
                  <td className="py-3 text-center font-mono">{row.lost}</td>
                  <td className="py-3 text-center font-mono hidden md:table-cell text-slate-500 dark:text-slate-400">
                    {row.gf}
                  </td>
                  <td className="py-3 text-center font-mono hidden md:table-cell text-slate-500 dark:text-slate-400">
                    {row.ga}
                  </td>
                  <td className="py-3 text-center font-mono">
                    <span className={row.gd > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : row.gd < 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                    {row.points}
                  </td>

                  {/* Form guide pills */}
                  <td className="py-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((f, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                            f === 'W'
                              ? 'bg-emerald-600'
                              : f === 'D'
                              ? 'bg-slate-500'
                              : 'bg-rose-600'
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
    </div>
  );
};

export default StandingsTable;
