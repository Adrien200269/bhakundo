import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import LeagueFilter from './components/LeagueFilter';
import type { FilterCategory } from './components/LeagueFilter';
import MatchCard from './components/MatchCard';
import MatchDetailModal from './components/MatchDetailModal';
import StandingsTable from './components/StandingsTable';
import TopScorers from './components/TopScorers';
import GoalAlertToast from './components/GoalAlertToast';
import ApiConfigModal from './components/ApiConfigModal';
import DateNavigator from './components/DateNavigator';
import { formatIsoDate } from './utils/dateRange';
import BentoGrid from './components/BentoGrid';
import RightSidebarTicker from './components/RightSidebarTicker';
import NepaliFlag from './components/NepaliFlag';
import type { Match, MatchEvent } from './types/football';
import { liveEngine } from './services/liveEngine';
import { soundEffects } from './utils/soundEffects';
import { useTheme } from './utils/theme';
import type { Language } from './utils/translations';
import { translations } from './utils/translations';
import { Trophy, Award, Radio, Settings, Shield, RefreshCw, Calendar } from 'lucide-react';

type MainView = 'matches' | 'standings' | 'scorers';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeView, setActiveView] = useState<MainView>('matches');
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [simulationSpeed, setSimulationSpeed] = useState<'paused' | 'normal' | 'fast'>('normal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [goalAlert, setGoalAlert] = useState<{ match: Match; event: MatchEvent } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMatchDetails, setIsLoadingMatchDetails] = useState(false);

  const t = translations[language];

  // Subscribe to real-time football engine updates
  useEffect(() => {
    const unsubscribeMatches = liveEngine.subscribe((updatedMatches) => {
      setMatches(updatedMatches);
      setLastUpdatedTime(liveEngine.lastUpdatedTime || 'Just now');
      setIsLiveConnected(liveEngine.isLiveFeedConnected);

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

  const handleDateSelect = (dateIso: string) => {
    setSelectedDate(dateIso);
    setIsRefreshing(true);
    liveEngine.refreshLiveMatches(dateIso).finally(() => {
      setIsRefreshing(false);
    });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    soundEffects.playClick();
    liveEngine.refreshLiveMatches(selectedDate, true).finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsLoadingMatchDetails(true);
    liveEngine
      .enrichMatch(match)
      .then((enriched) => {
        setSelectedMatch(enriched);
      })
      .finally(() => {
        setIsLoadingMatchDetails(false);
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
          (match.homeTeam?.name || '').toLowerCase().includes(q) ||
          (match.awayTeam?.name || '').toLowerCase().includes(q) ||
          (match.leagueName || '').toLowerCase().includes(q) ||
          (match.stadium || '').toLowerCase().includes(q) ||
          (match.events || []).some((e) => (e.playerName || '').toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Category filter
      if (activeFilter === 'live') {
        return match.status === 'LIVE' || match.status === 'HT';
      }
      if (activeFilter === 'nepal') {
        return match.leagueCountry === 'Nepal' || match.homeTeam?.country === 'Nepal';
      }
      if (activeFilter === 'premier-league') {
        return match.leagueId === 'premier-league';
      }
      if (activeFilter === 'champions-league') {
        return match.leagueId === 'champions-league';
      }
      if (activeFilter === 'europa-league') {
        return match.leagueId === 'europa-league';
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-200">
      
      {/* 1. Header & Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Navigation Bar (Matches / Standings / Top Scorers) */}
      <nav className="bg-white/80 dark:bg-slate-900/50 border-b border-slate-200/90 dark:border-slate-800/80 sticky top-18 z-30 backdrop-blur-md transition-colors">
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
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Radio className={`w-4 h-4 ${liveCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
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
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>{t.standings}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('scorers');
                  soundEffects.playClick();
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === 'scorers'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>{t.topScorers}</span>
              </button>
            </div>

            {/* Live API Feed Status & Manual Refresh */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{language === 'ne' ? 'प्रत्यक्ष फिड सक्रिय' : 'Live Feed Active'}</span>
              </div>

              <button
                onClick={handleManualRefresh}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title="Refresh live matches from API"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  soundEffects.playClick();
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
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
          <div className="space-y-6">
            
            {/* 1-Month Date Ribbon (-7 days to +21 days) */}
            <DateNavigator
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              language={language}
              isLiveFeedConnected={isLiveConnected}
              lastUpdatedTime={lastUpdatedTime}
              isRefreshing={isRefreshing}
              onRefresh={handleManualRefresh}
              totalMatchesCount={filteredMatches.length}
              liveMatchesCount={liveCount}
            />

            {/* Context notice when browsing past or future dates */}
            {selectedDate !== todayIso && (
              <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs shadow-xs transition-colors">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    {language === 'ne'
                      ? `${selectedDate} को खेलहरू देखाइँदैछ।`
                      : `Viewing matches for ${selectedDate}.`}
                  </span>
                </div>
                <button
                  onClick={() => handleDateSelect(todayIso)}
                  className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  {language === 'ne' ? 'आजका खेलहरू' : 'Return to Today'}
                </button>
              </div>
            )}

            {/* Bento Grid Showcase Hub (Featured Match, Nepal NSL Card, Live Stats) - shown on Today */}
            {selectedDate === todayIso && !searchQuery && activeFilter === 'all' && (
              <BentoGrid
                matches={matches}
                onSelectMatch={handleSelectMatch}
                onFilterCategory={setActiveFilter}
                language={language}
              />
            )}

            {/* Main 2-Column Responsive Layout: Left Matches + Right Animated Ticker Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Main Matches Area (8 columns on lg) */}
              <div className="lg:col-span-8 space-y-5">
                {/* Competition Filter Strip */}
                <LeagueFilter
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  language={language}
                  liveCount={liveCount}
                  simulationSpeed={simulationSpeed}
                  onSpeedChange={handleSpeedChange}
                />

                {/* Matches Grid */}
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3 shadow-sm">
                    <div className="text-4xl">⚽</div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-300">{t.noMatchesFound}</h4>
                    <p className="text-xs text-slate-500">
                      Try clearing your search query or selecting a different category.
                    </p>
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
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

              {/* Right Column: Sticky Live Animated Scrolling Ticker Sidebar (4 columns on lg) */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
                <RightSidebarTicker
                  matches={matches}
                  onSelectMatch={handleSelectMatch}
                  language={language}
                  onSimulateGoal={handleSimulateGoal}
                />
              </div>
            </div>
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
        isLoading={isLoadingMatchDetails}
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
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <NepaliFlag size="md" />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 justify-center md:justify-start">
                <span>Bhakundo</span>
                <span className="text-red-600 font-semibold">(भाकुण्डो)</span>
                <span>🇳🇵</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
                The Pure, Ad-Free Real-Time Football Network for Nepal and Global Fans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Ad-Free & Privacy First</span>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>Live Nepal Super League (NSL)</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>European & Global Competitions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
