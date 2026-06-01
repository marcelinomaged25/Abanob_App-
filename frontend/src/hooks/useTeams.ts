import { useState, useEffect, useCallback } from 'react';
import type { Team } from '@/types';
import * as teamService from '@/services/teamService';

export const useTeams = (seasonId?: string, autoFetch: boolean = true) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getTeams(seasonId);
      setTeams(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الفرق');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (autoFetch && seasonId) {
      fetchTeams();
    }
  }, [seasonId, autoFetch, fetchTeams]);

  const createTeam = async (data: Omit<Team, 'id' | 'createdAt' | 'seasonName'>) => {
    setLoading(true);
    try {
      const newTeam = await teamService.createTeam(data);
      await fetchTeams();
      return newTeam;
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الفريق');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (id: string, data: Omit<Team, 'createdAt' | 'seasonName'>) => {
    setLoading(true);
    try {
      const updated = await teamService.updateTeam(id, data);
      await fetchTeams();
      return updated;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث الفريق');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id: string) => {
    setLoading(true);
    try {
      await teamService.deleteTeam(id);
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || 'فشل حذف الفريق');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadTeamLogo = async (id: string, file: File) => {
    setLoading(true);
    try {
      const result = await teamService.uploadLogo(id, file);
      await fetchTeams();
      return result;
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الشعار');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    uploadTeamLogo,
  };
};
