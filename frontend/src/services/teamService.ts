import api from './api';
import type { Team, TeamProfile } from '@/types';

export const getTeams = async (seasonId?: string): Promise<Team[]> => {
  if (!seasonId) {
    throw new Error('معرّف الموسم مطلوب لتحميل الفرق.');
  }
  const response = await api.get<Team[]>(`/teams/season/${seasonId}`);
  return response.data;
};

export const getTeamById = async (id: string): Promise<Team> => {
  const response = await api.get<Team>(`/teams/${id}`);
  return response.data;
};

export const getTeamProfile = async (id: string): Promise<TeamProfile> => {
  const response = await api.get<TeamProfile>(`/teams/${id}/profile`);
  return response.data;
};

export const createTeam = async (
  team: Pick<Team, 'name' | 'description' | 'seasonId'> & { memberNames?: string[] }
): Promise<Team> => {
  const response = await api.post<Team>('/teams', {
    name: team.name,
    description: team.description,
    seasonId: team.seasonId,
    memberNames: team.memberNames ?? [],
  });
  return response.data;
};

export const updateTeam = async (
  id: string,
  team: Pick<Team, 'name' | 'description'>
): Promise<Team> => {
  const response = await api.put<Team>(`/teams/${id}`, {
    name: team.name,
    description: team.description,
  });
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
