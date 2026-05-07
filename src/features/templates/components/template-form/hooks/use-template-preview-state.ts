"use client";

import { useMemo, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import { buildPreviewHtmlWithEmbeddedAssets } from "../../../files/utils";
import type { TemplateEmbeddedAsset } from "../../../types";
import type { TemplateFormValues } from "../../../schemas";
import {
  buildHighlightedHtmlPreview,
  extractDeclaredVariables,
} from "../../template-variable-highlight";
import type { ContentMode, PreviewMode } from "../types";

export function useTemplatePreviewState({
  form,
  contentMode,
  embeddedAssets,
}: {
  form: UseFormReturn<TemplateFormValues>;
  contentMode: ContentMode;
  embeddedAssets: TemplateEmbeddedAsset[];
}) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("visual");

  const namePreview = useWatch({
    control: form.control,
    name: "name",
  });

  const subjectPreview = useWatch({
    control: form.control,
    name: "subject",
  });

  const htmlPreview = useWatch({
    control: form.control,
    name: "html",
  });

  const textPreview = useWatch({
    control: form.control,
    name: "text",
  });

  const variablesValue = useWatch({
    control: form.control,
    name: "variables",
  });

  const declaredVariables = useMemo(
    () => extractDeclaredVariables(variablesValue),
    [variablesValue],
  );

  const htmlPreviewWithEmbeddedAssets = useMemo(
    () => buildPreviewHtmlWithEmbeddedAssets(htmlPreview, embeddedAssets),
    [htmlPreview, embeddedAssets],
  );

  const highlightedHtmlPreview = useMemo(
    () =>
      buildHighlightedHtmlPreview(
        htmlPreviewWithEmbeddedAssets,
        declaredVariables,
      ),
    [htmlPreviewWithEmbeddedAssets, declaredVariables],
  );

  return {
    namePreview,
    subjectPreview,
    declaredVariables,
    previewState: {
      contentMode,
      previewMode,
      htmlPreview,
      textPreview,
      declaredVariables,
      highlightedHtmlPreview,
      hasHtmlPreview: Boolean(htmlPreview?.trim()),
      hasTextPreview: Boolean(textPreview?.trim()),
      onPreviewModeChange: setPreviewMode,
    },
  };
}
