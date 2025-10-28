import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import type { CreateProjectInput } from '@/types';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });
};

export const useProjectsByList = (listId: string | undefined) => {
  return useQuery({
    queryKey: ['projects', 'list', listId],
    queryFn: () => projectsApi.getByListId(listId!),
    enabled: !!listId,
  });
};

export const useProject = (id: string | undefined) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', data.list_id] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateProjectInput> }) =>
      projectsApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', data.list_id] });
    },
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      projectsApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'list', data.list_id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
