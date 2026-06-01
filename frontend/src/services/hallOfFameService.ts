import api from './api';
import type { HallOfFame } from '@/types';

export const getHallOfFame = async (seasonId: string): Promise<HallOfFame> => {
  const response = await api.get<HallOfFame>(`/halloffame/season/${seasonId}`);
  return response.data;
};
