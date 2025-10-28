import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '@/api/lists';
import type { CreateListInput } from '@/types';

export const useLists = () => {
  return useQuery({
    queryKey: ['lists'],
    queryFn: listsApi.getAll,
  });
};

export const useListsBySpace = (spaceId: string | undefined) => {
  return useQuery({
    queryKey: ['lists', 'space', spaceId],
    queryFn: () => listsApi.getBySpaceId(spaceId!),
    enabled: !!spaceId,
  });
};

export const useList = (id: string | undefined) => {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => listsApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateListInput) => listsApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', 'space', data.space_id] });
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateListInput> }) =>
      listsApi.update(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lists', 'space', data.space_id] });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};
