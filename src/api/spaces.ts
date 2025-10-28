import { apiClient } from '@/lib/db';
import type { Space, CreateSpaceInput } from '@/types';

export const spacesApi = {
  getAll: async (): Promise<Space[]> => {
    return apiClient.get<Space[]>('/spaces');
  },

  getById: async (id: string): Promise<Space | null> => {
    return apiClient.get<Space>(`/spaces/${id}`);
  },

  create: async (input: CreateSpaceInput): Promise<Space> => {
    return apiClient.post<Space>('/spaces', input);
  },

  update: async (id: string, input: Partial<CreateSpaceInput>): Promise<Space> => {
    return apiClient.put<Space>(`/spaces/${id}`, input);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/spaces/${id}`);
  },
};
