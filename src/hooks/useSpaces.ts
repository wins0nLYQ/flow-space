import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spacesApi } from '@/api/spaces';
import type { CreateSpaceInput } from '@/types';

export const useSpaces = () => {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: spacesApi.getAll,
  });
};

export const useSpace = (id: string | undefined) => {
  return useQuery({
    queryKey: ['spaces', id],
    queryFn: () => spacesApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpaceInput) => spacesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
};

export const useUpdateSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateSpaceInput> }) =>
      spacesApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['spaces', variables.id] });
    },
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spacesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
};
