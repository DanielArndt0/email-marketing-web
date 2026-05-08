"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateTemplate, useUpdateTemplate } from "../../../hooks";
import {
  parseVariables,
  templateFormSchema,
  type TemplateFormValues,
} from "../../../schemas";
import type { TemplateEmbeddedAsset } from "../../../files/types";
import { buildEmbeddedImageSnippet } from "../../../files/utils";
import type {
  ContentMode,
  TemplateFormController,
  TemplateFormProps,
  TemplateFormStep,
  TemplateRecord,
} from "../types";
import {
  getDefaultValues,
  getInitialContentMode,
} from "../utils/template-form-defaults";
import { useTemplateFilesState } from "./use-template-files-state";
import { useTemplatePreviewState } from "./use-template-preview-state";

export function useTemplateFormController({
  template,
  onSaved,
}: TemplateFormProps): TemplateFormController {
  const normalizedTemplate = template as TemplateRecord | null;

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [currentStep, setCurrentStep] = useState<TemplateFormStep>(0);
  const [contentMode, setContentMode] = useState<ContentMode>(
    getInitialContentMode(normalizedTemplate),
  );
  const [htmlFileName, setHtmlFileName] = useState("");
  const [fileFeedback, setFileFeedback] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => getDefaultValues(normalizedTemplate),
    [normalizedTemplate],
  );

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues,
  });

  const filesState = useTemplateFilesState({
    templateId: template?.id ?? null,
  });

  const previewState = useTemplatePreviewState({
    form,
    contentMode,
    embeddedAssets: filesState.embeddedAssets,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setCurrentStep(0);
    setContentMode(getInitialContentMode(normalizedTemplate));
    setHtmlFileName("");
    setFileFeedback(null);
  }, [defaultValues, form, normalizedTemplate]);

  function clearFileFeedback() {
    setFileFeedback(null);
  }

  async function validateContentStep() {
    form.clearErrors(["html", "text"]);

    const fieldsToValidate: Array<keyof TemplateFormValues> = [
      "name",
      "subject",
      "variables",
      contentMode === "html" ? "html" : "text",
    ];

    const isValid = await form.trigger(fieldsToValidate);

    const htmlContent = form.getValues("html")?.trim() ?? "";
    const textContent = form.getValues("text")?.trim() ?? "";

    if (contentMode === "html" && !htmlContent) {
      form.setError("html", {
        type: "custom",
        message: "Informe o conteúdo HTML ou importe um arquivo .html.",
      });

      return false;
    }

    if (contentMode === "text" && !textContent) {
      form.setError("text", {
        type: "custom",
        message: "Informe o conteúdo em texto puro.",
      });

      return false;
    }

    return isValid;
  }

  async function goToNextStep() {
    clearFileFeedback();

    if (currentStep === 0) {
      const isValid = await validateContentStep();

      if (!isValid) {
        return;
      }

      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
    }
  }

  function goToPreviousStep() {
    clearFileFeedback();

    setCurrentStep((step) =>
      step > 0 ? ((step - 1) as TemplateFormStep) : step,
    );
  }

  async function handleHtmlFileChange(file?: File) {
    if (!file) {
      return;
    }

    const content = await file.text();

    setHtmlFileName(file.name);
    setContentMode("html");
    setFileFeedback(`Arquivo HTML importado: ${file.name}`);

    form.setValue("html", content, {
      shouldDirty: true,
      shouldValidate: true,
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

    setContentMode("html");

    form.setValue("html", `${currentHtml}${separator}${snippet}`, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setCurrentStep(0);
    setFileFeedback(
      `Imagem ${asset.fileName} inserida no HTML. Revise o preview do conteúdo.`,
    );
  }

  async function submitTemplate(values: TemplateFormValues) {
    const isContentValid = await validateContentStep();

    if (!isContentValid) {
      setCurrentStep(0);
      return;
    }

    const htmlContent = values.html?.trim() ?? "";
    const textContent = values.text?.trim() ?? "";

    const payload = {
      name: values.name.trim(),
      subject: values.subject.trim(),
      variables: parseVariables(values.variables),

      ...(contentMode === "html" ? { htmlContent } : { textContent }),
    };

    const savedTemplate = template
      ? await updateTemplate.mutateAsync({
          id: template.id,
          input: payload,
        })
      : await createTemplate.mutateAsync(payload);

    if (savedTemplate.id) {
      await filesState.persistPendingTemplateFiles(savedTemplate.id);
    }

    onSaved();
  }

  const isPending =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    filesState.isPersistingTemplateFiles;

  return {
    form,
    isEditing: Boolean(template),
    isPending,

    currentStep,
    contentMode,

    htmlFileName,
    fileFeedback,

    embeddedAssets: filesState.embeddedAssets,
    emailAttachments: filesState.emailAttachments,

    declaredVariables: previewState.declaredVariables,
    namePreview: previewState.namePreview,
    subjectPreview: previewState.subjectPreview,
    previewState: previewState.previewState,

    setContentMode,
    goToNextStep,
    goToPreviousStep,

    handleHtmlFileChange,
    handleAddEmbeddedAssetFiles: filesState.handleAddEmbeddedAssetFiles,
    handleRemoveEmbeddedAsset: filesState.handleRemoveEmbeddedAsset,
    handleAddEmailAttachmentFiles: filesState.handleAddEmailAttachmentFiles,
    handleRemoveEmailAttachment: filesState.handleRemoveEmailAttachment,
    handleCopyCid,
    handleInsertEmbeddedImage,

    handleSubmit: form.handleSubmit(submitTemplate),
  };
}
