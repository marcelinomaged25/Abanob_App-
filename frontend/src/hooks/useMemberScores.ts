import { useState, useEffect, useCallback } from 'react';
import type { MemberScoreMatrix, MemberLeaderboardEntry } from '@/types';
import * as memberScoreService from '@/services/memberScoreService';

export const useMemberScores = (seasonId?: string, autoFetch: boolean = true) => {
  const [matrix, setMatrix] = useState<MemberScoreMatrix | null>(null);
  const [leaderboard, setLeaderboard] = useState<MemberLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const [matrixData, leaderboardData] = await Promise.all([
        memberScoreService.getMemberScoreMatrix(seasonId),
        memberScoreService.getIndividualLeaderboard(seasonId),
      ]);
      setMatrix(matrixData);
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل بيانات الأفراد');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (autoFetch && seasonId) {
      fetchMatrix();
    }
  }, [seasonId, autoFetch, fetchMatrix]);

  const updateMemberScoreValue = async (scoreData: {
    scoreId?: string;
    teamMemberId: string;
    categoryId: string;
    scoreValue: number;
    notes?: string;
    updatedAt?: string;
  }) => {
    setLoading(true);
    try {
      const updated = await memberScoreService.updateMemberScore(scoreData);
      // Re-fetch to get updated sums and history
      await fetchMatrix();
      return updated;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث درجة الفرد');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberScore = async (scoreId: string) => {
    setLoading(true);
    try {
      await memberScoreService.deleteMemberScore(scoreId);
      await fetchMatrix();
    } catch (err: any) {
      setError(err.message || 'فشل حذف درجة الفرد');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    matrix,
    leaderboard,
    loading,
    error,
    refetch: fetchMatrix,
    updateMemberScore: updateMemberScoreValue,
    removeMemberScore,
  };
};
