import api from './api';
import type { Standings } from '@/types';

export const getStandings = async (seasonId: string): Promise<Standings> => {
  const response = await api.get<Standings>(`/standings/season/${seasonId}`);
  return response.data;
};
