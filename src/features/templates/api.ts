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
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeEmbeddedAssets(
  value: unknown,
  templateId?: string,
): TemplateEmbeddedAsset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item);
      const id = asString(record.id) ?? asString(record.assetId) ?? "";
      const fileName =
        asString(record.fileName) ??
        asString(record.filename) ??
        asString(record.name) ??
        "imagem";
      const cid = asString(record.cid) ?? asString(record.contentId) ?? "";

      if (!id && !cid) {
        return null;
      }

      return {
        id: id || cid,
        templateId,
        fileName,
        mimeType:
          asString(record.mimeType) ??
          asString(record.contentType) ??
          "application/octet-stream",
        sizeBytes:
          asNumber(record.sizeBytes) ?? asNumber(record.size) ?? 0,
        cid,
        previewUrl:
          asString(record.previewUrl) ??
          asString(record.url) ??
          asString(record.publicUrl) ??
          null,
        createdAt: asString(record.createdAt) ?? asString(record.created_at),
      } satisfies TemplateEmbeddedAsset;
    })
    .filter((item): item is TemplateEmbeddedAsset => Boolean(item));
}

function normalizeEmailAttachments(
  value: unknown,
  templateId?: string,
): TemplateEmailAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = asRecord(item);
      const id = asString(record.id) ?? asString(record.attachmentId) ?? "";
      const fileName =
        asString(record.fileName) ??
        asString(record.filename) ??
        asString(record.name) ??
        "arquivo";

      if (!id && !fileName) {
        return null;
      }

      return {
        id: id || fileName,
        templateId,
        fileName,
        mimeType:
          asString(record.mimeType) ??
          asString(record.contentType) ??
          "application/octet-stream",
        sizeBytes:
          asNumber(record.sizeBytes) ?? asNumber(record.size) ?? 0,
        downloadUrl:
          asString(record.downloadUrl) ??
          asString(record.url) ??
          asString(record.publicUrl) ??
          null,
        createdAt: asString(record.createdAt) ?? asString(record.created_at),
      } satisfies TemplateEmailAttachment;
    })
    .filter((item): item is TemplateEmailAttachment => Boolean(item));
}
