import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAudience,
  deleteAudience,
  listAudiences,
  previewAudience,
  updateAudience,
} from "./api";
import type { CreateAudienceInput, UpdateAudienceInput } from "./types";

import { listCnpjApiCities, listCnpjApiCnaes } from "./api/domain-options";

export const audiencesQueryKey = ["audiences"];

export function useAudiences() {
  return useQuery({
    queryKey: audiencesQueryKey,
    queryFn: listAudiences,
  });
}

export function useCreateAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAudienceInput) => createAudience(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: audiencesQueryKey }),
  });
}

export function useUpdateAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAudienceInput }) =>
      updateAudience(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: audiencesQueryKey }),
  });
}

export function useDeleteAudience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAudience(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: audiencesQueryKey }),
  });
}

export function useAudiencePreview(id?: string) {
  return useQuery({
    queryKey: ["audience-preview", id],
    queryFn: () => previewAudience(id as string),
    enabled: Boolean(id),
  });
}

export function useCnpjApiCities(uf?: string, search?: string) {
  return useQuery({
    queryKey: ["cnpj-api-cities", uf, search],
    queryFn: () =>
      listCnpjApiCities({
        uf: uf as string,
        search,
      }),
    enabled: Boolean(uf),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCnpjApiCnaes(search?: string) {
  return useQuery({
    queryKey: ["cnpj-api-cnaes", search],
    queryFn: () =>
      listCnpjApiCnaes({
        search,
      }),
    staleTime: 1000 * 60 * 10,
  });
}
