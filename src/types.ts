export type Role = 'Raider' | 'Defender' | 'All-Rounder';

export interface PlayerStats {
  raidPoints: number;
  tacklePoints: number;
  bonusPoints: number;
  superRaids: number;
  superTackles: number;
  allOuts: number;
  successfulRaids: number;
  unsuccessfulRaids: number;
  successfulTackles: number;
  unsuccessfulTackles: number;
  totalPoints: number;
  matchesPlayed: number;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  role: Role;
  jerseyNumber: number;
  stats: PlayerStats;
}

export interface TeamStats {
  totalWins: number;
  totalLosses: number;
  totalPoints: number;
  totalRaidPoints: number;
  totalTacklePoints: number;
  totalAllOuts: number;
  matchesPlayed: number;
}

export interface Team {
  id: number;
  name: string;
  prefix: string;
  country: string;
  tournamentIds: number[];
  logoUrl: string | null;
  squadPlayerIds: number[];
  stats: TeamStats;
}

export interface Competition {
  id: number;
  name: string;
  type: 'League' | 'Knockout' | 'Round Robin';
  startDate: string;
  endDate: string;
  numberOfTeams: number;
  teamIds: number[];
  fixtures: number[]; // match ids
}

export interface Lineup {
  starting7: number[];
  substitutes: number[];
  captainId: number | null;
}

export interface ScoringLogEntry {
  type: string;
  playerId: number | null;
  teamId: number;
  points: number;
  timestamp: number;
  half: number;
}

export interface Match {
  id: number;
  competitionId: number | null;
  teamAId: number;
  teamBId: number;
  status: 'upcoming' | 'live' | 'completed';
  halfDuration: number;
  teamAScore: number;
  teamBScore: number;
  winnerId: number | null;
  teamALineup: Lineup;
  teamBLineup: Lineup;
  teamAReviews: { success: number; fail: number };
  teamBReviews: { success: number; fail: number };
  scoringLog: ScoringLogEntry[];
}

