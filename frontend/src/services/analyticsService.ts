import api from './api';
import type { Analytics } from '@/types';

export const getAnalytics = async (seasonId: string): Promise<Analytics> => {
  const response = await api.get<Analytics>(`/analytics/season/${seasonId}`);
  return response.data;
};
