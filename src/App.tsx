import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import AdFreeBanner from './components/AdFreeBanner';
import LeagueFilter from './components/LeagueFilter';
import type { FilterCategory } from './components/LeagueFilter';
import MatchCard from './components/MatchCard';
import MatchDetailModal from './components/MatchDetailModal';
import StandingsTable from './components/StandingsTable';
import TopScorers from './components/TopScorers';
import GoalAlertToast from './components/GoalAlertToast';
import ApiConfigModal from './components/ApiConfigModal';
import NepaliFlag from './components/NepaliFlag';
import type { Match, MatchEvent } from './types/football';
import { liveEngine } from './services/liveEngine';
import { soundEffects } from './utils/soundEffects';
import type { Language } from './utils/translations';
import { translations } from './utils/translations';
import { Trophy, Award, Radio, Settings, Shield, RefreshCw } from 'lucide-react';

type MainView = 'matches' | 'standings' | 'scorers';

export const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeView, setActiveView] = useState<MainView>('matches');
  const [activeDateTab, setActiveDateTab] = useState<'yesterday' | 'today' | 'tomorrow'>('today');
  const [simulationSpeed, setSimulationSpeed] = useState<'paused' | 'normal' | 'fast'>('normal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [goalAlert, setGoalAlert] = useState<{ match: Match; event: MatchEvent } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = translations[language];

  // Subscribe to real-time football engine updates
  useEffect(() => {
    const unsubscribeMatches = liveEngine.subscribe((updatedMatches) => {
      setMatches(updatedMatches);

      // Keep selected match modal synchronized in real time
      setSelectedMatch((prev) => {
        if (!prev) return null;
        const current = updatedMatches.find((m) => m.id === prev.id);
        return current || prev;
      });
    });

    const unsubscribeGoals = liveEngine.onGoal((match, event) => {
      setGoalAlert({ match, event });
    });

    return () => {
      unsubscribeMatches();
      unsubscribeGoals();
    };
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
  };

  const handleSpeedChange = (speed: 'paused' | 'normal' | 'fast') => {
    setSimulationSpeed(speed);
    liveEngine.setSimulationSpeed(speed);
  };

  const handleToggleFavorite = (matchId: string) => {
    liveEngine.toggleFavorite(matchId);
  };

  const handleSimulateGoal = (matchId: string) => {
    liveEngine.triggerTestGoal(matchId);
  };

  const handleDateChange = (dateOffset: 'yesterday' | 'today' | 'tomorrow') => {
    setActiveDateTab(dateOffset);
    let targetDateObj = new Date();
    if (dateOffset === 'yesterday') {
      targetDateObj = new Date(Date.now() - 86400000);
    } else if (dateOffset === 'tomorrow') {
      targetDateObj = new Date(Date.now() + 86400000);
    }
    const targetDateStr = targetDateObj.toISOString().split('T')[0].replace(/-/g, '');
    setIsRefreshing(true);
    liveEngine.refreshLiveMatches(targetDateStr).finally(() => setIsRefreshing(false));
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    soundEffects.playClick();
    liveEngine.refreshLiveMatches().finally(() => {
      setTimeout(() => setIsRefreshing(false), 600);
    });
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    liveEngine.enrichMatch(match).then((enriched) => {
      setSelectedMatch(enriched);
    });
  };

  // Live match count for badge
  const liveCount = useMemo(() => {
    return matches.filter((m) => m.status === 'LIVE' || m.status === 'HT').length;
  }, [matches]);

  // Filter and search matches
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          match.homeTeam.name.toLowerCase().includes(q) ||
          match.awayTeam.name.toLowerCase().includes(q) ||
          match.leagueName.toLowerCase().includes(q) ||
          match.stadium.toLowerCase().includes(q) ||
          match.events.some((e) => e.playerName.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Category filter
      if (activeFilter === 'live') {
        return match.status === 'LIVE' || match.status === 'HT';
      }
      if (activeFilter === 'nepal') {
        return match.leagueCountry === 'Nepal' || match.homeTeam.country === 'Nepal';
      }
      if (activeFilter === 'premier-league') {
        return match.leagueId === 'premier-league';
      }
      if (activeFilter === 'champions-league') {
        return match.leagueId === 'champions-league';
      }
      if (activeFilter === 'la-liga') {
        return match.leagueId === 'la-liga';
      }
      if (activeFilter === 'favorites') {
        return !!match.isFavorite;
      }

      return true;
    });
  }, [matches, searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. Header & Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* 2. 100% Ad-Free Guarantee Banner */}
      <AdFreeBanner language={language} />

      {/* 3. Main Navigation Bar (Matches / Standings / Top Scorers) */}
      <nav className="bg-slate-900/50 border-b border-slate-800/80 sticky top-18 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  setActiveView('matches');
                  soundEffects.playClick();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === 'matches'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className={`w-4 h-4 ${liveCount > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                <span>{language === 'ne' ? 'खेलहरू (Matches)' : 'Matches'}</span>
                {liveCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white">
                    {liveCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveView('standings');
                  soundEffects.playClick();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === 'standings'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{t.standings}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('scorers');
                  soundEffects.playClick();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === 'scorers'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4 text-rose-400" />
                <span>{t.topScorers}</span>
              </button>
            </div>

            {/* Live API Feed Status & Manual Refresh */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Feed Active</span>
              </div>

              <button
                onClick={handleManualRefresh}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Refresh live matches from API"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  soundEffects.playClick();
                }}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Settings & Data Engine"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: MATCHES */}
        {activeView === 'matches' && (
          <div className="space-y-5">
            {/* Filter and Date Strip */}
            <LeagueFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              language={language}
              liveCount={liveCount}
              selectedDate="2026-10-19"
              onDateChange={handleDateChange}
              activeDateTab={activeDateTab}
              simulationSpeed={simulationSpeed}
              onSpeedChange={handleSpeedChange}
            />

            {/* Matches Grid */}
            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
                <div className="text-4xl">⚽</div>
                <h4 className="text-base font-bold text-slate-300">{t.noMatchesFound}</h4>
                <p className="text-xs text-slate-500">
                  Try clearing your search query or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onSelect={handleSelectMatch}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STANDINGS */}
        {activeView === 'standings' && (
          <div className="space-y-6">
            <StandingsTable language={language} />
          </div>
        )}

        {/* VIEW 3: TOP SCORERS */}
        {activeView === 'scorers' && (
          <div className="space-y-6">
            <TopScorers language={language} />
          </div>
        )}
      </main>

      {/* 5. Match Detail Deep-Dive Modal */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        language={language}
        onSimulateGoal={handleSimulateGoal}
      />

      {/* 6. Real-time Goal Alert Toast Popup */}
      <GoalAlertToast
        goalAlert={goalAlert}
        onDismiss={() => setGoalAlert(null)}
        onSelectMatch={handleSelectMatch}
      />

      {/* 7. Settings & API Modal */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
      />

      {/* 8. Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <NepaliFlag size="md" />
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5 justify-center md:justify-start">
                <span>Bhakundo</span>
                <span className="text-red-500 font-normal">(भाकुण्डो)</span>
                <span>🇳🇵</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The Pure, Ad-Free Real-Time Football Network for Nepal and Global Fans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Ad-Free & Privacy First</span>
            </span>
            <span className="text-slate-600">•</span>
            <span>Live Nepal Super League (NSL)</span>
            <span className="text-slate-600">•</span>
            <span>European & Global Competitions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
