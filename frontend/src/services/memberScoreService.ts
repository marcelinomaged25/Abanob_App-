import api from './api';
import type { MemberScore, MemberScoreMatrix } from '@/types';

export const getMemberScoreMatrix = async (seasonId: string): Promise<MemberScoreMatrix> => {
  const response = await api.get<MemberScoreMatrix>(`/memberscores/season/${seasonId}/matrix`);
  return response.data;
};

export const getScoresByMember = async (teamMemberId: string): Promise<MemberScore[]> => {
  const response = await api.get<MemberScore[]>(`/memberscores/member/${teamMemberId}`);
  return response.data;
};

export const updateMemberScore = async (scoreData: {
  teamMemberId: string;
  categoryId: string;
  scoreValue: number;
  notes?: string;
}): Promise<MemberScore> => {
  const response = await api.put<MemberScore>('/memberscores', {
    teamMemberId: scoreData.teamMemberId,
    categoryId: scoreData.categoryId,
    scoreValue: scoreData.scoreValue,
    notes: scoreData.notes || '',
  });
  return response.data;
};
