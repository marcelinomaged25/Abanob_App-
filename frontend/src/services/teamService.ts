import api from './api';
import type { Team } from '@/types';

export const getTeams = async (seasonId?: string): Promise<Team[]> => {
  const url = seasonId ? `/teams?seasonId=${seasonId}` : '/teams';
  const response = await api.get<Team[]>(url);
  return response.data;
};

export const getTeamById = async (id: string): Promise<Team> => {
  const response = await api.get<Team>(`/teams/${id}`);
  return response.data;
};

export const getTeamProfile = async (id: string): Promise<any> => {
  const response = await api.get<any>(`/teams/${id}/profile`);
  return response.data;
};

export const createTeam = async (team: Omit<Team, 'id' | 'createdAt' | 'seasonName'>): Promise<Team> => {
  const response = await api.post<Team>('/teams', team);
  return response.data;
};

export const updateTeam = async (id: string, team: Omit<Team, 'createdAt' | 'seasonName'>): Promise<Team> => {
  const response = await api.put<Team>(`/teams/${id}`, team);
  return response.data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  await api.delete(`/teams/${id}`);
};

export const uploadLogo = async (id: string, file: File): Promise<{ logoUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ logoUrl: string }>(`/teams/${id}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
