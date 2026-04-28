import type { EmailTemplate } from "@/features/templates/types";

export function getTemplateVariables(
  template?: EmailTemplate | null,
): string[] {
  const rawVariables = (template as { variables?: unknown } | null | undefined)
    ?.variables;

  if (!Array.isArray(rawVariables)) {
    return [];
  }

  return rawVariables
    .map((variable) => {
      if (typeof variable === "string") {
        return variable;
      }

      if (variable && typeof variable === "object") {
        const record = variable as Record<string, unknown>;

        if (typeof record.key === "string") {
          return record.key;
        }

        if (typeof record.name === "string") {
          return record.name;
        }
      }

      return "";
    })
    .filter(Boolean);
}
