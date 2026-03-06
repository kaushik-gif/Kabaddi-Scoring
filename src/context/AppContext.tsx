import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Player, Team, Competition, Match } from '../types';

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
}

const initialPlayers: Player[] = [
  { id: 1, firstName: 'Pardeep', lastName: 'Narwal', age: 26, role: 'Raider', jerseyNumber: 9 },
  { id: 2, firstName: 'Fazel', lastName: 'Atrachali', age: 31, role: 'Defender', jerseyNumber: 1 },
  { id: 3, firstName: 'Naveen', lastName: 'Kumar', age: 23, role: 'Raider', jerseyNumber: 10 },
  { id: 4, firstName: 'Pawan', lastName: 'Sehrawat', age: 27, role: 'Raider', jerseyNumber: 17 },
  { id: 5, firstName: 'Sandeep', lastName: 'Narwal', age: 30, role: 'All-Rounder', jerseyNumber: 11 },
  { id: 6, firstName: 'Maninder', lastName: 'Singh', age: 33, role: 'Raider', jerseyNumber: 14 },
  { id: 7, firstName: 'Sunil', lastName: 'Kumar', age: 26, role: 'Defender', jerseyNumber: 2 },
  { id: 8, firstName: 'Surjeet', lastName: 'Singh', age: 33, role: 'Defender', jerseyNumber: 5 },
  { id: 9, firstName: 'Deepak', lastName: 'Hooda', age: 29, role: 'All-Rounder', jerseyNumber: 4 },
  { id: 10, firstName: 'Rahul', lastName: 'Chaudhari', age: 30, role: 'Raider', jerseyNumber: 7 },
];

const initialTeams: Team[] = [
  { id: 1, name: 'Bengal Warriors', prefix: 'BW', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [6, 8] },
  { id: 2, name: 'Patna Pirates', prefix: 'PP', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [1, 5] },
  { id: 3, name: 'U Mumba', prefix: 'UM', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [2] },
  { id: 4, name: 'Jaipur Pink Panthers', prefix: 'JPP', country: 'India', tournamentIds: [1], logoUrl: null, squadPlayerIds: [7, 9] },
  { id: 5, name: 'Tamil Thalaivas', prefix: 'TT', country: 'India', tournamentIds: [], logoUrl: null, squadPlayerIds: [4, 10] },
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
    fixtures: [1, 2, 3, 4],
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
    teamAScore: 30,
    teamBScore: 30,
    winnerId: null,
    teamAReviews: { success: 0, fail: 0 },
    teamBReviews: { success: 0, fail: 0 },
    scoringLog: [],
  },
  {
    id: 3,
    competitionId: null,
    teamAId: 4,
    teamBId: 5,
    status: 'upcoming',
    halfDuration: 20,
    teamAScore: 0,
    teamBScore: 0,
    winnerId: null,
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
