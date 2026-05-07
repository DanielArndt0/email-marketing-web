import type {
  TemplateEmailAttachment,
  TemplateEmbeddedAsset,
} from "../../../files/types";
import type { TemplateFormValues } from "../../../schemas";
import type { ContentMode, TemplateRecord } from "../types";

export function getTemplateHtml(template: TemplateRecord | null) {
  return template?.htmlContent ?? "";
}

export function getTemplateText(template: TemplateRecord | null) {
  return template?.textContent ?? "";
}

export function getTemplateVariablesText(template: TemplateRecord | null) {
  if (!Array.isArray(template?.variables)) {
    return "";
  }

  return template.variables
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
    .filter(Boolean)
    .join(", ");
}

export function getInitialContentMode(
  template: TemplateRecord | null,
): ContentMode {
  const html = getTemplateHtml(template);
  const text = getTemplateText(template);

  if (!html?.trim() && text?.trim()) {
    return "text";
  }

  return "html";
}

export function getDefaultValues(
  template: TemplateRecord | null,
): TemplateFormValues {
  return {
    name: template?.name ?? "",
    subject: template?.subject ?? "",
    html: getTemplateHtml(template),
    text: getTemplateText(template),
    variables: getTemplateVariablesText(template),
  };
}

export function getInitialEmbeddedAssets(
  template: TemplateRecord | null,
): TemplateEmbeddedAsset[] {
  return template?.embeddedAssets ?? [];
}

export function getInitialEmailAttachments(
  template: TemplateRecord | null,
): TemplateEmailAttachment[] {
  return template?.emailAttachments ?? [];
}
