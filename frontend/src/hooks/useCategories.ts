import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/types';
import * as categoryService from '@/services/categoryService';

export const useCategories = (seasonId?: string, autoFetch: boolean = true) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategoriesBySeason(seasonId);
      // Sort by order initially
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setCategories(sorted);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الفئات');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    if (autoFetch && seasonId) {
      fetchCategories();
    }
  }, [seasonId, autoFetch, fetchCategories]);

  const createCategory = async (data: Omit<Category, 'id'>) => {
    setLoading(true);
    try {
      const newCat = await categoryService.createCategory(data);
      await fetchCategories();
      return newCat;
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الفئة');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: Omit<Category, 'id' | 'seasonId'>) => {
    setLoading(true);
    try {
      const updated = await categoryService.updateCategory(id, data);
      await fetchCategories();
      return updated;
    } catch (err: any) {
      setError(err.message || 'فشل تحديث الفئة');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await categoryService.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'فشل حذف الفئة');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderCategories = async (reorders: { categoryId: string; order: number }[]) => {
    if (!seasonId) return;
    setLoading(true);
    try {
      await categoryService.reorderCategories(seasonId, reorders);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'فشل إعادة ترتيب الفئات');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
};
