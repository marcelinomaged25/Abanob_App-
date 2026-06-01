import api from './api';
import type { QuickStats } from '@/types';

export const getQuickStats = async (seasonId: string): Promise<QuickStats> => {
  const response = await api.get<QuickStats>(`/quickstats/season/${seasonId}`);
  return response.data;
};
