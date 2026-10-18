import React from 'react';
import { MOCK_TOP_SCORERS } from '../data/mockData';
import { Award } from 'lucide-react';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface TopScorersProps {
  language: Language;
}

export const TopScorers: React.FC<TopScorersProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <Award className="w-5 h-5 text-amber-400" />
        <h3 className="font-extrabold text-base sm:text-lg text-white">
          {t.topScorers} (Golden Boot Race)
        </h3>
      </div>

      <div className="divide-y divide-slate-800/60 mt-3">
        {MOCK_TOP_SCORERS.map((scorer) => {
          return (
            <div
              key={scorer.playerName}
              className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-slate-850/50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                    scorer.rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : scorer.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : scorer.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {scorer.rank}
                </span>

                <div>
                  <h4 className="font-extrabold text-white flex items-center gap-1.5">
                    <span>{scorer.playerName}</span>
                    {scorer.team.flag && <span>{scorer.team.flag}</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {scorer.team.name}
                  </p>
                </div>
              </div>

              {/* Stats right */}
              <div className="flex items-center gap-4 font-mono">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{t.assists}</span>
                  <span className="font-bold text-slate-300">{scorer.assists}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{t.matches}</span>
                  <span className="font-bold text-slate-300">{scorer.matchesPlayed}</span>
                </div>
                <div className="text-right min-w-[40px]">
                  <span className="text-xs text-red-400 font-bold block">{t.goals}</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">
                    {scorer.goals}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopScorers;
