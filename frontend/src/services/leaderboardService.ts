import api from './api';
import type { LeaderboardEntry } from '@/types';

export const getLeaderboard = async (seasonId: string): Promise<LeaderboardEntry[]> => {
  const response = await api.get<LeaderboardEntry[]>(`/leaderboard/season/${seasonId}`);
  return response.data;
};
