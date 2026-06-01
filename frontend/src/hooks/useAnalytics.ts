import { useState, useEffect, useCallback } from 'react';
import type { Analytics } from '@/types';
import * as analyticsService from '@/services/analyticsService';

export const useAnalytics = (seasonId?: string, autoFetch: boolean = true) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getAnalytics(seasonId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الإحصائيات والتحليلات');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (autoFetch && seasonId) {
      fetchAnalytics();
    }
  }, [seasonId, autoFetch, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
