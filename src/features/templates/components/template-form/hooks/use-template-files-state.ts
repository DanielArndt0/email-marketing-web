"use client";

import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import {
  buildEmbeddedImageSnippet,
  createEmailAttachmentFromFile,
  createEmbeddedAssetFromFile,
  revokeTemplateFileUrl,
} from "../../../files/utils";
import type {
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "../../../types";
import type { TemplateFormValues } from "../../../schemas";
import type { ContentMode, TemplateFormStep, TemplateRecord } from "../types";
import {
  getInitialEmailAttachments,
  getInitialEmbeddedAssets,
} from "../utils/template-form-defaults";

export function useTemplateFilesState({
  form,
  template,
  onContentModeChange,
  onStepChange,
}: {
  form: UseFormReturn<TemplateFormValues>;
  template: TemplateRecord | null;
  onContentModeChange: (mode: ContentMode) => void;
  onStepChange: (step: TemplateFormStep) => void;
}) {
  const [htmlFileName, setHtmlFileName] = useState("");
  const [fileFeedback, setFileFeedback] = useState<string | null>(null);
  const [embeddedAssets, setEmbeddedAssets] = useState<TemplateEmbeddedAsset[]>(
    () => getInitialEmbeddedAssets(template),
  );
  const [emailAttachments, setEmailAttachments] = useState<
    TemplateEmailAttachment[]
  >(() => getInitialEmailAttachments(template));

  const embeddedAssetsRef = useRef(embeddedAssets);
  const emailAttachmentsRef = useRef(emailAttachments);

  useEffect(() => {
    embeddedAssetsRef.current = embeddedAssets;
  }, [embeddedAssets]);

  useEffect(() => {
    emailAttachmentsRef.current = emailAttachments;
  }, [emailAttachments]);

  useEffect(() => {
    return () => {
      embeddedAssetsRef.current.forEach(revokeTemplateFileUrl);
      emailAttachmentsRef.current.forEach(revokeTemplateFileUrl);
    };
  }, []);

  useEffect(() => {
    setHtmlFileName("");
    setFileFeedback(null);

    setEmbeddedAssets((previousAssets) => {
      previousAssets.forEach(revokeTemplateFileUrl);
      return getInitialEmbeddedAssets(template);
    });

    setEmailAttachments((previousAttachments) => {
      previousAttachments.forEach(revokeTemplateFileUrl);
      return getInitialEmailAttachments(template);
    });
  }, [template]);

  async function handleHtmlFileChange(file?: File) {
    if (!file) {
      return;
    }

    const content = await file.text();

    setHtmlFileName(file.name);
    onContentModeChange("html");

    form.setValue("html", content, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleAddEmbeddedAssetFiles(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      setFileFeedback(
        "Alguns arquivos foram ignorados porque imagens incorporadas aceitam apenas arquivos de imagem.",
      );
    }

    if (imageFiles.length === 0) {
      return;
    }

    setEmbeddedAssets((currentAssets) => {
      const assets = [...currentAssets];
      const existingCids = assets.map((asset) => asset.cid);

      for (const file of imageFiles) {
        const asset = createEmbeddedAssetFromFile(file, existingCids);
        existingCids.push(asset.cid);
        assets.push(asset);
      }

      return assets;
    });
  }

  function handleRemoveEmbeddedAsset(assetId: string) {
    setEmbeddedAssets((currentAssets) => {
      const asset = currentAssets.find((item) => item.id === assetId);

      if (asset) {
        revokeTemplateFileUrl(asset);
      }

      return currentAssets.filter((item) => item.id !== assetId);
    });
  }

  function handleAddEmailAttachmentFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setEmailAttachments((currentAttachments) => [
      ...currentAttachments,
      ...files.map(createEmailAttachmentFromFile),
    ]);
  }

  function handleRemoveEmailAttachment(attachmentId: string) {
    setEmailAttachments((currentAttachments) => {
      const attachment = currentAttachments.find(
        (item) => item.id === attachmentId,
      );

      if (attachment) {
        revokeTemplateFileUrl(attachment);
      }

      return currentAttachments.filter((item) => item.id !== attachmentId);
    });
  }

  async function handleCopyCid(asset: TemplateEmbeddedAsset) {
    const cidReference = `cid:${asset.cid}`;

    try {
      await navigator.clipboard.writeText(cidReference);
      setFileFeedback(`Referência ${cidReference} copiada.`);
    } catch {
      setFileFeedback(`Copie manualmente a referência: ${cidReference}`);
    }
  }

  function handleInsertEmbeddedImage(asset: TemplateEmbeddedAsset) {
    const currentHtml = form.getValues("html") ?? "";
    const snippet = buildEmbeddedImageSnippet(asset);
    const separator = currentHtml.trim() ? "\n" : "";

    onContentModeChange("html");
    form.setValue("html", `${currentHtml}${separator}${snippet}`, {
      shouldDirty: true,
      shouldValidate: true,
    });

    onStepChange(0);
    setFileFeedback(
      `Imagem ${asset.fileName} inserida no HTML. Revise o preview do conteúdo.`,
    );
  }

  function clearFileFeedback() {
    setFileFeedback(null);
  }

  return {
    htmlFileName,
    fileFeedback,
    embeddedAssets,
    emailAttachments,
    clearFileFeedback,
    handleHtmlFileChange,
    handleAddEmbeddedAssetFiles,
    handleRemoveEmbeddedAsset,
    handleAddEmailAttachmentFiles,
    handleRemoveEmailAttachment,
    handleCopyCid,
    handleInsertEmbeddedImage,
  };
}
