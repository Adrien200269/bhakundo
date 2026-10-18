import type { Match, MatchEvent, MatchStats, CommentaryItem, Lineup, HeadToHeadMatch, StandingTeam, Player } from '../types/football';
import { INITIAL_MATCHES } from '../data/mockData';

// Public ESPN soccer leagues
export const LEAGUES_CONFIG = [
  { id: 'eng.1', key: 'premier-league', name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'esp.1', key: 'la-liga', name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: 'uefa.champions', key: 'champions-league', name: 'UEFA Champions League', country: 'Europe', flag: '⭐' },
  { id: 'ita.1', key: 'serie-a', name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: 'ger.1', key: 'bundesliga', name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { id: 'fra.1', key: 'ligue-1', name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
];

export async function fetchLiveMatchesFromApi(targetDate?: string): Promise<Match[]> {
  const matchesList: Match[] = [];

  // 1. Fetch real-world matches across top global leagues
  for (const cfg of LEAGUES_CONFIG) {
    try {
      let url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${cfg.id}/scoreboard`;
      if (targetDate) {
        const cleanDate = targetDate.replace(/-/g, '');
        url += `?dates=${cleanDate}`;
      }

      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const events = data.events || [];

      for (const ev of events) {
        const comp = ev.competitions?.[0];
        if (!comp) continue;

        const homeComp = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home') || comp.competitors?.[0];
        const awayComp = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'away') || comp.competitors?.[1];

        if (!homeComp || !awayComp) continue;

        // Parse status
        const state = ev.status?.type?.state; // 'in', 'pre', 'post'
        let status: Match['status'] = 'UPCOMING';
        if (state === 'in') {
          status = ev.status?.period === 1 && ev.status?.clock >= 2700 ? 'HT' : 'LIVE';
        } else if (state === 'post') {
          status = 'FINISHED';
        }

        const clockText = ev.status?.displayClock || '';
        const minuteParsed = parseInt(clockText.replace(/[^0-9]/g, '')) || (status === 'FINISHED' ? 90 : 0);

        // Parse ISO start time
        const eventDateObj = new Date(ev.date || comp.date);
        const startTimeStr = eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = eventDateObj.toISOString().split('T')[0];

        // Format team forms
        const parseForm = (formStr?: string): ('W' | 'D' | 'L')[] => {
          if (!formStr) return ['W', 'D', 'W'];
          return formStr.split('').slice(0, 5).map((f) => (f === 'W' || f === 'D' || f === 'L' ? f : 'W'));
        };

        const homeTeamId = `team-${homeComp.id || homeComp.team?.id || 'home'}`;
        const awayTeamId = `team-${awayComp.id || awayComp.team?.id || 'away'}`;

        const match: Match = {
          id: `espn-${ev.id}`,
          leagueId: cfg.key,
          leagueName: cfg.name,
          leagueCountry: cfg.country,
          leagueFlag: cfg.flag,
          homeTeam: {
            id: homeTeamId,
            name: homeComp.team?.displayName || homeComp.team?.name || 'Home Team',
            shortName: homeComp.team?.abbreviation || homeComp.team?.shortDisplayName || 'HME',
            logo: homeComp.team?.logo || '',
            country: cfg.country,
            form: parseForm(homeComp.form),
          },
          awayTeam: {
            id: awayTeamId,
            name: awayComp.team?.displayName || awayComp.team?.name || 'Away Team',
            shortName: awayComp.team?.abbreviation || awayComp.team?.shortDisplayName || 'AWY',
            logo: awayComp.team?.logo || '',
            country: cfg.country,
            form: parseForm(awayComp.form),
          },
          homeScore: parseInt(homeComp.score || '0', 10) || 0,
          awayScore: parseInt(awayComp.score || '0', 10) || 0,
          status,
          minute: minuteParsed,
          startTime: startTimeStr,
          date: dateStr,
          stadium: comp.venue?.fullName || 'Stadium',
          city: comp.venue?.address?.city || cfg.country,
          referee: comp.officials?.[0]?.displayName || undefined,
          attendance: comp.attendance ? comp.attendance.toLocaleString() : undefined,
          events: [],
          stats: {
            possession: [50, 50],
            shots: [0, 0],
            shotsOnTarget: [0, 0],
            xG: [0, 0],
            corners: [0, 0],
            fouls: [0, 0],
            yellowCards: [0, 0],
            redCards: [0, 0],
            offsides: [0, 0],
            passes: [0, 0],
            passAccuracy: [0, 0],
          },
          commentary: [],
          h2h: [],
          isFavorite: false,
        };

        matchesList.push(match);
      }
    } catch (err) {
      console.warn(`Failed to fetch live matches for ${cfg.name}:`, err);
    }
  }

  // 2. Dynamic Nepali Football matches (Nepal Super League & Nepal National Team)
  const todayStr = new Date().toISOString().split('T')[0];
  const nepaliMatches: Match[] = INITIAL_MATCHES.filter(
    (m) => m.leagueCountry === 'Nepal' || m.homeTeam.country === 'Nepal'
  ).map((m) => ({
    ...m,
    date: todayStr,
  }));

  // Combine real-world live matches and Nepali football
  return [...nepaliMatches, ...matchesList];
}

// Fetch comprehensive game details (commentary, stats, lineups, H2H) when user clicks a match
export async function fetchLiveMatchSummary(match: Match): Promise<Match> {
  if (!match.id.startsWith('espn-')) {
    // Already has full mock data
    return match;
  }

  const eventId = match.id.replace('espn-', '');
  const leagueConfig = LEAGUES_CONFIG.find((l) => l.key === match.leagueId) || LEAGUES_CONFIG[0];

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueConfig.id}/summary?event=${eventId}`;
    const res = await fetch(url);
    if (!res.ok) return match;

    const data = await res.json();

    // 1. Parse Events (Goals, Cards, Subs)
    const events: MatchEvent[] = [];
    if (Array.isArray(data.keyEvents)) {
      data.keyEvents.forEach((k: {
        text?: string;
        type?: { text?: string; type?: string };
        clock?: { displayValue?: string };
        team?: { id?: string; displayName?: string };
        participants?: { athlete?: { displayName?: string } }[];
        scoringPlay?: boolean;
      }, index: number) => {
        const text = k.text || '';
        const min = parseInt(k.clock?.displayValue?.replace(/[^0-9]/g, '') || '0', 10);
        const typeStr = (k.type?.type || k.type?.text || '').toLowerCase();
        let type: MatchEvent['type'] = 'GOAL';

        if (typeStr.includes('yellow') || text.toLowerCase().includes('yellow card')) {
          type = 'YELLOW_CARD';
        } else if (typeStr.includes('red') || text.toLowerCase().includes('red card')) {
          type = 'RED_CARD';
        } else if (typeStr.includes('sub') || text.toLowerCase().includes('substitution')) {
          type = 'SUBSTITUTION';
        } else if (k.scoringPlay || typeStr.includes('goal') || text.toLowerCase().includes('goal!')) {
          type = 'GOAL';
        } else if (text.toLowerCase().includes('var')) {
          type = 'VAR';
        } else {
          return;
        }

        // Determine home vs away accurately
        let isHome = false;
        if (k.team?.id) {
          isHome = match.homeTeam.id.includes(k.team.id) || match.homeTeam.name.toLowerCase() === (k.team.displayName || '').toLowerCase();
        } else {
          isHome = text.toLowerCase().includes(match.homeTeam.name.toLowerCase()) || text.toLowerCase().includes(match.homeTeam.shortName.toLowerCase());
        }

        const scorerName = k.participants?.[0]?.athlete?.displayName || text.split('(')[0]?.trim() || 'Player';
        const assistName = k.participants?.[1]?.athlete?.displayName || undefined;

        events.push({
          id: `ev-${eventId}-${index}`,
          minute: min || 1,
          type,
          teamId: isHome ? match.homeTeam.id : match.awayTeam.id,
          playerName: scorerName,
          assistPlayerName: assistName,
          description: text,
        });
      });
    }

    // 2. Parse Detailed Stats
    const boxscoreTeams = data.boxscore?.teams || [];
    const homeBox = boxscoreTeams.find((b: { team?: { displayName?: string } }) => b.team?.displayName === match.homeTeam.name) || boxscoreTeams[0];
    const awayBox = boxscoreTeams.find((b: { team?: { displayName?: string } }) => b.team?.displayName === match.awayTeam.name) || boxscoreTeams[1];

    const getStat = (box: { statistics?: { name: string; displayValue: string }[] } | undefined, statName: string, defaultVal = 0): number => {
      if (!box?.statistics) return defaultVal;
      const found = box.statistics.find((s) => s.name === statName);
      if (!found) return defaultVal;
      const num = parseFloat(found.displayValue);
      return isNaN(num) ? defaultVal : num;
    };

    const hasBoxscore = boxscoreTeams.length > 0;
    const stats: MatchStats = {
      possession: [
        getStat(homeBox, 'possessionPct', hasBoxscore ? 50 : 50),
        getStat(awayBox, 'possessionPct', hasBoxscore ? 50 : 50),
      ],
      shots: [
        getStat(homeBox, 'totalShots', 0),
        getStat(awayBox, 'totalShots', 0),
      ],
      shotsOnTarget: [
        getStat(homeBox, 'shotsOnTarget', 0),
        getStat(awayBox, 'shotsOnTarget', 0),
      ],
      xG: [
        Number((getStat(homeBox, 'totalShots', 0) * 0.12).toFixed(2)),
        Number((getStat(awayBox, 'totalShots', 0) * 0.12).toFixed(2)),
      ],
      corners: [
        getStat(homeBox, 'wonCorners', 0),
        getStat(awayBox, 'wonCorners', 0),
      ],
      fouls: [
        getStat(homeBox, 'foulsCommitted', 0),
        getStat(awayBox, 'foulsCommitted', 0),
      ],
      yellowCards: [
        getStat(homeBox, 'yellowCards', 0),
        getStat(awayBox, 'yellowCards', 0),
      ],
      redCards: [
        getStat(homeBox, 'redCards', 0),
        getStat(awayBox, 'redCards', 0),
      ],
      offsides: [
        getStat(homeBox, 'offsides', 0),
        getStat(awayBox, 'offsides', 0),
      ],
      passes: [
        getStat(homeBox, 'totalPasses', 0),
        getStat(awayBox, 'totalPasses', 0),
      ],
      passAccuracy: [
        getStat(homeBox, 'passPct', 80),
        getStat(awayBox, 'passPct', 80),
      ],
    };

    // 3. Parse Commentary Plays
    const commentary: CommentaryItem[] = [];
    if (Array.isArray(data.commentary)) {
      data.commentary.slice(0, 35).forEach((c: { text?: string; time?: { displayValue?: string } }, i: number) => {
        const text = c.text || '';
        const min = parseInt(c.time?.displayValue?.replace(/[^0-9]/g, '') || '0', 10);
        const isGoal = text.toLowerCase().includes('goal');
        const isCard = text.toLowerCase().includes('card');
        const isSub = text.toLowerCase().includes('substitution');

        commentary.push({
          id: `comm-${eventId}-${i}`,
          minute: min,
          type: isGoal ? 'goal' : isCard ? 'card' : isSub ? 'sub' : 'normal',
          text,
        });
      });
    }

    // 4. Parse Lineups & Formations with Clean Tactical Grid Placement
    const buildLineup = (rosterObj?: {
      formation?: string;
      roster?: {
        athlete?: { id?: string; displayName: string; shortName?: string; jersey: string };
        starter?: boolean;
        jersey?: string;
        position?: { abbreviation: string; name?: string; displayName?: string };
        formationPlace?: string;
        subbedIn?: boolean;
        subbedOut?: boolean;
        stats?: { name: string; value: number }[];
      }[];
    }): Lineup | undefined => {
      if (!rosterObj?.roster || rosterObj.roster.length === 0) return undefined;
      const rawStarters = rosterObj.roster.filter((r) => r.starter);
      const rawSubs = rosterObj.roster.filter((r) => !r.starter);

      if (rawStarters.length === 0) return undefined;

      interface CategorizedPlayer extends Player {
        lineIndex: number; // 0=GK, 1=DEF, 2=DM/MID, 3=AM, 4=FWD
        sortKey: number;   // 1=Left to 5=Right
        formationPlace: number;
      }

      const players: CategorizedPlayer[] = rawStarters.map((p, idx) => {
        const abbr = (p.position?.abbreviation || '').toUpperCase().trim();
        const pName = (p.position?.displayName || p.position?.name || '').toLowerCase().trim();
        const fPlace = parseInt(p.formationPlace || '0', 10);

        let role: Player['position'] = 'MID';
        let lineIndex = 2;
        let sortKey = 3;

        // 1. Goalkeepers
        if (abbr === 'G' || abbr === 'GK' || pName.includes('goal') || fPlace === 1) {
          role = 'GK';
          lineIndex = 0;
          sortKey = 0;
        }
        // 2. Defenders - Left
        else if (abbr === 'LB' || abbr === 'LWB' || pName.includes('left back') || pName.includes('left wing back')) {
          role = 'DEF';
          lineIndex = 1;
          sortKey = 1;
        }
        // Defenders - Center-Left
        else if (abbr === 'CD-L' || abbr === 'CB-L' || abbr === 'LCB' || pName.includes('center left') || pName.includes('centre left')) {
          role = 'DEF';
          lineIndex = 1;
          sortKey = 2;
        }
        // Defenders - Center-Right
        else if (abbr === 'CD-R' || abbr === 'CB-R' || abbr === 'RCB' || pName.includes('center right') || pName.includes('centre right')) {
          role = 'DEF';
          lineIndex = 1;
          sortKey = 4;
        }
        // Defenders - Right
        else if (abbr === 'RB' || abbr === 'RWB' || pName.includes('right back') || pName.includes('right wing back')) {
          role = 'DEF';
          lineIndex = 1;
          sortKey = 5;
        }
        // Defenders - Central / General
        else if (abbr === 'CD' || abbr === 'CB' || abbr === 'SW' || abbr === 'D' || abbr.includes('DEF') || pName.includes('defend') || pName.includes('back')) {
          role = 'DEF';
          lineIndex = 1;
          sortKey = 3;
        }
        // 3. Forwards / Attackers - Left
        else if (abbr === 'LF' || abbr === 'LW' || abbr === 'CF-L' || pName.includes('left forward') || pName.includes('left wing')) {
          role = 'FWD';
          lineIndex = 4;
          sortKey = 1;
        }
        // Forwards / Attackers - Right
        else if (abbr === 'RF' || abbr === 'RW' || abbr === 'CF-R' || pName.includes('right forward') || pName.includes('right wing')) {
          role = 'FWD';
          lineIndex = 4;
          sortKey = 5;
        }
        // Forwards / Attackers - Central Striker
        else if (abbr === 'F' || abbr === 'CF' || abbr === 'ST' || abbr === 'FW' || abbr === 'FWD' || pName.includes('forward') || pName.includes('striker')) {
          role = 'FWD';
          lineIndex = 4;
          sortKey = 3;
        }
        // 4. Attacking Midfielders - Left
        else if (abbr === 'AM-L' || abbr === 'CAM-L' || abbr === 'AML' || pName.includes('attacking midfielder left')) {
          role = 'MID';
          lineIndex = 3;
          sortKey = 1;
        }
        // Attacking Midfielders - Right
        else if (abbr === 'AM-R' || abbr === 'CAM-R' || abbr === 'AMR' || pName.includes('attacking midfielder right')) {
          role = 'MID';
          lineIndex = 3;
          sortKey = 5;
        }
        // Attacking Midfielders - Central
        else if (abbr === 'AM' || abbr === 'CAM' || pName.includes('attacking midfielder')) {
          role = 'MID';
          lineIndex = 3;
          sortKey = 3;
        }
        // 5. Midfielders / Holding Midfielders - Left
        else if (abbr === 'LM' || abbr === 'ML' || pName.includes('left mid')) {
          role = 'MID';
          lineIndex = 2;
          sortKey = 1;
        }
        // Midfielders / Holding Midfielders - Right
        else if (abbr === 'RM' || abbr === 'MR' || pName.includes('right mid')) {
          role = 'MID';
          lineIndex = 2;
          sortKey = 5;
        }
        // Defensive / Holding Midfielders - Central
        else if (abbr === 'DM' || abbr === 'CDM' || pName.includes('defensive mid')) {
          role = 'MID';
          lineIndex = 2;
          sortKey = 3;
        }
        // Central Midfielders - Left / Right
        else if (abbr === 'CM-L' || abbr === 'LCM') {
          role = 'MID';
          lineIndex = 2;
          sortKey = 2;
        } else if (abbr === 'CM-R' || abbr === 'RCM') {
          role = 'MID';
          lineIndex = 2;
          sortKey = 4;
        } else {
          role = 'MID';
          lineIndex = 2;
          sortKey = 3;
        }

        const goalsStat = p.stats?.find((s) => s.name === 'totalGoals')?.value || 0;
        const yellowStat = p.stats?.find((s) => s.name === 'yellowCards')?.value || 0;
        const redStat = p.stats?.find((s) => s.name === 'redCards')?.value || 0;

        return {
          id: p.athlete?.id || `p-${idx}`,
          name: p.athlete?.displayName || p.athlete?.shortName || `Player ${idx + 1}`,
          number: parseInt(p.jersey || p.athlete?.jersey || `${idx + 1}`, 10) || (idx + 1),
          position: role,
          lineIndex,
          sortKey,
          formationPlace: fPlace,
          goals: goalsStat > 0 ? goalsStat : undefined,
          yellowCards: yellowStat > 0 ? yellowStat : undefined,
          redCards: redStat > 0 ? redStat : undefined,
        };
      });

      // Group players by lineIndex
      const lineMap = new Map<number, CategorizedPlayer[]>();
      players.forEach((p) => {
        if (!lineMap.has(p.lineIndex)) lineMap.set(p.lineIndex, []);
        lineMap.get(p.lineIndex)!.push(p);
      });

      // Sort each row from left (low sortKey) to right (high sortKey)
      lineMap.forEach((row) => {
        row.sort((a, b) => a.sortKey - b.sortKey || a.formationPlace - b.formationPlace);
      });

      // Compute distinct tactical vertical spacing (Y%) based on active lines
      const hasAM = lineMap.has(3);
      const ySpacing: Record<number, number> = {
        0: 88,                       // GK
        1: hasAM ? 72 : 70,          // DEF
        2: hasAM ? 55 : 46,          // DM / Central MID
        3: 36,                       // Attacking Midfielders
        4: 18,                       // Strikers / Forwards
      };

      lineMap.forEach((row, lIdx) => {
        const yPos = ySpacing[lIdx] ?? 50;
        const count = row.length;
        row.forEach((p, i) => {
          p.y = yPos;
          if (count === 1) {
            p.x = 50;
          } else {
            const sidePadding = count >= 5 ? 12 : 16;
            const availableWidth = 100 - (sidePadding * 2);
            const step = availableWidth / (count - 1);
            p.x = Math.round(sidePadding + (step * i));
          }
        });
      });

      const startingXI: Player[] = players.map(({ lineIndex, sortKey, formationPlace, ...basePlayer }) => basePlayer);

      const substitutes: Player[] = rawSubs.map((s, i) => ({
        id: s.athlete?.id || `sub-${i}`,
        name: s.athlete?.displayName || s.athlete?.shortName || `Sub ${i + 1}`,
        number: parseInt(s.jersey || s.athlete?.jersey || `${i + 12}`, 10) || (i + 12),
        position: 'MID',
      }));

      return {
        formation: rosterObj.formation || '4-3-3',
        manager: data.gameInfo?.coaches?.[0]?.displayName || 'Head Coach',
        startingXI,
        substitutes,
      };
    };

    const rosters = data.rosters || [];
    const homeLineup = buildLineup(rosters[0]);
    const awayLineup = buildLineup(rosters[1]);

    // 5. Parse Head-to-Head (H2H) Records from seasonseries
    const h2hList: HeadToHeadMatch[] = [];
    const seasonEvents = data.seasonseries?.[0]?.events || [];
    if (Array.isArray(seasonEvents)) {
      seasonEvents.forEach((se: {
        date?: string;
        competitionName?: string;
        competitors?: { team?: { displayName?: string }; score?: string; homeAway?: string }[];
      }) => {
        const homeC = se.competitors?.find((c) => c.homeAway === 'home');
        const awayC = se.competitors?.find((c) => c.homeAway === 'away');
        if (homeC && awayC) {
          h2hList.push({
            date: se.date ? se.date.split('T')[0] : 'Past Match',
            homeTeam: homeC.team?.displayName || 'Home Team',
            awayTeam: awayC.team?.displayName || 'Away Team',
            homeScore: parseInt(homeC.score || '0', 10) || 0,
            awayScore: parseInt(awayC.score || '0', 10) || 0,
            competition: se.competitionName || match.leagueName,
          });
        }
      });
    }

    return {
      ...match,
      events: events.length > 0 ? events : (match.events || []),
      stats,
      commentary: commentary.length > 0 ? commentary : (match.commentary || []),
      homeLineup: homeLineup || match.homeLineup,
      awayLineup: awayLineup || match.awayLineup,
      h2h: h2hList.length > 0 ? h2hList : (match.h2h || []),
      attendance: data.gameInfo?.attendance ? `${data.gameInfo.attendance.toLocaleString()}` : match.attendance,
      referee: data.gameInfo?.officials?.[0]?.displayName || match.referee,
      stadium: data.gameInfo?.venue?.fullName || match.stadium,
    };
  } catch (err) {
    console.warn(`Failed to fetch match summary for ${eventId}:`, err);
    return match;
  }
}

// Fetch live official standings from ESPN
export async function fetchLiveStandings(leagueKey: string): Promise<StandingTeam[]> {
  const cfg = LEAGUES_CONFIG.find((l) => l.key === leagueKey) || LEAGUES_CONFIG[0];
  try {
    const url = `https://site.api.espn.com/apis/v2/sports/soccer/${cfg.id}/standings`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const entries = data.children?.[0]?.standings?.entries || [];

    return entries.map((entry: {
      team: { id: string; displayName: string; abbreviation: string; logos?: { href: string }[] };
      stats: { name: string; value: number; displayValue: string }[];
    }, index: number) => {
      const getStat = (name: string, fallback = 0) => {
        const found = entry.stats?.find((s) => s.name === name);
        return found ? found.value : fallback;
      };

      const rank = index + 1;
      let zone: StandingTeam['zone'] = 'none';
      if (rank <= 4) zone = 'ucl';
      else if (rank === 5) zone = 'uel';
      else if (rank >= 18) zone = 'relegation';

      return {
        rank,
        team: {
          id: entry.team.id,
          name: entry.team.displayName,
          shortName: entry.team.abbreviation,
          logo: entry.team.logos?.[0]?.href || '',
          country: cfg.country,
        },
        played: getStat('gamesPlayed', 0),
        won: getStat('wins', 0),
        drawn: getStat('ties', 0),
        lost: getStat('losses', 0),
        gf: getStat('pointsFor', 0),
        ga: getStat('pointsAgainst', 0),
        gd: getStat('pointDifferential', 0),
        points: getStat('points', 0),
        form: ['W', 'D', 'W', 'W', 'L'],
        zone,
      };
    });
  } catch (err) {
    console.warn(`Failed to fetch live standings for ${leagueKey}:`, err);
    return [];
  }
}
