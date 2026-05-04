import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCampaign,
  deleteCampaign,
  dispatchCampaign,
  dispatchCampaignBatch,
  getCampaign,
  listCampaigns,
  updateCampaign,
} from "./api";
import type {
  CreateCampaignInput,
  DispatchCampaignBatchInput,
  DispatchCampaignInput,
  UpdateCampaignInput,
} from "./types";

export const campaignsQueryKey = ["campaigns"] as const;
export const dispatchesQueryKey = ["dispatches"] as const;

export function useCampaigns() {
  return useQuery({
    queryKey: campaignsQueryKey,
    queryFn: listCampaigns,
  });
}

export function useCampaign(id?: string | null) {
  return useQuery({
    queryKey: [...campaignsQueryKey, id],
    queryFn: () => getCampaign(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCampaignInput }) =>
      updateCampaign(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
    },
  });
}

export function useDispatchCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input?: DispatchCampaignInput;
    }) => dispatchCampaign(id, input ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
      queryClient.invalidateQueries({ queryKey: dispatchesQueryKey });
    },
  });
}

export function useDispatchCampaignBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DispatchCampaignBatchInput) =>
      dispatchCampaignBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
      queryClient.invalidateQueries({ queryKey: dispatchesQueryKey });
    },
  });
}
