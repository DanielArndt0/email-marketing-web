import type {
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "./files/types";

export type TemplateVariable = {
  key: string;
  label?: string;
  required?: boolean;
  description?: string;
  example?: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject?: string | null;
  htmlContent?: string | null;
  textContent?: string | null;
  variables?: TemplateVariable[];
  embeddedAssets?: TemplateEmbeddedAsset[];
  emailAttachments?: TemplateEmailAttachment[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTemplateInput = {
  name: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  variables?: TemplateVariable[];
};

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export type { TemplateEmailAttachment, TemplateEmbeddedAsset };
