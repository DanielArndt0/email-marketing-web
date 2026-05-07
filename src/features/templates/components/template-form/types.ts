import type { UseFormReturn } from "react-hook-form";

import type {
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "../../files/types";
import type { TemplateFormValues } from "../../schemas";
import type { EmailTemplate } from "../../types";

export type PreviewMode = "visual" | "code";
export type ContentMode = "html" | "text";
export type TemplateFormStep = 0 | 1 | 2;

export type TemplateRecord = EmailTemplate & {
  htmlContent?: string | null;
  textContent?: string | null;
};

export type TemplateFormProps = {
  template: EmailTemplate | null;
  onCancel: () => void;
  onSaved: () => void;
};

export type TemplatePreviewState = {
  contentMode: ContentMode;
  previewMode: PreviewMode;
  htmlPreview?: string;
  textPreview?: string;
  declaredVariables: string[];
  highlightedHtmlPreview: string;
  hasHtmlPreview: boolean;
  hasTextPreview: boolean;
  onPreviewModeChange: (mode: PreviewMode) => void;
};

export type TemplateFormController = {
  form: UseFormReturn<TemplateFormValues>;
  isEditing: boolean;
  isPending: boolean;
  currentStep: TemplateFormStep;
  contentMode: ContentMode;
  htmlFileName: string;
  fileFeedback: string | null;
  embeddedAssets: TemplateEmbeddedAsset[];
  emailAttachments: TemplateEmailAttachment[];
  declaredVariables: string[];
  namePreview?: string;
  subjectPreview?: string;
  previewState: TemplatePreviewState;
  setContentMode: (mode: ContentMode) => void;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => void;
  handleHtmlFileChange: (file?: File) => Promise<void>;
  handleAddEmbeddedAssetFiles: (files: File[]) => void;
  handleRemoveEmbeddedAsset: (assetId: string) => void;
  handleAddEmailAttachmentFiles: (files: File[]) => void;
  handleRemoveEmailAttachment: (attachmentId: string) => void;
  handleCopyCid: (asset: TemplateEmbeddedAsset) => Promise<void>;
  handleInsertEmbeddedImage: (asset: TemplateEmbeddedAsset) => void;
  handleSubmit: () => void;
};
