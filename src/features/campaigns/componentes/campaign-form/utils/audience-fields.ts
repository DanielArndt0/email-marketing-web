import type { Audience } from "@/features/audiences/types";

import { DEFAULT_CNPJ_AUDIENCE_FIELDS } from "../campaign-form.constants";

function normalizeFieldList(fields: unknown): string[] {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields
    .map((field) => (typeof field === "string" ? field.trim() : ""))
    .filter(Boolean);
}

function extractFieldsFromRecipients(recipients: unknown): string[] {
  if (!Array.isArray(recipients)) {
    return [];
  }

  const fields = new Set<string>();

  recipients.forEach((recipient) => {
    if (recipient && typeof recipient === "object") {
      Object.keys(recipient).forEach((key) => fields.add(key));
    }
  });

  return Array.from(fields);
}

function extractFieldsFromCsvHeader(
  filters: Record<string, unknown>,
): string[] {
  const csvContent =
    typeof filters.csvContent === "string" ? filters.csvContent : "";

  const delimiter =
    typeof filters.delimiter === "string" && filters.delimiter
      ? filters.delimiter
      : ",";

  const firstLine = csvContent
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .find(Boolean);

  if (!firstLine) {
    return [
      typeof filters.emailColumn === "string" ? filters.emailColumn : "email",
    ];
  }

  return firstLine
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAudienceFields(audience?: Audience | null): string[] {
  if (!audience) {
    return [];
  }

  const filters = (audience.filters ?? {}) as Record<string, unknown>;

  if (audience.sourceType === "manual-list") {
    const columns = normalizeFieldList(filters.columns);

    if (columns.length > 0) {
      return columns;
    }

    const recipientFields = extractFieldsFromRecipients(filters.recipients);

    if (recipientFields.length > 0) {
      return recipientFields;
    }

    return ["email"];
  }

  if (audience.sourceType === "csv-import") {
    return extractFieldsFromCsvHeader(filters);
  }

  return DEFAULT_CNPJ_AUDIENCE_FIELDS;
}
