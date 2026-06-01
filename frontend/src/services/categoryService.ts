import api from './api';
import type { Category } from '@/types';

export const getCategoriesBySeason = async (seasonId: string): Promise<Category[]> => {
  const response = await api.get<Category[]>(`/categories/season/${seasonId}`);
  return response.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const response = await api.post<Category>('/categories', category);
  return response.data;
};

export const updateCategory = async (id: string, category: Omit<Category, 'id' | 'seasonId'>): Promise<Category> => {
  const response = await api.put<Category>(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

export const reorderCategories = async (
  seasonId: string,
  reorders: { categoryId: string; order: number }[]
): Promise<void> => {
  await api.put(`/categories/season/${seasonId}/reorder`, reorders);
};
