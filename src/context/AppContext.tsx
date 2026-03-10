import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Player, Team, Competition, Match, PlayerStats, TeamStats, ScoringLogEntry } from '../types';

interface AppState {
  players: Player[];
  teams: Team[];
  competitions: Competition[];
  matches: Match[];
}

interface AppContextType extends AppState {
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (player: Player) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (team: Team) => void;
  addCompetition: (competition: Omit<Competition, 'id'>) => void;
  updateCompetition: (competition: Competition) => void;
  addMatch: (match: Omit<Match, 'id'>) => number;
  updateMatch: (match: Match) => void;
  finalizeMatch: (matchId: number, teamAScore: number, teamBScore: number, winnerId: number | null, scoringLog: ScoringLogEntry[]) => void;
}

const defaultPlayerStats: PlayerStats = {
  raidPoints: 0, tacklePoints: 0, bonusPoints: 0,
  superRaids: 0, superTackles: 0, allOuts: 0,
  successfulRaids: 0, unsuccessfulRaids: 0,
  successfulTackles: 0, unsuccessfulTackles: 0,
  totalPoints: 0, matchesPlayed: 0
};

const defaultTeamStats: TeamStats = {
  totalWins: 0, totalLosses: 0, totalPoints: 0,
  totalRaidPoints: 0, totalTacklePoints: 0,
  totalAllOuts: 0, matchesPlayed: 0
};

const initialPlayers: Player[] = [
  { id: 1, firstName: 'Pardeep', lastName: 'Narwal', age: 26, role: 'Raider', jerseyNumber: 9, stats: { ...defaultPlayerStats } },
  { id: 2, firstName: 'Fazel', lastName: 'Atrachali', age: 31, role: 'Defender', jerseyNumber: 1, stats: { ...defaultPlayerStats } },
  { id: 3, firstName: 'Naveen', lastName: 'Kumar', age: 23, role: 'Raider', jerseyNumber: 10, stats: { ...defaultPlayerStats } },
  { id: 4, firstName: 'Pawan', lastName: 'Sehrawat', age: 27, role: 'Raider', jerseyNumber: 17, stats: { ...defaultPlayerStats } },
  { id: 5, firstName: 'Sandeep', lastName: 'Narwal', age: 30, role: 'All-Rounder', jerseyNumber: 11, stats: { ...defaultPlayerStats } },
  { id: 6, firstName: 'Maninder', lastName: 'Singh', age: 33, role: 'Raider', jerseyNumber: 14, stats: { ...defaultPlayerStats } },
  { id: 7, firstName: 'Sunil', lastName: 'Kumar', age: 26, role: 'Defender', jerseyNumber: 2, stats: { ...defaultPlayerStats } },
  { id: 8, firstName: 'Surjeet', lastName: 'Singh', age: 33, role: 'Defender', jerseyNumber: 5, stats: { ...defaultPlayerStats } },
  { id: 9, firstName: 'Deepak', lastName: 'Hooda', age: 29, role: 'All-Rounder', jerseyNumber: 4, stats: { ...defaultPlayerStats } },
  { id: 10, firstName: 'Rahul', lastName: 'Chaudhari', age: 30, role: 'Raider', jerseyNumber: 7, stats: { ...defaultPlayerStats } },
  { id: 11, firstName: 'Nitesh', lastName: 'Kumar', age: 25, role: 'Defender', jerseyNumber: 12, stats: { ...defaultPlayerStats } },
  { id: 12, firstName: 'Vikas', lastName: 'Kandola', age: 24, role: 'Raider', jerseyNumber: 8, stats: { ...defaultPlayerStats } },
  { id: 13, firstName: 'Girish', lastName: 'Ernak', age: 32, role: 'Defender', jerseyNumber: 3, stats: { ...defaultPlayerStats } },
  { id: 14, firstName: 'Sachin', lastName: 'Tanwar', age: 24, role: 'Raider', jerseyNumber: 15, stats: { ...defaultPlayerStats } },
];

const initialTeams: Team[] = [
  { id: 1, name: 'Bengal Warriors', prefix: 'BW', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [6, 8, 11, 12, 13, 14, 1], stats: { ...defaultTeamStats } },
  { id: 2, name: 'Patna Pirates', prefix: 'PP', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [2, 3, 4, 5, 7, 9, 10], stats: { ...defaultTeamStats } },
  { id: 3, name: 'U Mumba', prefix: 'UM', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [1, 2, 3, 4, 5, 6, 7], stats: { ...defaultTeamStats } },
  { id: 4, name: 'Jaipur Pink Panthers', prefix: 'JPP', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [8, 9, 10, 11, 12, 13, 14], stats: { ...defaultTeamStats } },
];

const initialCompetitions: Competition[] = [
  {
    id: 1,
    name: 'Pro Kabaddi League 2024',
    type: 'League',
    startDate: '2024-12-15',
    endDate: '2025-02-15',
    numberOfTeams: 4,
    teamIds: [1, 2, 3, 4],
    fixtures: [1, 2, 3, 4, 5, 6],
  },
];

const initialMatches: Match[] = [
  {
    id: 1,
    competitionId: 1,
    teamAId: 1,
    teamBId: 2,
    status: 'completed',
    halfDuration: 20,
    teamAScore: 42,
    teamBScore: 38,
    winnerId: 1,
    teamALineup: { starting7: [6, 8, 11, 12, 13, 14, 1], substitutes: [], captainId: 6 },
    teamBLineup: { starting7: [2, 3, 4, 5, 7, 9, 10], substitutes: [], captainId: 2 },
    teamAReviews: { success: 1, fail: 0 },
    teamBReviews: { success: 0, fail: 1 },
    scoringLog: [],
  },
  {
    id: 2,
    competitionId: 1,
    teamAId: 3,
    teamBId: 4,
    status: 'completed',
    halfDuration: 20,
    teamAScore: 28,
    teamBScore: 31,
    winnerId: 4,
    teamALineup: { starting7: [1, 2, 3, 4, 5, 6, 7], substitutes: [], captainId: 1 },
    teamBLineup: { starting7: [8, 9, 10, 11, 12, 13, 14], substitutes: [], captainId: 8 },
    teamAReviews: { success: 0, fail: 0 },
    teamBReviews: { success: 0, fail: 0 },
    scoringLog: [],
  },
  {
    id: 3,
    competitionId: null,
    teamAId: 4,
    teamBId: 2,
    status: 'upcoming',
    halfDuration: 20,
    teamAScore: 0,
    teamBScore: 0,
    winnerId: null,
    teamALineup: { starting7: [], substitutes: [], captainId: null },
    teamBLineup: { starting7: [], substitutes: [], captainId: null },
    teamAReviews: { success: 0, fail: 0 },
    teamBReviews: { success: 0, fail: 0 },
    scoringLog: [],
  },
  {
    id: 4,
    competitionId: 1,
    teamAId: 1,
    teamBId: 3,
    status: 'live',
    halfDuration: 20,
    teamAScore: 12,
    teamBScore: 10,
    winnerId: null,
    teamALineup: { starting7: [6, 8, 11, 12, 13, 14, 1], substitutes: [], captainId: 6 },
    teamBLineup: { starting7: [1, 2, 3, 4, 5, 6, 7], substitutes: [], captainId: 1 },
    teamAReviews: { success: 0, fail: 0 },
    teamBReviews: { success: 0, fail: 0 },
    scoringLog: [],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [competitions, setCompetitions] = useState<Competition[]>(initialCompetitions);
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  const addPlayer = (player: Omit<Player, 'id'>) => {
    setPlayers((prev) => [...prev, { ...player, id: prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1 }]);
  };

  const updatePlayer = (player: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)));
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    setTeams((prev) => [...prev, { ...team, id: prev.length ? Math.max(...prev.map(t => t.id)) + 1 : 1 }]);
  };

  const updateTeam = (team: Team) => {
    setTeams((prev) => prev.map((t) => (t.id === team.id ? team : t)));
  };

  const addCompetition = (competition: Omit<Competition, 'id'>) => {
    setCompetitions((prev) => [...prev, { ...competition, id: prev.length ? Math.max(...prev.map(c => c.id)) + 1 : 1 }]);
  };

  const updateCompetition = (competition: Competition) => {
    setCompetitions((prev) => prev.map((c) => (c.id === competition.id ? competition : c)));
  };

  const addMatch = (match: Omit<Match, 'id'>) => {
    const newId = matches.length ? Math.max(...matches.map(m => m.id)) + 1 : 1;
    setMatches((prev) => [...prev, { ...match, id: newId }]);
    return newId;
  };

  const updateMatch = (match: Match) => {
    setMatches((prev) => prev.map((m) => (m.id === match.id ? match : m)));
  };

  const finalizeMatch = (matchId: number, teamAScore: number, teamBScore: number, winnerId: number | null, scoringLog: ScoringLogEntry[]) => {
    setMatches((prev) => prev.map((m) => {
      if (m.id === matchId) {
        return { ...m, status: 'completed', teamAScore, teamBScore, winnerId, scoringLog };
      }
      return m;
    }));

    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    // Compute Player Stats
    setPlayers(prevPlayers => prevPlayers.map(player => {
      const isTeamA = match.teamALineup?.starting7.includes(player.id) || match.teamALineup?.substitutes.includes(player.id);
      const isTeamB = match.teamBLineup?.starting7.includes(player.id) || match.teamBLineup?.substitutes.includes(player.id);
      
      if (!isTeamA && !isTeamB) return player;

      const newStats = { ...player.stats };
      newStats.matchesPlayed += 1;

      scoringLog.forEach(log => {
        if (log.playerId === player.id) {
          if (log.type === 'RaidSuccess') {
            newStats.raidPoints += log.points;
            newStats.successfulRaids += 1;
            if (log.points >= 3) newStats.superRaids += 1;
          } else if (log.type === 'RaidFail') {
            newStats.unsuccessfulRaids += 1;
          } else if (log.type === 'Tackle') {
            newStats.tacklePoints += log.points;
            newStats.successfulTackles += 1;
          } else if (log.type === 'SuperTackle') {
            newStats.tacklePoints += log.points;
            newStats.superTackles += 1;
            newStats.successfulTackles += 1;
          } else if (log.type === 'Bonus') {
            newStats.bonusPoints += log.points;
          }
        }
      });
      newStats.totalPoints = newStats.raidPoints + newStats.tacklePoints + newStats.bonusPoints;

      return { ...player, stats: newStats };
    }));

    // Compute Team Stats
    setTeams(prevTeams => prevTeams.map(team => {
      if (team.id !== match.teamAId && team.id !== match.teamBId) return team;

      const newStats = { ...team.stats };
      newStats.matchesPlayed += 1;
      
      if (team.id === winnerId) newStats.totalWins += 1;
      else if (winnerId !== null) newStats.totalLosses += 1;

      const teamScore = team.id === match.teamAId ? teamAScore : teamBScore;
      newStats.totalPoints += teamScore;

      scoringLog.forEach(log => {
        if (log.teamId === team.id) {
          if (log.type === 'RaidSuccess') newStats.totalRaidPoints += log.points;
          else if (log.type === 'Tackle' || log.type === 'SuperTackle') newStats.totalTacklePoints += log.points;
          else if (log.type === 'AllOut') newStats.totalAllOuts += 1;
        }
      });

      return { ...team, stats: newStats };
    }));
  };

  return (
    <AppContext.Provider
      value={{
        players,
        teams,
        competitions,
        matches,
        addPlayer,
        updatePlayer,
        addTeam,
        updateTeam,
        addCompetition,
        updateCompetition,
        addMatch,
        updateMatch,
        finalizeMatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
