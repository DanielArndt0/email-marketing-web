import { toApiDateTime, type CampaignFormValues } from "../../../schemas";
import type {
  CreateCampaignInput,
  TemplateVariableMappings,
} from "../../../types";
import type { TemplateVariableDefinition } from "../campaign-form.types";

import { toOptionalString } from "./form-default-values";

function normalizeTemplateVariableMappings(
  templateVariables: TemplateVariableDefinition[],
  templateVariableMappings: TemplateVariableMappings,
): TemplateVariableMappings {
  return templateVariables.reduce<TemplateVariableMappings>(
    (mappings, variable) => {
      const mapping = templateVariableMappings[variable.key];

      if (!mapping) {
        return mappings;
      }

      if (mapping.source === "lead" && mapping.path.trim()) {
        mappings[variable.key] = {
          source: "lead",
          path: mapping.path.trim(),
          ...(mapping.fallback?.trim()
            ? { fallback: mapping.fallback.trim() }
            : {}),
        };

        return mappings;
      }

      if (mapping.source === "static" && mapping.value.trim()) {
        mappings[variable.key] = {
          source: "static",
          value: mapping.value.trim(),
        };
      }

      return mappings;
    },
    {},
  );
}

export function buildCampaignPayload(params: {
  values: CampaignFormValues;
  templateVariables: TemplateVariableDefinition[];
  templateVariableMappings: TemplateVariableMappings;
}): CreateCampaignInput {
  const { values, templateVariables, templateVariableMappings } = params;

  const goal = toOptionalString(values.goal);
  const subject = toOptionalString(values.subject);
  const templateId = toOptionalString(values.templateId);
  const audienceId = toOptionalString(values.audienceId);
  const scheduleAt = values.scheduleAt?.trim()
    ? toApiDateTime(values.scheduleAt)
    : undefined;

  return {
    name: values.name.trim(),
    status: values.status,
    ...(goal ? { goal } : {}),
    ...(subject ? { subject } : {}),
    ...(templateId ? { templateId } : {}),
    ...(audienceId ? { audienceId } : {}),
    ...(scheduleAt ? { scheduleAt } : {}),
    templateVariableMappings: normalizeTemplateVariableMappings(
      templateVariables,
      templateVariableMappings,
    ),
  };
}
