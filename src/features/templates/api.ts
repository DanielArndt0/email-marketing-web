import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/api/http";

import type {
  CreateTemplateInput,
  EmailTemplate,
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
  TemplateVariable,
  UpdateTemplateInput,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeTemplate(raw: unknown): EmailTemplate {
  const item = asRecord(raw);

  return {
    id: asString(item.id) ?? asString(item.templateId) ?? "",
    name: asString(item.name) ?? asString(item.title) ?? "Template sem nome",
    subject: asString(item.subject),

    htmlContent:
      asString(item.htmlContent) ??
      asString(item.html) ??
      asString(item.bodyHtml) ??
      asString(item.contentHtml),

    textContent:
      asString(item.textContent) ??
      asString(item.text) ??
      asString(item.bodyText) ??
      asString(item.contentText),

    variables: normalizeVariables(item.variables),
    embeddedAssets: normalizeEmbeddedAssets(
      item.embeddedAssets ?? item.assets ?? item.inlineAssets,
      asString(item.id) ?? asString(item.templateId),
    ),
    emailAttachments: normalizeEmailAttachments(
      item.emailAttachments ?? item.attachments ?? item.files,
      asString(item.id) ?? asString(item.templateId),
    ),

    createdAt: asString(item.createdAt) ?? asString(item.created_at),

    updatedAt: asString(item.updatedAt) ?? asString(item.updated_at),
  };
}

function extractTemplateItems(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  const root = asRecord(response);

  const directCandidates = [
    root.data,
    root.items,
    root.results,
    root.templates,
    root.records,
    root.rows,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const data = asRecord(root.data);
  const payload = asRecord(root.payload);
  const result = asRecord(root.result);

  const nestedCandidates = [
    data.items,
    data.data,
    data.results,
    data.templates,
    payload.items,
    payload.data,
    payload.results,
    payload.templates,
    result.items,
    result.data,
    result.results,
    result.templates,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export async function listTemplates() {
  const response = await getJson<unknown>(endpoints.templates.list, {
    page: 1,
    limit: 50,
  });

  //TODO: remover esse console.debug quando tivermos uma estrutura de resposta mais consistente e confiável
  console.debug("[templates:list] response", response);

  return extractTemplateItems(response).map(normalizeTemplate);
}

export async function createTemplate(input: CreateTemplateInput) {
  const response = await postJson<unknown, CreateTemplateInput>(
    endpoints.templates.create,
    input,
  );

  return normalizeTemplate(response);
}

export async function updateTemplate(id: string, input: UpdateTemplateInput) {
  const response = await patchJson<unknown, UpdateTemplateInput>(
    endpoints.templates.byId(id),
    input,
  );

  return normalizeTemplate(response);
}

export async function deleteTemplate(id: string) {
  return deleteJson<void>(endpoints.templates.byId(id));
}

function normalizeVariables(value: unknown): TemplateVariable[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const variables: TemplateVariable[] = [];

  for (const item of value) {
    if (typeof item === "string") {
      const key = item.trim();

      if (key) {
        variables.push({
          key,
          label: key,
          required: false,
        });
      }

      continue;
    }

    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;

    const key = typeof record.key === "string" ? record.key.trim() : "";

    if (!key) {
      continue;
    }

    const variable: TemplateVariable = {
      key,
    };

    if (typeof record.label === "string") {
      variable.label = record.label;
    }

    if (typeof record.required === "boolean") {
      variable.required = record.required;
    }

    if (typeof record.description === "string") {
      variable.description = record.description;
    }

    if (typeof record.example === "string") {
      variable.example = record.example;
    }

    variables.push(variable);
  }

  return variables;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeEmbeddedAssets(
  value: unknown,
  fallbackTemplateId?: string,
): TemplateEmbeddedAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): TemplateEmbeddedAsset | null => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;

      const id = getStringValue(record.id);
      const fileName =
        getStringValue(record.fileName) ??
        getStringValue(record.filename) ??
        getStringValue(record.name);
      const mimeType =
        getStringValue(record.mimeType) ??
        getStringValue(record.contentType) ??
        "application/octet-stream";
      const sizeBytes =
        getNumberValue(record.sizeBytes) ?? getNumberValue(record.size) ?? 0;
      const cid = getStringValue(record.cid);
      const templateId =
        getStringValue(record.templateId) ??
        getStringValue(record.template_id) ??
        fallbackTemplateId;
      const previewUrl =
        getStringValue(record.previewUrl) ?? getStringValue(record.url) ?? null;
      const createdAt = getStringValue(record.createdAt);

      if (!id || !fileName || !cid) {
        return null;
      }

      const asset: TemplateEmbeddedAsset = {
        id,
        originalName: fileName,
        storedName: fileName,
        fileName,
        mimeType,
        sizeBytes,
        cid,
        previewUrl,
      };

      if (templateId) {
        asset.templateId = templateId;
      }

      if (createdAt) {
        asset.createdAt = createdAt;
      }

      return asset;
    })
    .filter(isNotNull);
}

function normalizeEmailAttachments(
  value: unknown,
  fallbackTemplateId?: string,
): TemplateEmailAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): TemplateEmailAttachment | null => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;

      const id = getStringValue(record.id);
      const fileName =
        getStringValue(record.fileName) ??
        getStringValue(record.filename) ??
        getStringValue(record.name);
      const mimeType =
        getStringValue(record.mimeType) ??
        getStringValue(record.contentType) ??
        "application/octet-stream";
      const sizeBytes =
        getNumberValue(record.sizeBytes) ?? getNumberValue(record.size) ?? 0;
      const templateId =
        getStringValue(record.templateId) ??
        getStringValue(record.template_id) ??
        fallbackTemplateId;
      const downloadUrl =
        getStringValue(record.downloadUrl) ??
        getStringValue(record.url) ??
        null;
      const createdAt = getStringValue(record.createdAt);

      if (!id || !fileName) {
        return null;
      }

      const attachment: TemplateEmailAttachment = {
        id,
        originalName: fileName,
        storedName: fileName,
        fileName,
        mimeType,
        sizeBytes,
        downloadUrl,
      };

      if (templateId) {
        attachment.templateId = templateId;
      }

      if (createdAt) {
        attachment.createdAt = createdAt;
      }

      return attachment;
    })
    .filter(isNotNull);
}
