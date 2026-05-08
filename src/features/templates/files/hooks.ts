import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTemplateAttachment,
  createTemplateInlineAsset,
  deleteTemplateAttachment,
  deleteTemplateInlineAsset,
  listTemplateAttachments,
  listTemplateInlineAssets,
} from "./api";
import type {
  CreateTemplateAttachmentInput,
  CreateTemplateInlineAssetInput,
} from "./types";

export const templateFilesQueryKey = ["template-files"] as const;

export function templateInlineAssetsQueryKey(templateId?: string | null) {
  return [...templateFilesQueryKey, "inline-assets", templateId] as const;
}

export function templateAttachmentsQueryKey(templateId?: string | null) {
  return [...templateFilesQueryKey, "attachments", templateId] as const;
}

export function useTemplateInlineAssets(templateId?: string | null) {
  return useQuery({
    queryKey: templateInlineAssetsQueryKey(templateId),
    queryFn: () => listTemplateInlineAssets(templateId ?? ""),
    enabled: Boolean(templateId),
  });
}

export function useTemplateAttachments(templateId?: string | null) {
  return useQuery({
    queryKey: templateAttachmentsQueryKey(templateId),
    queryFn: () => listTemplateAttachments(templateId ?? ""),
    enabled: Boolean(templateId),
  });
}

export function useCreateTemplateInlineAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: CreateTemplateInlineAssetInput;
    }) => createTemplateInlineAsset(templateId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: templateInlineAssetsQueryKey(variables.templateId),
      });
    },
  });
}

export function useDeleteTemplateInlineAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      fileId,
    }: {
      templateId: string;
      fileId: string;
    }) => deleteTemplateInlineAsset(templateId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: templateInlineAssetsQueryKey(variables.templateId),
      });
    },
  });
}

export function useCreateTemplateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      input,
    }: {
      templateId: string;
      input: CreateTemplateAttachmentInput;
    }) => createTemplateAttachment(templateId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: templateAttachmentsQueryKey(variables.templateId),
      });
    },
  });
}

export function useDeleteTemplateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      fileId,
    }: {
      templateId: string;
      fileId: string;
    }) => deleteTemplateAttachment(templateId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: templateAttachmentsQueryKey(variables.templateId),
      });
    },
  });
}
