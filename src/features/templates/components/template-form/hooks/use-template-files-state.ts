import { useCallback, useMemo, useState } from "react";

import {
  useCreateTemplateAttachment,
  useCreateTemplateInlineAsset,
  useDeleteTemplateAttachment,
  useDeleteTemplateInlineAsset,
  useTemplateAttachments,
  useTemplateInlineAssets,
} from "../../../files/hooks";
import type {
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "../../../files/types";
import {
  buildAttachmentInput,
  buildInlineAssetInput,
  createEmailAttachmentFromFile,
  createEmbeddedAssetFromFile,
  revokeTemplateFileUrl,
} from "../../../files/utils";

type UseTemplateFilesStateParams = {
  templateId?: string | null;
};

export function useTemplateFilesState({
  templateId,
}: UseTemplateFilesStateParams) {
  const inlineAssetsQuery = useTemplateInlineAssets(templateId);
  const attachmentsQuery = useTemplateAttachments(templateId);

  const createInlineAsset = useCreateTemplateInlineAsset();
  const deleteInlineAsset = useDeleteTemplateInlineAsset();

  const createAttachment = useCreateTemplateAttachment();
  const deleteAttachment = useDeleteTemplateAttachment();

  const [pendingEmbeddedAssets, setPendingEmbeddedAssets] = useState<
    TemplateEmbeddedAsset[]
  >([]);
  const [pendingEmailAttachments, setPendingEmailAttachments] = useState<
    TemplateEmailAttachment[]
  >([]);

  const persistedEmbeddedAssets = useMemo(
    () => inlineAssetsQuery.data?.items ?? [],
    [inlineAssetsQuery.data?.items],
  );

  const persistedEmailAttachments = useMemo(
    () => attachmentsQuery.data?.items ?? [],
    [attachmentsQuery.data?.items],
  );

  const embeddedAssets = useMemo(
    () => [...persistedEmbeddedAssets, ...pendingEmbeddedAssets],
    [persistedEmbeddedAssets, pendingEmbeddedAssets],
  );

  const emailAttachments = useMemo(
    () => [...persistedEmailAttachments, ...pendingEmailAttachments],
    [persistedEmailAttachments, pendingEmailAttachments],
  );

  const handleAddEmbeddedAssetFiles = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length === 0) {
        return;
      }

      setPendingEmbeddedAssets((currentAssets) => {
        const existingCids = [
          ...persistedEmbeddedAssets.map((asset) => asset.cid),
          ...currentAssets.map((asset) => asset.cid),
        ];

        const nextAssets = [...currentAssets];

        for (const file of imageFiles) {
          const asset = createEmbeddedAssetFromFile(file, existingCids);
          existingCids.push(asset.cid);
          nextAssets.push(asset);
        }

        return nextAssets;
      });
    },
    [persistedEmbeddedAssets],
  );

  const handleAddEmailAttachmentFiles = useCallback((files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setPendingEmailAttachments((currentAttachments) => [
      ...currentAttachments,
      ...files.map(createEmailAttachmentFromFile),
    ]);
  }, []);

  const handleRemoveEmbeddedAsset = useCallback(
    async (assetId: string) => {
      const pendingAsset = pendingEmbeddedAssets.find(
        (asset) => asset.id === assetId,
      );

      if (pendingAsset) {
        revokeTemplateFileUrl(pendingAsset);

        setPendingEmbeddedAssets((currentAssets) =>
          currentAssets.filter((asset) => asset.id !== assetId),
        );

        return;
      }

      if (!templateId) {
        return;
      }

      await deleteInlineAsset.mutateAsync({
        templateId,
        fileId: assetId,
      });
    },
    [deleteInlineAsset, pendingEmbeddedAssets, templateId],
  );

  const handleRemoveEmailAttachment = useCallback(
    async (attachmentId: string) => {
      const pendingAttachment = pendingEmailAttachments.find(
        (attachment) => attachment.id === attachmentId,
      );

      if (pendingAttachment) {
        revokeTemplateFileUrl(pendingAttachment);

        setPendingEmailAttachments((currentAttachments) =>
          currentAttachments.filter(
            (attachment) => attachment.id !== attachmentId,
          ),
        );

        return;
      }

      if (!templateId) {
        return;
      }

      await deleteAttachment.mutateAsync({
        templateId,
        fileId: attachmentId,
      });
    },
    [deleteAttachment, pendingEmailAttachments, templateId],
  );

  const persistPendingTemplateFiles = useCallback(
    async (targetTemplateId: string) => {
      for (const asset of pendingEmbeddedAssets) {
        await createInlineAsset.mutateAsync({
          templateId: targetTemplateId,
          input: buildInlineAssetInput(targetTemplateId, asset),
        });
      }

      for (const attachment of pendingEmailAttachments) {
        await createAttachment.mutateAsync({
          templateId: targetTemplateId,
          input: buildAttachmentInput(targetTemplateId, attachment),
        });
      }

      pendingEmbeddedAssets.forEach(revokeTemplateFileUrl);
      pendingEmailAttachments.forEach(revokeTemplateFileUrl);

      setPendingEmbeddedAssets([]);
      setPendingEmailAttachments([]);
    },
    [
      createAttachment,
      createInlineAsset,
      pendingEmailAttachments,
      pendingEmbeddedAssets,
    ],
  );

  const resetPendingTemplateFiles = useCallback(() => {
    pendingEmbeddedAssets.forEach(revokeTemplateFileUrl);
    pendingEmailAttachments.forEach(revokeTemplateFileUrl);

    setPendingEmbeddedAssets([]);
    setPendingEmailAttachments([]);
  }, [pendingEmailAttachments, pendingEmbeddedAssets]);

  const isLoadingTemplateFiles =
    inlineAssetsQuery.isLoading || attachmentsQuery.isLoading;

  const isPersistingTemplateFiles =
    createInlineAsset.isPending ||
    createAttachment.isPending ||
    deleteInlineAsset.isPending ||
    deleteAttachment.isPending;

  return {
    embeddedAssets,
    emailAttachments,

    persistedEmbeddedAssets,
    persistedEmailAttachments,
    pendingEmbeddedAssets,
    pendingEmailAttachments,

    isLoadingTemplateFiles,
    isPersistingTemplateFiles,

    handleAddEmbeddedAssetFiles,
    handleRemoveEmbeddedAsset,
    handleAddEmailAttachmentFiles,
    handleRemoveEmailAttachment,

    persistPendingTemplateFiles,
    resetPendingTemplateFiles,
  };
}
