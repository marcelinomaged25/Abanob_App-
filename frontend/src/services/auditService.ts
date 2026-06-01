import api from './api';
import type { AuditLog } from '@/types';

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<AuditLog[]>('/auditlogs');
  return response.data;
};
