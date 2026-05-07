export type TemplateEmbeddedAsset = {
  id: string;
  templateId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  cid: string;
  previewUrl?: string | null;
  createdAt?: string;
  file?: File;
};

export type TemplateEmailAttachment = {
  id: string;
  templateId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl?: string | null;
  createdAt?: string;
  file?: File;
};
