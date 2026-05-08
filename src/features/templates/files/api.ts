import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, postJson } from "@/lib/api/http";

import type {
  CreateTemplateAttachmentInput,
  CreateTemplateInlineAssetInput,
  DeleteTemplateFileResponse,
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
  TemplateFileListResponse,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function extractItems(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  const record = asRecord(value);

  if (Array.isArray(record.items)) {
    return record.items;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  return [];
}

function normalizePagination<TItem>(
  response: unknown,
  items: TItem[],
): TemplateFileListResponse<TItem> {
  const record = asRecord(response);

  return {
    items,
    page: asNumber(record.page) ?? 1,
    pageSize: asNumber(record.pageSize) ?? items.length,
    total: asNumber(record.total) ?? items.length,
    totalPages: asNumber(record.totalPages) ?? (items.length > 0 ? 1 : 0),
  };
}

function normalizeInlineAsset(value: unknown): TemplateEmbeddedAsset {
  const record = asRecord(value);

  const originalName =
    asString(record.originalName) ??
    asString(record.fileName) ??
    asString(record.filename) ??
    asString(record.name) ??
    "asset";

  const storedName =
    asString(record.storedName) ?? asString(record.stored_name);

  return {
    id: asString(record.id) ?? "",
    templateId: asString(record.templateId) ?? asString(record.template_id),
    kind: "template_inline_asset",
    originalName,
    storedName,
    fileName: originalName,
    mimeType:
      asString(record.mimeType) ??
      asString(record.mime_type) ??
      asString(record.contentType) ??
      "application/octet-stream",
    sizeBytes: asNumber(record.sizeBytes) ?? asNumber(record.size_bytes) ?? 0,
    storageKey:
      asString(record.storageKey) ?? asString(record.storage_key) ?? "",
    cid: asString(record.cid) ?? "",
    previewUrl: asString(record.previewUrl) ?? asString(record.preview_url),
    createdAt: asString(record.createdAt) ?? asString(record.created_at),
    updatedAt: asString(record.updatedAt) ?? asString(record.updated_at),
    isLocal: false,
  };
}

function normalizeAttachment(value: unknown): TemplateEmailAttachment {
  const record = asRecord(value);

  const originalName =
    asString(record.originalName) ??
    asString(record.fileName) ??
    asString(record.filename) ??
    asString(record.name) ??
    "attachment";

  const storedName =
    asString(record.storedName) ?? asString(record.stored_name);

  return {
    id: asString(record.id) ?? "",
    templateId: asString(record.templateId) ?? asString(record.template_id),
    kind: "template_attachment",
    originalName,
    storedName,
    fileName: originalName,
    mimeType:
      asString(record.mimeType) ??
      asString(record.mime_type) ??
      asString(record.contentType) ??
      "application/octet-stream",
    sizeBytes: asNumber(record.sizeBytes) ?? asNumber(record.size_bytes) ?? 0,
    storageKey:
      asString(record.storageKey) ?? asString(record.storage_key) ?? "",
    cid: null,
    downloadUrl: asString(record.downloadUrl) ?? asString(record.download_url),
    createdAt: asString(record.createdAt) ?? asString(record.created_at),
    updatedAt: asString(record.updatedAt) ?? asString(record.updated_at),
    isLocal: false,
  };
}

export async function listTemplateInlineAssets(templateId: string) {
  const response = await getJson<unknown>(
    endpoints.templates.inlineAssets.list(templateId),
    {
      page: 1,
      pageSize: 100,
    },
  );

  const items = extractItems(response)
    .map(normalizeInlineAsset)
    .filter((item) => item.id && item.cid);

  return normalizePagination(response, items);
}

export async function createTemplateInlineAsset(
  templateId: string,
  input: CreateTemplateInlineAssetInput,
) {
  const response = await postJson<unknown, CreateTemplateInlineAssetInput>(
    endpoints.templates.inlineAssets.create(templateId),
    input,
  );

  return normalizeInlineAsset(response);
}

export async function deleteTemplateInlineAsset(
  templateId: string,
  fileId: string,
) {
  return deleteJson<DeleteTemplateFileResponse>(
    endpoints.templates.inlineAssets.byId(templateId, fileId),
  );
}

export async function listTemplateAttachments(templateId: string) {
  const response = await getJson<unknown>(
    endpoints.templates.attachments.list(templateId),
    {
      page: 1,
      pageSize: 100,
    },
  );

  const items = extractItems(response)
    .map(normalizeAttachment)
    .filter((item) => item.id);

  return normalizePagination(response, items);
}

export async function createTemplateAttachment(
  templateId: string,
  input: CreateTemplateAttachmentInput,
) {
  const response = await postJson<unknown, CreateTemplateAttachmentInput>(
    endpoints.templates.attachments.create(templateId),
    input,
  );

  return normalizeAttachment(response);
}

export async function deleteTemplateAttachment(
  templateId: string,
  fileId: string,
) {
  return deleteJson<DeleteTemplateFileResponse>(
    endpoints.templates.attachments.byId(templateId, fileId),
  );
}
