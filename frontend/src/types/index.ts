export interface Season {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  seasonId: string;
  seasonName: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  maxScore: number;
  order: number;
  seasonId: string;
}

export interface Score {
  id: string;
  teamId: string;
  teamName: string;
  categoryId: string;
  categoryName: string;
  scoreValue: number;
  maxScore: number;
  notes: string;
  updatedAt: string;
}

export interface ScoreMatrixCell {
  categoryId: string;
  scoreValue: number | null;
  notes: string;
}

export interface ScoreMatrixRow {
  teamId: string;
  teamName: string;
  logoUrl: string;
  scores: ScoreMatrixCell[];
}

export interface ScoreMatrix {
  categories: Category[];
  rows: ScoreMatrixRow[];
}

export interface StandingsCategoryScore {
  categoryId: string;
  scoreValue: number;
  maxScore: number;
}

export interface StandingsRow {
  rank: number;
  teamId: string;
  teamName: string;
  logoUrl: string;
  categoryScores: StandingsCategoryScore[];
  totalScore: number;
}

export interface Standings {
  seasonId: string;
  categories: Category[];
  rows: StandingsRow[];
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  logoUrl: string;
  totalScore: number;
  movement: 'Up' | 'Down' | 'None';
}

export interface BestTeam {
  teamId: string;
  teamName: string;
  totalScore: number;
  logoUrl: string;
  trophy: string;
}

export interface CategoryChampion {
  categoryId: string;
  categoryName: string;
  teamId: string;
  teamName: string;
  logoUrl: string;
  scoreValue: number;
  maxScore: number;
  medal: string;
}

export interface HallOfFame {
  bestTeamOverall: BestTeam | null;
  categoryChampions: CategoryChampion[];
}

export interface TeamMetric {
  teamId: string;
  teamName: string;
  logoUrl: string;
  value: number;
  detail: string;
}

export interface CategoryMetric {
  categoryId: string;
  categoryName: string;
  value: number;
  detail: string;
}

export interface CategoryAverage {
  categoryId: string;
  categoryName: string;
  averageScore: number;
  maxScore: number;
}

export interface CategoryScoreValue {
  categoryId: string;
  categoryName: string;
  scoreValue: number;
}

export interface TeamScoreDistribution {
  teamId: string;
  teamName: string;
  scores: CategoryScoreValue[];
}

export interface Analytics {
  highestScoringTeam: TeamMetric | null;
  lowestScoringTeam: TeamMetric | null;
  mostConsistentTeam: TeamMetric | null;
  strongestCategory: CategoryMetric | null;
  mostCompetitiveCategory: CategoryMetric | null;
  categoryAverages: CategoryAverage[];
  teamScoreDistributions: TeamScoreDistribution[];
}

export interface QuickStats {
  totalTeams: number;
  totalCategories: number;
  leadingTeamName: string;
  leadingTeamLogoUrl: string;
  highestTotalScore: number;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userFullName: string;
  userEmail: string;
  action: string;
  entityName: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface AuthUser {
  accessToken: string;
  refreshToken: string;
  expiration: string;
  fullName: string;
  email: string;
  role: 'SuperAdmin' | 'Admin';
}
