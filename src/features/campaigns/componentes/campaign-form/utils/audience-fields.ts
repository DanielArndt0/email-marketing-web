import type { Audience } from "@/features/audiences/types";

import type { LeadPathOption } from "../campaign-form.types";

const CNPJ_METADATA_FIELDS = [
  { path: "metadata.razaoSocial", label: "Razão social" },
  { path: "metadata.nomeFantasia", label: "Nome fantasia" },
  { path: "metadata.cnpj", label: "CNPJ" },
  { path: "metadata.municipio", label: "Município" },
  { path: "metadata.uf", label: "UF" },
  { path: "metadata.cnaePrincipal", label: "CNAE principal" },
  { path: "metadata.descricaoCnaePrincipal", label: "Descrição CNAE" },
  { path: "metadata.situacaoCadastral", label: "Situação cadastral" },
  { path: "metadata.porte", label: "Porte" },
];

function createStandardOption(path: string, label = path): LeadPathOption {
  return {
    path,
    label,
    group: "standard",
  };
}

function createMetadataOption(field: string): LeadPathOption {
  return {
    path: `metadata.${field}`,
    label: field,
    group: "metadata",
  };
}

function uniqueOptions(options: LeadPathOption[]) {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (seen.has(option.path)) {
      return false;
    }

    seen.add(option.path);
    return true;
  });
}

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

function mapCsvFieldToPath(field: string): LeadPathOption {
  if (field === "email") {
    return createStandardOption("email", "E-mail");
  }

  return createMetadataOption(field);
}

function mapManualFieldToPath(field: string): LeadPathOption {
  if (field === "email") {
    return createStandardOption("email", "E-mail");
  }

  if (field === "externalId") {
    return createStandardOption("externalId", "External ID");
  }

  return createMetadataOption(field);
}

export function getLeadPathOptions(
  audience?: Audience | null,
): LeadPathOption[] {
  if (!audience) {
    return [];
  }

  const filters = (audience.filters ?? {}) as Record<string, unknown>;

  if (audience.sourceType === "cnpj-api") {
    return uniqueOptions([
      createStandardOption("email", "E-mail"),
      createStandardOption("sourceType", "Tipo da fonte"),
      ...CNPJ_METADATA_FIELDS.map((field) => ({
        ...field,
        group: "metadata" as const,
      })),
    ]);
  }

  if (audience.sourceType === "csv-import") {
    const csvFields = extractFieldsFromCsvHeader(filters);

    return uniqueOptions(csvFields.map(mapCsvFieldToPath));
  }

  if (audience.sourceType === "manual-list") {
    const columns = normalizeFieldList(filters.columns);
    const recipientFields = extractFieldsFromRecipients(filters.recipients);
    const fields = columns.length > 0 ? columns : recipientFields;

    return uniqueOptions(
      (fields.length > 0 ? fields : ["email", "externalId"]).map(
        mapManualFieldToPath,
      ),
    );
  }

  return [];
}
