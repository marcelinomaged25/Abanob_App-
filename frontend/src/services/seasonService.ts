import api from './api';
import type { Season } from '@/types';

export const getSeasons = async (): Promise<Season[]> => {
  const response = await api.get<Season[]>('/seasons');
  return response.data;
};

export const getActiveSeason = async (): Promise<Season | null> => {
  const response = await api.get<Season>('/seasons/active');
  return response.data;
};

export const createSeason = async (season: Omit<Season, 'id' | 'createdAt'>): Promise<Season> => {
  const response = await api.post<Season>('/seasons', season);
  return response.data;
};

export const updateSeason = async (id: string, season: Omit<Season, 'createdAt'>): Promise<Season> => {
  const response = await api.put<Season>(`/seasons/${id}`, season);
  return response.data;
};

export const deleteSeason = async (id: string): Promise<void> => {
  await api.delete(`/seasons/${id}`);
};

export const activateSeason = async (id: string): Promise<void> => {
  await api.post(`/seasons/${id}/activate`);
};
