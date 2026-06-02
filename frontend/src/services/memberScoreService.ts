import api from './api';
import type { MemberScore, MemberScoreMatrix, MemberLeaderboardEntry } from '@/types';

export const getMemberScoreMatrix = async (seasonId: string): Promise<MemberScoreMatrix> => {
  const response = await api.get<MemberScoreMatrix>(`/memberscores/season/${seasonId}/matrix`);
  return response.data;
};

export const getIndividualLeaderboard = async (seasonId: string): Promise<MemberLeaderboardEntry[]> => {
  const response = await api.get<MemberLeaderboardEntry[]>(`/memberscores/season/${seasonId}/leaderboard`);
  return response.data;
};

export const getScoresByMember = async (teamMemberId: string): Promise<MemberScore[]> => {
  const response = await api.get<MemberScore[]>(`/memberscores/member/${teamMemberId}`);
  return response.data;
};

export const updateMemberScore = async (scoreData: {
  scoreId?: string;
  teamMemberId: string;
  categoryId: string;
  scoreValue: number;
  notes?: string;
  updatedAt?: string;
}): Promise<MemberScore> => {
  const response = await api.put<MemberScore>('/memberscores', {
    scoreId: scoreData.scoreId || null,
    teamMemberId: scoreData.teamMemberId,
    categoryId: scoreData.categoryId,
    scoreValue: scoreData.scoreValue,
    notes: scoreData.notes || '',
    updatedAt: scoreData.updatedAt || null,
  });
  return response.data;
};
