import { useState, useEffect, useCallback } from 'react';
import type { ScoreMatrix } from '@/types';
import * as scoreService from '@/services/scoreService';

export const useScores = (seasonId?: string, autoFetch: boolean = true) => {
  const [matrix, setMatrix] = useState<ScoreMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await scoreService.getScoreMatrix(seasonId);
      setMatrix(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل مصفوفة الدرجات');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (autoFetch && seasonId) {
      fetchMatrix();
    }
  }, [seasonId, autoFetch, fetchMatrix]);

  const updateScoreValue = async (scoreData: {
    scoreId?: string;
    teamId: string;
    categoryId: string;
    scoreValue: number;
    notes?: string;
    updatedAt?: string;
  }) => {
    setLoading(true);
    try {
      const updated = await scoreService.updateScore(scoreData);
      
      // Re-fetch matrix to get the updated sums and history
      await fetchMatrix();

      return updated;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث الدرجة');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeScore = async (scoreId: string) => {
    setLoading(true);
    try {
      await scoreService.deleteScore(scoreId);
      await fetchMatrix();
    } catch (err: any) {
      setError(err.message || 'فشل حذف الدرجة');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    matrix,
    loading,
    error,
    refetch: fetchMatrix,
    updateScore: updateScoreValue,
    removeScore,
  };
};
