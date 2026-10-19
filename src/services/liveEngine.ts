import type { Match, MatchEvent } from '../types/football';
import { soundEffects } from '../utils/soundEffects';
import { fetchLiveMatchesFromApi, fetchLiveMatchSummary } from './liveFootballApi';
import { getKathmanduIsoDate, getKathmanduTimeString } from '../utils/dateRange';
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
  public selectedDate: string = getKathmanduIsoDate();
  private cacheByDate = new Map<string, { matches: Match[]; timestamp: number }>();

  constructor() {
    this.matches = [];
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

    const todayIso = getKathmanduIsoDate();
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
      if (liveMatches) {
        // Detect newly scored goals in real live matches
        if (this.matches.length > 0 && liveMatches.length > 0) {
          liveMatches.forEach((newMatch) => {
            const oldMatch = this.matches.find((m) => m.id === newMatch.id);
            if (oldMatch && (oldMatch.status === 'LIVE' || oldMatch.status === 'HT')) {
              const homeDiff = newMatch.homeScore - oldMatch.homeScore;
              const awayDiff = newMatch.awayScore - oldMatch.awayScore;
              if (homeDiff > 0 || awayDiff > 0) {
                const latestGoal = (newMatch.events || []).find((e) => e.type === 'GOAL') || {
                  id: `goal-${newMatch.id}-${Date.now()}`,
                  minute: newMatch.minute,
                  type: 'GOAL' as const,
                  teamId: homeDiff > 0 ? newMatch.homeTeam.id : newMatch.awayTeam.id,
                  playerName: homeDiff > 0 ? newMatch.homeTeam.name : newMatch.awayTeam.name,
                  description: `GOAL! ${homeDiff > 0 ? newMatch.homeTeam.name : newMatch.awayTeam.name} scores!`,
                };
                soundEffects.playGoalCheer();
                this.fireConfetti();
                this.goalListeners.forEach((cb) => cb(newMatch, latestGoal));
              }
            }
          });
        }

        // Merge favorites state
        const favSet = new Set(this.matches.filter((m) => m.isFavorite).map((m) => m.id));
        const updated = liveMatches.map((m) => ({
          ...m,
          isFavorite: favSet.has(m.id) || m.isFavorite,
        }));

        this.matches = updated;
        this.cacheByDate.set(this.selectedDate, { matches: updated, timestamp: now });
        this.isLiveFeedConnected = true;
        this.lastUpdatedTime = getKathmanduTimeString(new Date(), true);
        this.notify();
      }
    } catch (err) {
      console.warn('Could not refresh live matches from API:', err);
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
      const todayIso = getKathmanduIsoDate();
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
