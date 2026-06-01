import { useState, useEffect, useCallback } from 'react';
import type { MemberScoreMatrix } from '@/types';
import * as memberScoreService from '@/services/memberScoreService';

export const useMemberScores = (seasonId?: string, autoFetch: boolean = true) => {
  const [matrix, setMatrix] = useState<MemberScoreMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await memberScoreService.getMemberScoreMatrix(seasonId);
      setMatrix(data);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل مصفوفة درجات الأفراد');
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
    teamMemberId: string;
    categoryId: string;
    scoreValue: number;
    notes?: string;
  }) => {
    setLoading(true);
    try {
      const updated = await memberScoreService.updateMemberScore(scoreData);

      if (matrix) {
        const updatedRows = matrix.rows.map((row) => {
          if (row.teamMemberId === scoreData.teamMemberId) {
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
      setError(err.message || 'فشل تحديث درجة الفرد');
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
    updateMemberScore: updateMemberScoreValue,
  };
};
