import { useCallback, useEffect, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import type {
  Campaign,
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../../types";
import type {
  CampaignFormValues,
  LeadPathOption,
  TemplateVariableDefinition,
} from "../campaign-form.types";

type UseTemplateVariableMappingParams = {
  form: UseFormReturn<CampaignFormValues>;
  campaign: Campaign | null;
  templateVariables: TemplateVariableDefinition[];
  leadPathOptions: LeadPathOption[];
};

function normalizeMappingsForForm(
  mappings?: TemplateVariableMappings,
): TemplateVariableMappings {
  if (!mappings) {
    return {};
  }

  return Object.entries(mappings).reduce<TemplateVariableMappings>(
    (normalizedMappings, [variable, mapping]) => {
      if (mapping.source === "lead") {
        const path = mapping.path.trim();

        if (!path) {
          return normalizedMappings;
        }

        normalizedMappings[variable] = {
          source: "lead",
          path,
          ...(mapping.fallback?.trim()
            ? { fallback: mapping.fallback.trim() }
            : {}),
        };

        return normalizedMappings;
      }

      normalizedMappings[variable] = {
        source: "static",
        value: mapping.value,
      };

      return normalizedMappings;
    },
    {},
  );
}

function isMappingValid(mapping?: TemplateVariableMapping) {
  if (!mapping) {
    return false;
  }

  if (mapping.source === "lead") {
    return mapping.path.trim().length > 0;
  }

  return mapping.value.trim().length > 0;
}

function findBestLeadPath(
  variable: TemplateVariableDefinition,
  leadPathOptions: LeadPathOption[],
) {
  const key = variable.key.toLowerCase();

  return (
    leadPathOptions.find((option) => option.path.toLowerCase() === key) ??
    leadPathOptions.find(
      (option) => option.path.toLowerCase() === `metadata.${key}`,
    ) ??
    leadPathOptions.find(
      (option) => option.path.split(".").at(-1)?.toLowerCase() === key,
    ) ??
    null
  );
}

function buildMappingsForTemplate({
  currentMappings,
  templateVariables,
  leadPathOptions,
}: {
  currentMappings: TemplateVariableMappings;
  templateVariables: TemplateVariableDefinition[];
  leadPathOptions: LeadPathOption[];
}) {
  return templateVariables.reduce<TemplateVariableMappings>(
    (nextMappings, variable) => {
      const currentMapping = currentMappings[variable.key];

      if (currentMapping?.source === "static") {
        nextMappings[variable.key] = currentMapping;
        return nextMappings;
      }

      if (currentMapping?.source === "lead" && currentMapping.path.trim()) {
        nextMappings[variable.key] = currentMapping;
        return nextMappings;
      }

      const matchedOption = findBestLeadPath(variable, leadPathOptions);

      if (matchedOption) {
        nextMappings[variable.key] = {
          source: "lead",
          path: matchedOption.path,
        };
      }

      return nextMappings;
    },
    {},
  );
}

function areMappingsEqual(
  first: TemplateVariableMappings,
  second: TemplateVariableMappings,
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function useTemplateVariableMapping({
  form,
  campaign,
  templateVariables,
  leadPathOptions,
}: UseTemplateVariableMappingParams) {
  const campaignIdentity = campaign?.id ?? "new-campaign";

  const watchedMappings = useWatch({
    control: form.control,
    name: "templateVariableMappings",
  });

  const templateVariableMappings = useMemo(
    () => normalizeMappingsForForm(watchedMappings),
    [watchedMappings],
  );

  const updateMappings = useCallback(
    (nextMappings: TemplateVariableMappings) => {
      form.setValue("templateVariableMappings", nextMappings, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  useEffect(() => {
    const currentMappings = normalizeMappingsForForm(
      form.getValues("templateVariableMappings"),
    );

    const nextMappings = buildMappingsForTemplate({
      currentMappings,
      templateVariables,
      leadPathOptions,
    });

    if (!areMappingsEqual(currentMappings, nextMappings)) {
      updateMappings(nextMappings);
    }
  }, [
    campaignIdentity,
    form,
    leadPathOptions,
    templateVariables,
    updateMappings,
  ]);

  const handleMappingSourceChange = useCallback(
    (variable: string, source: TemplateVariableMapping["source"]) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );

      const currentMapping = currentMappings[variable];

      if (source === "static") {
        updateMappings({
          ...currentMappings,
          [variable]: {
            source: "static",
            value:
              currentMapping?.source === "static" ? currentMapping.value : "",
          },
        });

        return;
      }

      const templateVariable = templateVariables.find(
        (item) => item.key === variable,
      );

      const matchedOption = templateVariable
        ? findBestLeadPath(templateVariable, leadPathOptions)
        : null;

      updateMappings({
        ...currentMappings,
        [variable]: {
          source: "lead",
          path:
            currentMapping?.source === "lead"
              ? currentMapping.path
              : (matchedOption?.path ?? ""),
        },
      });
    },
    [form, leadPathOptions, templateVariables, updateMappings],
  );

  const handleMappingPathChange = useCallback(
    (variable: string, path: string) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );

      updateMappings({
        ...currentMappings,
        [variable]: {
          source: "lead",
          path,
        },
      });
    },
    [form, updateMappings],
  );

  const handleMappingStaticValueChange = useCallback(
    (variable: string, value: string) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );

      updateMappings({
        ...currentMappings,
        [variable]: {
          source: "static",
          value,
        },
      });
    },
    [form, updateMappings],
  );

  const handleMappingFallbackChange = useCallback(
    (variable: string, fallback: string) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );

      const currentMapping = currentMappings[variable];

      const path = currentMapping?.source === "lead" ? currentMapping.path : "";

      updateMappings({
        ...currentMappings,
        [variable]: {
          source: "lead",
          path,
          ...(fallback.trim() ? { fallback } : {}),
        },
      });
    },
    [form, updateMappings],
  );

  const unmappedVariables = useMemo(
    () =>
      templateVariables.filter((variable) => {
        if (!variable.required) {
          return false;
        }

        return !isMappingValid(templateVariableMappings[variable.key]);
      }),
    [templateVariableMappings, templateVariables],
  );

  return {
    templateVariableMappings,
    unmappedVariables,
    handleMappingSourceChange,
    handleMappingPathChange,
    handleMappingStaticValueChange,
    handleMappingFallbackChange,
  };
}
