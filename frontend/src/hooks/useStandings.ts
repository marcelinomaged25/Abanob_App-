import { useState, useEffect, useCallback } from 'react';
import type { Standings, LeaderboardEntry, QuickStats, HallOfFame } from '@/types';
import * as standingsService from '@/services/standingsService';
import * as leaderboardService from '@/services/leaderboardService';
import * as statsService from '@/services/statsService';
import * as hallOfFameService from '@/services/hallOfFameService';

export const useStandings = (seasonId?: string, autoFetch: boolean = true) => {
  const [standings, setStandings] = useState<Standings | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [hallOfFame, setHallOfFame] = useState<HallOfFame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const [standingsData, leaderboardData, statsData, hallOfFameData] = await Promise.all([
        standingsService.getStandings(seasonId).catch(() => null),
        leaderboardService.getLeaderboard(seasonId).catch(() => []),
        statsService.getQuickStats(seasonId).catch(() => null),
        hallOfFameService.getHallOfFame(seasonId).catch(() => null),
      ]);

      setStandings(standingsData);
      setLeaderboard(leaderboardData);
      setQuickStats(statsData);
      setHallOfFame(hallOfFameData);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل جدول الترتيب والبيانات');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (autoFetch && seasonId) {
      fetchAllData();
    }
  }, [seasonId, autoFetch, fetchAllData]);

  return {
    standings,
    leaderboard,
    quickStats,
    hallOfFame,
    loading,
    error,
    refetch: fetchAllData,
  };
};
