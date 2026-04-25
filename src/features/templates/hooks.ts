import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  updateTemplate,
} from "./api";
import type { CreateTemplateInput, UpdateTemplateInput } from "./types";

export const templatesQueryKey = ["templates"];

export function useTemplates() {
  return useQuery({
    queryKey: templatesQueryKey,
    queryFn: listTemplates,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTemplateInput) => createTemplate(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: templatesQueryKey }),
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTemplateInput }) =>
      updateTemplate(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: templatesQueryKey }),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: templatesQueryKey }),
  });
}
