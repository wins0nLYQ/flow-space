import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks';
import type { CreateTaskInput } from '@/types';

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  });
};

export const useTasksByList = (listId: string | undefined) => {
  return useQuery({
    queryKey: ['tasks', 'list', listId],
    queryFn: () => tasksApi.getByListId(listId!),
    enabled: !!listId,
  });
};

export const useTasksByProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => tasksApi.getByProjectId(projectId!),
    enabled: !!projectId,
  });
};

export const useTask = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', data.list_id] });
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'project', data.project_id] });
        queryClient.invalidateQueries({ queryKey: ['projects', data.project_id] });
      }
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTaskInput> }) =>
      tasksApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', data.list_id] });
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'project', data.project_id] });
        queryClient.invalidateQueries({ queryKey: ['projects', data.project_id] });
      }
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'list', data.list_id] });
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ['projects', data.project_id] });
      }
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
