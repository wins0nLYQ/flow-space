import { apiClient } from '@/lib/db';
import type { Project, ProjectWithTasks, CreateProjectInput } from '@/types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects');
  },

  getByListId: async (listId: string): Promise<ProjectWithTasks[]> => {
    return apiClient.get<ProjectWithTasks[]>(`/projects/list/${listId}`);
  },

  getById: async (id: string): Promise<ProjectWithTasks | null> => {
    return apiClient.get<ProjectWithTasks>(`/projects/${id}`);
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    return apiClient.post<Project>('/projects', input);
  },

  update: async (id: string, input: Partial<CreateProjectInput>): Promise<Project> => {
    return apiClient.put<Project>(`/projects/${id}`, input);
  },

  updateStatus: async (id: string, status: string): Promise<Project> => {
    return apiClient.patch<Project>(`/projects/${id}/status`, { status });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/projects/${id}`);
  },
};
