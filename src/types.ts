export type Role = 'Raider' | 'Defender' | 'All-Rounder';

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  role: Role;
  jerseyNumber: number;
}

export interface Team {
  id: number;
  name: string;
  prefix: string;
  country: string;
  tournamentIds: number[];
  logoUrl: string | null;
  squadPlayerIds: number[];
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
  teamAReviews: { success: number; fail: number };
  teamBReviews: { success: number; fail: number };
  scoringLog: any[];
}
