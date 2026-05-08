export type TemplateFileKind = "template_inline_asset" | "template_attachment";

export type TemplateFileBase = {
  id: string;
  templateId?: string;
  kind?: TemplateFileKind;
  originalName: string;
  storedName?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey?: string;
  createdAt?: string;
  updatedAt?: string;
  file?: File;
  isLocal?: boolean;
};

export type TemplateEmbeddedAsset = TemplateFileBase & {
  kind?: "template_inline_asset";
  cid: string;
  previewUrl?: string | null;
};

export type TemplateEmailAttachment = TemplateFileBase & {
  kind?: "template_attachment";
  cid?: null;
  downloadUrl?: string | null;
};

export type CreateTemplateInlineAssetInput = {
  originalName: string;
  storedName?: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  cid: string;
};

export type CreateTemplateAttachmentInput = {
  originalName: string;
  storedName?: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
};

export type TemplateFileListResponse<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DeleteTemplateFileResponse = {
  status: string;
  id: string;
};
