import { apiClient } from '@/lib/db';
import type { Task, TaskWithProject, CreateTaskInput } from '@/types';

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    return apiClient.get<Task[]>('/tasks');
  },

  getByListId: async (listId: string): Promise<TaskWithProject[]> => {
    return apiClient.get<TaskWithProject[]>(`/tasks/list/${listId}`);
  },

  getByProjectId: async (projectId: string): Promise<Task[]> => {
    return apiClient.get<Task[]>(`/tasks/project/${projectId}`);
  },

  getById: async (id: string): Promise<TaskWithProject | null> => {
    return apiClient.get<TaskWithProject>(`/tasks/${id}`);
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    return apiClient.post<Task>('/tasks', input);
  },

  update: async (id: string, input: Partial<CreateTaskInput>): Promise<Task> => {
    return apiClient.put<Task>(`/tasks/${id}`, input);
  },

  updateStatus: async (id: string, status: string): Promise<Task> => {
    return apiClient.patch<Task>(`/tasks/${id}/status`, { status });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/tasks/${id}`);
  },
};
