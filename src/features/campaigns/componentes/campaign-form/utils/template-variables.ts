import type { EmailTemplate } from "@/features/templates/types";

import type { TemplateVariableDefinition } from "../campaign-form.types";

type TemplateVariableRecord = {
  key?: unknown;
  name?: unknown;
  label?: unknown;
  required?: unknown;
  description?: unknown;
  example?: unknown;
};

function normalizeVariable(
  variable: unknown,
): TemplateVariableDefinition | null {
  if (typeof variable === "string") {
    const key = variable.trim();

    if (!key) {
      return null;
    }

    return {
      key,
      label: key,
      required: true,
      declared: true,
    };
  }

  if (!variable || typeof variable !== "object") {
    return null;
  }

  const record = variable as TemplateVariableRecord;

  const key =
    typeof record.key === "string"
      ? record.key.trim()
      : typeof record.name === "string"
        ? record.name.trim()
        : "";

  if (!key) {
    return null;
  }

  return {
    key,
    label: typeof record.label === "string" ? record.label.trim() : key,
    required: typeof record.required === "boolean" ? record.required : true,
    description:
      typeof record.description === "string"
        ? record.description.trim()
        : undefined,
    example:
      typeof record.example === "string" ? record.example.trim() : undefined,
    declared: true,
  };
}

export function getTemplateVariables(
  template?: EmailTemplate | null,
): TemplateVariableDefinition[] {
  const rawVariables = (template as { variables?: unknown } | null | undefined)
    ?.variables;

  if (!Array.isArray(rawVariables)) {
    return [];
  }

  return rawVariables
    .map(normalizeVariable)
    .filter((variable): variable is TemplateVariableDefinition =>
      Boolean(variable),
    );
}
