import { useState, useEffect, useCallback } from 'react';
import type { Season } from '@/types';
import * as seasonService from '@/services/seasonService';

export const useSeasons = (autoFetch: boolean = true) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allSeasons = await seasonService.getSeasons();
      setSeasons(allSeasons);
      
      const active = allSeasons.find(s => s.isActive) || null;
      setActiveSeason(active);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل المواسم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchSeasons();
    }
  }, [autoFetch, fetchSeasons]);

  const createSeason = async (data: Omit<Season, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newSeason = await seasonService.createSeason(data);
      await fetchSeasons();
      return newSeason;
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الموسم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSeason = async (id: string, data: Omit<Season, 'createdAt'>) => {
    setLoading(true);
    try {
      const updated = await seasonService.updateSeason(id, data);
      await fetchSeasons();
      return updated;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث الموسم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateSeason = async (id: string) => {
    setLoading(true);
    try {
      await seasonService.activateSeason(id);
      await fetchSeasons();
    } catch (err: any) {
      setError(err.message || 'فشل تفعيل الموسم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSeason = async (id: string) => {
    setLoading(true);
    try {
      await seasonService.deleteSeason(id);
      await fetchSeasons();
    } catch (err: any) {
      setError(err.message || 'فشل حذف الموسم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    seasons,
    activeSeason,
    loading,
    error,
    refetch: fetchSeasons,
    createSeason,
    updateSeason,
    activateSeason,
    deleteSeason,
  };
};
