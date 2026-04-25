import { endpoints } from "@/lib/api/endpoints";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/api/http";

import type {
  Audience,
  AudiencePreviewResponse,
  CreateAudienceInput,
  UpdateAudienceInput,
} from "./types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeAudience(raw: unknown): Audience {
  const item = asRecord(raw);
  const definition = asRecord(item.definition);

  return {
    id: asString(item.id) ?? "",
    name: asString(item.name) ?? "Audience sem nome",
    description: asString(item.description),
    sourceType: (asString(definition.sourceType) ??
      "cnpj-api") as Audience["sourceType"],
    filters: asRecord(definition.filters),
    createdAt: asString(item.createdAt),
    updatedAt: asString(item.updatedAt),
  };
}

function extractAudienceItems(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;

  const root = asRecord(response);

  const candidates = [
    root.data,
    root.items,
    root.results,
    root.audiences,
    root.records,
    root.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  const data = asRecord(root.data);
  const payload = asRecord(root.payload);

  const nestedCandidates = [
    data.items,
    data.data,
    data.results,
    data.audiences,
    payload.items,
    payload.data,
    payload.results,
    payload.audiences,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

export async function listAudiences() {
  const response = await getJson<unknown>(endpoints.audiences.list, {
    page: 1,
    limit: 50,
  });

  //TODO: remover esse console.debug quando tivermos uma estrutura de resposta mais consistente e confiável
  console.debug("[audiences:list] response", response);

  return extractAudienceItems(response).map(normalizeAudience);
}

export async function createAudience(input: CreateAudienceInput) {
  const response = await postJson<unknown, unknown>(
    endpoints.audiences.create,
    toAudienceApiPayload(input),
  );

  return normalizeAudience(response);
}

export async function updateAudience(id: string, input: UpdateAudienceInput) {
  const response = await patchJson<unknown, unknown>(
    endpoints.audiences.byId(id),
    toAudienceApiPayload(input),
  );

  return normalizeAudience(response);
}

export async function deleteAudience(id: string) {
  return deleteJson<void>(endpoints.audiences.byId(id));
}

export async function previewAudience(id: string) {
  const response = await getJson<unknown>(endpoints.audiences.preview(id));

  const root = asRecord(response);

  const items =
    extractAudienceItems(response).length > 0
      ? extractAudienceItems(response)
      : [];

  return {
    items,
    total:
      typeof root.total === "number"
        ? root.total
        : typeof root.count === "number"
          ? root.count
          : items.length,
    page: typeof root.page === "number" ? root.page : undefined,
    limit: typeof root.limit === "number" ? root.limit : undefined,
  } as AudiencePreviewResponse;
}

function toAudienceApiPayload(
  input: CreateAudienceInput | UpdateAudienceInput,
) {
  return {
    ...(input.name ? { name: input.name } : {}),
    ...(input.description ? { description: input.description } : {}),
    definition: {
      sourceType: input.sourceType,
      filters: input.filters ?? {},
    },
  };
}
