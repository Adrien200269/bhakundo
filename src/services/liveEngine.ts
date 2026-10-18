import type { Match, MatchEvent, CommentaryItem } from '../types/football';
import { INITIAL_MATCHES } from '../data/mockData';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

export type GoalCallback = (match: Match, event: MatchEvent) => void;
export type MatchesUpdateCallback = (matches: Match[]) => void;

class LiveFootballEngine {
  private matches: Match[] = [];
  private listeners: MatchesUpdateCallback[] = [];
  private goalListeners: GoalCallback[] = [];
  private intervalId: number | null = null;
  public simulationSpeed: 'paused' | 'normal' | 'fast' = 'normal';
  public apiKey: string = '';
  public externalApiProvider: 'none' | 'football-data' = 'none';

  constructor() {
    this.matches = JSON.parse(JSON.stringify(INITIAL_MATCHES));
    this.startEngine();
  }

  public getMatches(): Match[] {
    return this.matches;
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
          commentary: [
            {
              id: `ft-${Date.now()}`,
              minute: 90,
              type: 'normal',
              text: 'Full time! The referee blows the final whistle to end this dramatic match.',
            },
            ...(match.commentary || []),
          ],
        };
      }

      // Handle halftime
      if (nextMinute === 45 && match.status === 'LIVE') {
        return {
          ...match,
          minute: 45,
          status: 'HT',
          commentary: [
            {
              id: `ht-${Date.now()}`,
              minute: 45,
              type: 'normal',
              text: 'Half-time whistle. Players head to the tunnel for team talks.',
            },
            ...(match.commentary || []),
          ],
        };
      }

      // Random in-match events (~12% chance per minute tick)
      const eventRoll = Math.random();
      let updatedMatch = { ...match, minute: nextMinute };

      if (eventRoll < 0.04) {
        // GOAL EVENT!
        const isHome = Math.random() > 0.48;
        const team = isHome ? match.homeTeam : match.awayTeam;
        const playerPool = isHome
          ? match.homeLineup?.startingXI.filter((p) => p.position === 'FWD' || p.position === 'MID') || []
          : match.awayLineup?.startingXI.filter((p) => p.position === 'FWD' || p.position === 'MID') || [];
        const scorer = playerPool.length > 0 ? playerPool[Math.floor(Math.random() * playerPool.length)].name : `${team.shortName} Number 9`;

        const newGoalEvent: MatchEvent = {
          id: `goal-${Date.now()}`,
          minute: nextMinute,
          type: 'GOAL',
          teamId: team.id,
          playerName: scorer,
          description: `GOAL! ${scorer} finishes with ruthless composure!`,
        };

        const newGoalComm: CommentaryItem = {
          id: `comm-g-${Date.now()}`,
          minute: nextMinute,
          type: 'goal',
          text: `GOAAALLL! Fantastic strike by ${scorer}! The crowd erupts!`,
          teamId: team.id,
        };

        updatedMatch.homeScore = isHome ? match.homeScore + 1 : match.homeScore;
        updatedMatch.awayScore = !isHome ? match.awayScore + 1 : match.awayScore;
        updatedMatch.events = [newGoalEvent, ...match.events];
        updatedMatch.commentary = [newGoalComm, ...(match.commentary || [])];

        // Trigger goal celebration
        soundEffects.playGoalCheer();
        this.fireConfetti();
        this.goalListeners.forEach((cb) => cb(updatedMatch, newGoalEvent));
      } else if (eventRoll < 0.08) {
        // YELLOW CARD EVENT
        const isHome = Math.random() > 0.5;
        const team = isHome ? match.homeTeam : match.awayTeam;
        const cardEvent: MatchEvent = {
          id: `card-${Date.now()}`,
          minute: nextMinute,
          type: 'YELLOW_CARD',
          teamId: team.id,
          playerName: `${team.shortName} Defender`,
          description: 'Yellow card shown for reckless challenge.',
        };
        const cardComm: CommentaryItem = {
          id: `comm-c-${Date.now()}`,
          minute: nextMinute,
          type: 'card',
          text: `Yellow card awarded to ${team.name} following a late tackle.`,
          teamId: team.id,
        };
        updatedMatch.events = [cardEvent, ...match.events];
        updatedMatch.commentary = [cardComm, ...(match.commentary || [])];
        soundEffects.playWhistle();
      } else if (eventRoll < 0.13) {
        // DANGEROUS CHANCE / SHOT
        const isHome = Math.random() > 0.5;
        const team = isHome ? match.homeTeam : match.awayTeam;
        const chanceComm: CommentaryItem = {
          id: `comm-ch-${Date.now()}`,
          minute: nextMinute,
          type: 'chance',
          text: `Close! ${team.name} launch a fast break and the shot rattles the side netting!`,
          teamId: team.id,
        };
        const newStats = { ...match.stats };
        if (isHome) {
          newStats.shots[0] += 1;
        } else {
          newStats.shots[1] += 1;
        }
        updatedMatch.stats = newStats;
        updatedMatch.commentary = [chanceComm, ...(match.commentary || [])];
      }

      return updatedMatch;
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
