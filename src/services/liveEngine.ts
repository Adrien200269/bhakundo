import type { Match, MatchEvent, CommentaryItem } from '../types/football';
import { INITIAL_MATCHES } from '../data/mockData';
import { soundEffects } from '../utils/soundEffects';
import { fetchLiveMatchesFromApi, fetchLiveMatchSummary } from './liveFootballApi';
import confetti from 'canvas-confetti';

export type GoalCallback = (match: Match, event: MatchEvent) => void;
export type MatchesUpdateCallback = (matches: Match[]) => void;

class LiveFootballEngine {
  private matches: Match[] = [];
  private listeners: MatchesUpdateCallback[] = [];
  private goalListeners: GoalCallback[] = [];
  private intervalId: number | null = null;
  private apiPollIntervalId: number | null = null;
  public simulationSpeed: 'paused' | 'normal' | 'fast' = 'normal';
  public apiKey: string = '';
  public externalApiProvider: 'none' | 'football-data' = 'none';
  public isLiveFeedConnected: boolean = false;
  public lastUpdatedTime: string = 'Just now';
  public selectedDate: string = new Date().toISOString().split('T')[0];
  private cacheByDate = new Map<string, { matches: Match[]; timestamp: number }>();

  constructor() {
    // Start with initial seed, then immediately hydrate with live worldwide data
    this.matches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
    this.refreshLiveMatches(this.selectedDate, true);
    this.startEngine();
    this.startApiPolling();
    this.setupAutoSyncListeners();
  }

  private setupAutoSyncListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // Immediately check and update data when user returns to the tab
          this.refreshLiveMatches(this.selectedDate, true);
        }
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isLiveFeedConnected = true;
        this.refreshLiveMatches(this.selectedDate, true);
      });
      window.addEventListener('offline', () => {
        this.isLiveFeedConnected = false;
        this.notify();
      });
    }
  }

  public getMatches(): Match[] {
    return this.matches;
  }

  public async refreshLiveMatches(targetDate?: string, force = false): Promise<void> {
    if (targetDate) {
      this.selectedDate = targetDate;
    }

    const todayIso = new Date().toISOString().split('T')[0];
    const isToday = this.selectedDate === todayIso;

    // Check cache: for past/future dates, cached data is immediately re-usable
    const cached = this.cacheByDate.get(this.selectedDate);
    const now = Date.now();
    if (!force && cached && (!isToday || (now - cached.timestamp < 25000))) {
      this.matches = cached.matches;
      this.notify();
      return;
    }

    try {
      const liveMatches = await fetchLiveMatchesFromApi(this.selectedDate);
      if (liveMatches && liveMatches.length > 0) {
        // Merge favorites state
        const favSet = new Set(this.matches.filter((m) => m.isFavorite).map((m) => m.id));
        const updated = liveMatches.map((m) => ({
          ...m,
          isFavorite: favSet.has(m.id) || m.isFavorite,
        }));

        this.matches = updated;
        this.cacheByDate.set(this.selectedDate, { matches: updated, timestamp: now });
        this.isLiveFeedConnected = true;
        this.lastUpdatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.notify();
      }
    } catch (err) {
      console.warn('Could not refresh live matches from API, using cached matches:', err);
    }
  }

  public async enrichMatch(match: Match): Promise<Match> {
    try {
      const enriched = await fetchLiveMatchSummary(match);
      this.matches = this.matches.map((m) => (m.id === enriched.id ? enriched : m));
      this.notify();
      return enriched;
    } catch {
      return match;
    }
  }

  public subscribe(callback: MatchesUpdateCallback): () => void {
    this.listeners.push(callback);
    callback(this.matches);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public onGoal(callback: GoalCallback): () => void {
    this.goalListeners.push(callback);
    return () => {
      this.goalListeners = this.goalListeners.filter((cb) => cb !== callback);
    };
  }

  public toggleFavorite(matchId: string) {
    this.matches = this.matches.map((m) =>
      m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
    );
    this.notify();
  }

  public setSimulationSpeed(speed: 'paused' | 'normal' | 'fast') {
    this.simulationSpeed = speed;
    this.startEngine();
  }

  public triggerTestGoal(matchId?: string) {
    const liveMatches = this.matches.filter((m) => m.status === 'LIVE');
    const target = matchId
      ? this.matches.find((m) => m.id === matchId)
      : liveMatches[Math.floor(Math.random() * liveMatches.length)] || this.matches[0];

    if (!target) return;

    // Pick home or away team randomly
    const isHome = Math.random() > 0.5;
    const team = isHome ? target.homeTeam : target.awayTeam;
    const scorerName = isHome ? `${team.shortName} Star Striker` : `${team.shortName} Forward`;

    const newEvent: MatchEvent = {
      id: `ev-manual-${Date.now()}`,
      minute: Math.min(target.minute + 1, 90),
      type: 'GOAL',
      teamId: team.id,
      playerName: scorerName,
      description: 'GOAL! Sensational strike blasted into the top netting!',
    };

    const newComment: CommentaryItem = {
      id: `comm-manual-${Date.now()}`,
      minute: newEvent.minute,
      type: 'goal',
      text: `GOAAALLL! ${scorerName} scores an unbelievable goal for ${team.name}!`,
      teamId: team.id,
    };

    this.matches = this.matches.map((m) => {
      if (m.id !== target.id) return m;

      const newHomeScore = isHome ? m.homeScore + 1 : m.homeScore;
      const newAwayScore = !isHome ? m.awayScore + 1 : m.awayScore;
      const updatedEvents = [newEvent, ...m.events];
      const updatedComm = [newComment, ...(m.commentary || [])];

      // Update shot and xG stats
      const newStats = { ...m.stats };
      if (isHome) {
        newStats.shots[0] += 1;
        newStats.shotsOnTarget[0] += 1;
        newStats.xG[0] = Number((newStats.xG[0] + 0.45).toFixed(2));
      } else {
        newStats.shots[1] += 1;
        newStats.shotsOnTarget[1] += 1;
        newStats.xG[1] = Number((newStats.xG[1] + 0.45).toFixed(2));
      }

      const updatedMatch: Match = {
        ...m,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        events: updatedEvents,
        stats: newStats,
        commentary: updatedComm,
      };

      // Sound & Visual Confetti
      soundEffects.playGoalCheer();
      this.fireConfetti();

      // Trigger goal notifications
      this.goalListeners.forEach((cb) => cb(updatedMatch, newEvent));

      return updatedMatch;
    });

    this.notify();
  }

  private fireConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DC143C', '#003893', '#10b981', '#ffffff', '#fbbf24'],
      });
    } catch {
      // ignore
    }
  }

  private startApiPolling() {
    if (this.apiPollIntervalId) {
      clearInterval(this.apiPollIntervalId);
    }
    // Poll API every 25 seconds for continuous real-world match updates
    this.apiPollIntervalId = window.setInterval(() => {
      const todayIso = new Date().toISOString().split('T')[0];
      // Keep today's live scores or currently viewed date continuously updated
      this.refreshLiveMatches(this.selectedDate || todayIso, true);
    }, 25000);
  }

  private startEngine() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.simulationSpeed === 'paused') return;

    // Normal = ticks every 4s, Fast = ticks every 1.5s
    const tickRate = this.simulationSpeed === 'fast' ? 1500 : 4000;

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, tickRate);
  }

  private tick() {
    let hasChanges = false;

    this.matches = this.matches.map((match) => {
      if (match.status !== 'LIVE') return match;

      hasChanges = true;
      const nextMinute = match.minute + 1;

      // Handle full-time
      if (nextMinute > 90) {
        return {
          ...match,
          minute: 90,
          status: 'FINISHED',
        };
      }

      // Handle halftime
      if (nextMinute === 45 && match.status === 'LIVE') {
        return {
          ...match,
          minute: 45,
          status: 'HT',
        };
      }

      return {
        ...match,
        minute: nextMinute,
      };
    });

    if (hasChanges) {
      this.notify();
    }
  }

  private notify() {
    this.listeners.forEach((callback) => callback(this.matches));
  }
}

export const liveEngine = new LiveFootballEngine();
