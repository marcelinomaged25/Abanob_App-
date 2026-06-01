import api from './api';
import type { Score, ScoreMatrix } from '@/types';

export const getScoreMatrix = async (seasonId: string): Promise<ScoreMatrix> => {
  const response = await api.get<ScoreMatrix>(`/scores/season/${seasonId}/matrix`);
  return response.data;
};

export const getScoresByTeam = async (teamId: string): Promise<Score[]> => {
  const response = await api.get<Score[]>(`/scores/team/${teamId}`);
  return response.data;
};

export const updateScore = async (scoreData: {
  teamId: string;
  categoryId: string;
  scoreValue: number;
  notes?: string;
}): Promise<Score> => {
  const response = await api.put<Score>('/scores', {
    teamId: scoreData.teamId,
    categoryId: scoreData.categoryId,
    scoreValue: scoreData.scoreValue,
    notes: scoreData.notes || '',
  });
  return response.data;
};
