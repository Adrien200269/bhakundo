export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED' | 'HT' | 'ET' | 'PEN';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  x?: number; // 0-100% for pitch visualizer
  y?: number; // 0-100% for pitch visualizer
  isCaptain?: boolean;
  yellowCards?: number;
  redCard?: boolean;
  redCards?: number;
  goals?: number;
  subbed?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  flag?: string;
  form?: ('W' | 'D' | 'L')[];
}

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'VAR' | 'PENALTY_SAVED' | 'OWN_GOAL';
  teamId: string;
  playerName: string;
  assistPlayerName?: string;
  subInPlayerName?: string;
  description?: string;
}

export interface MatchStats {
  possession: [number, number]; // [home, away] %
  shots: [number, number];
  shotsOnTarget: [number, number];
  xG: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
  passes: [number, number];
  passAccuracy: [number, number];
}

export interface CommentaryItem {
  id: string;
  minute: number;
  type: 'goal' | 'card' | 'sub' | 'chance' | 'normal';
  text: string;
  teamId?: string;
}

export interface Lineup {
  formation: string; // e.g. "4-3-3", "4-2-3-1"
  startingXI: Player[];
  substitutes: Player[];
  manager: string;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

export interface Match {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueCountry: string;
  leagueFlag?: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute: number; // 1 to 90+
  extraTime?: number;
  startTime: string; // ISO string or time "20:45"
  date: string; // "YYYY-MM-DD"
  stadium: string;
  city: string;
  referee?: string;
  attendance?: string;
  events: MatchEvent[];
  stats: MatchStats;
  homeLineup?: Lineup;
  awayLineup?: Lineup;
  h2h?: HeadToHeadMatch[];
  commentary?: CommentaryItem[];
  isFavorite?: boolean;
}

export interface StandingTeam {
  rank: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
  form: ('W' | 'D' | 'L')[];
  zone?: 'ucl' | 'uel' | 'relegation' | 'champions' | 'none';
}

export interface LeagueStanding {
  leagueId: string;
  leagueName: string;
  country: string;
  season: string;
  table: StandingTeam[];
}

export interface TopScorer {
  rank: number;
  playerName: string;
  playerPhoto?: string;
  team: Team;
  goals: number;
  assists: number;
  matchesPlayed: number;
  penalties: number;
}
