import { apiClient } from '@/lib/db';
import type { List, CreateListInput } from '@/types';

export const listsApi = {
  getAll: async (): Promise<List[]> => {
    return apiClient.get<List[]>('/lists');
  },

  getBySpaceId: async (spaceId: string): Promise<List[]> => {
    return apiClient.get<List[]>(`/lists/space/${spaceId}`);
  },

  getById: async (id: string): Promise<List | null> => {
    return apiClient.get<List>(`/lists/${id}`);
  },

  create: async (input: CreateListInput): Promise<List> => {
    return apiClient.post<List>('/lists', input);
  },

  update: async (id: string, input: Partial<CreateListInput>): Promise<List> => {
    return apiClient.put<List>(`/lists/${id}`, input);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/lists/${id}`);
  },
};
