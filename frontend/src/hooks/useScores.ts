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
    teamId: string;
    categoryId: string;
    scoreValue: number;
    notes?: string;
  }) => {
    setLoading(true);
    try {
      const updated = await scoreService.updateScore(scoreData);
      
      // Update local state if matrix is loaded
      if (matrix) {
        const updatedRows = matrix.rows.map((row) => {
          if (row.teamId === scoreData.teamId) {
            const updatedScores = row.scores.map((cell) => {
              if (cell.categoryId === scoreData.categoryId) {
                return {
                  ...cell,
                  scoreValue: scoreData.scoreValue,
                  notes: scoreData.notes || '',
                };
              }
              return cell;
            });
            return { ...row, scores: updatedScores };
          }
          return row;
        });
        setMatrix({ ...matrix, rows: updatedRows });
      }

      return updated;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث الدرجة');
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
  };
};
