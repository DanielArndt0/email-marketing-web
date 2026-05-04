import type { Audience, AudiencePreviewItem } from "@/features/audiences/types";

import type { LeadPathOption } from "../campaign-form.types";

type UnknownRecord = Record<string, unknown>;

const IGNORED_METADATA_KEYS = new Set(["email", "externalId", "sourceType"]);

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function getSafeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function toLeadPathOption(
  path: string,
  label = path,
  group = "Lead",
): LeadPathOption {
  return {
    path,
    label,
    group,
  };
}

function uniqueOptions(options: LeadPathOption[]) {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (!option.path || seen.has(option.path)) {
      return false;
    }

    seen.add(option.path);
    return true;
  });
}

function pushMetadataField(options: LeadPathOption[], field: string) {
  const normalizedField = field.trim();

  if (!normalizedField) {
    return;
  }

  if (normalizedField === "email") {
    options.push(toLeadPathOption("email", "email", "Lead"));
    return;
  }

  if (normalizedField === "externalId") {
    options.push(toLeadPathOption("externalId", "externalId", "Lead"));
    return;
  }

  const path = normalizedField.includes(".")
    ? normalizedField
    : `metadata.${normalizedField}`;

  options.push(toLeadPathOption(path, path, "Metadata"));
}

function collectDeclaredAudienceFields(
  audience: Audience,
  options: LeadPathOption[],
) {
  const unsafeAudience = audience as unknown as {
    fields?: unknown[];
    columns?: unknown[];
    metadataFields?: unknown[];
    sample?: {
      metadata?: Record<string, unknown>;
    };
    definition?: {
      fields?: unknown[];
      columns?: unknown[];
      metadataFields?: unknown[];
      sample?: {
        metadata?: Record<string, unknown>;
      };
    };
  };

  const fieldSources = [
    unsafeAudience.fields,
    unsafeAudience.columns,
    unsafeAudience.metadataFields,
    unsafeAudience.definition?.fields,
    unsafeAudience.definition?.columns,
    unsafeAudience.definition?.metadataFields,
  ];

  for (const source of fieldSources) {
    for (const field of getSafeArray(source)) {
      if (typeof field === "string") {
        pushMetadataField(options, field);
      }
    }
  }

  const sampleMetadata =
    unsafeAudience.sample?.metadata ??
    unsafeAudience.definition?.sample?.metadata;

  const metadata = asRecord(sampleMetadata);

  if (metadata) {
    for (const key of Object.keys(metadata)) {
      if (!IGNORED_METADATA_KEYS.has(key)) {
        pushMetadataField(options, key);
      }
    }
  }
}

function collectPreviewAudienceFields(
  previewItems: AudiencePreviewItem[],
  options: LeadPathOption[],
) {
  const hasExternalId = previewItems.some((item) => {
    const record = item as Record<string, unknown>;

    return Boolean(record.externalId);
  });

  if (hasExternalId) {
    options.push(toLeadPathOption("externalId", "externalId", "Lead"));
  }

  for (const item of previewItems) {
    const metadata = asRecord((item as Record<string, unknown>).metadata);

    if (!metadata) {
      continue;
    }

    for (const key of Object.keys(metadata)) {
      if (IGNORED_METADATA_KEYS.has(key)) {
        continue;
      }

      pushMetadataField(options, key);
    }
  }
}

export function getAudienceLeadPathOptions(
  audience: Audience | null,
  previewItems: AudiencePreviewItem[] = [],
): LeadPathOption[] {
  if (!audience) {
    return [];
  }

  const options: LeadPathOption[] = [
    toLeadPathOption("email", "email", "Lead"),
  ];

  collectDeclaredAudienceFields(audience, options);
  collectPreviewAudienceFields(previewItems, options);

  return uniqueOptions(options);
}
