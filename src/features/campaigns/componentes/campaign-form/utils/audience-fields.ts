import type { Audience } from "@/features/audiences/types";

import type { LeadPathOption } from "../campaign-form.types";

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getSafeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function toLeadPathOption(path: string): LeadPathOption {
  return {
    path,
    label: path,
  };
}

export function getAudienceLeadPathOptions(
  audience: Audience | null,
): LeadPathOption[] {
  if (!audience) {
    return [];
  }

  const sourceType = audience.sourceType;

  const baseFields = ["email"];

  if (sourceType === "manual-list") {
    baseFields.push("externalId");
  }

  const dynamicFields: string[] = [];

  const unsafeAudience = audience as unknown as {
    fields?: unknown[];
    columns?: unknown[];
    metadataFields?: unknown[];
    sample?: {
      metadata?: Record<string, unknown>;
    };
  };

  for (const field of getSafeArray(unsafeAudience.fields)) {
    if (typeof field === "string") {
      dynamicFields.push(field.includes(".") ? field : `metadata.${field}`);
    }
  }

  for (const field of getSafeArray(unsafeAudience.columns)) {
    if (typeof field === "string") {
      dynamicFields.push(field.includes(".") ? field : `metadata.${field}`);
    }
  }

  for (const field of getSafeArray(unsafeAudience.metadataFields)) {
    if (typeof field === "string") {
      dynamicFields.push(field.includes(".") ? field : `metadata.${field}`);
    }
  }

  const metadata = unsafeAudience.sample?.metadata;

  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    for (const key of Object.keys(metadata)) {
      dynamicFields.push(`metadata.${key}`);
    }
  }

  if (sourceType === "cnpj-api") {
    dynamicFields.push(
      "metadata.cnpj",
      "metadata.razaoSocial",
      "metadata.nomeFantasia",
      "metadata.municipio",
      "metadata.uf",
      "metadata.cnaePrincipal",
    );
  }

  if (sourceType === "csv-import") {
    dynamicFields.push(
      "metadata.name",
      "metadata.company",
      "metadata.razaoSocial",
      "metadata.municipio",
      "metadata.uf",
    );
  }

  if (sourceType === "manual-list") {
    dynamicFields.push(
      "metadata.name",
      "metadata.company",
      "metadata.razaoSocial",
    );
  }

  return unique([...baseFields, ...dynamicFields]).map(toLeadPathOption);
}
