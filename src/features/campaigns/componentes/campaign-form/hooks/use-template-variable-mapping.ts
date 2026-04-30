import { useCallback, useEffect, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import type {
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../../types";
import type {
  CampaignFormValues,
  LeadPathOption,
  TemplateVariableDefinition,
} from "../campaign-form.types";

function normalizeMappingsForForm(
  mappings?: TemplateVariableMappings,
): TemplateVariableMappings {
  if (!mappings) {
    return {};
  }

  return Object.entries(mappings).reduce<TemplateVariableMappings>(
    (normalizedMappings, [variable, mapping]) => {
      if (mapping.source === "lead" && mapping.path.trim()) {
        normalizedMappings[variable] = {
          source: "lead",
          path: mapping.path.trim(),
          ...(mapping.fallback?.trim()
            ? { fallback: mapping.fallback.trim() }
            : {}),
        };

        return normalizedMappings;
      }

      if (mapping.source === "static") {
        normalizedMappings[variable] = {
          source: "static",
          value: mapping.value,
        };
      }

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
    return Boolean(mapping.path.trim());
  }

  return Boolean(mapping.value.trim());
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

function isValidLeadPath(
  mapping: TemplateVariableMapping | undefined,
  leadPathOptions: LeadPathOption[],
) {
  if (mapping?.source !== "lead") {
    return false;
  }

  return leadPathOptions.some((option) => option.path === mapping.path);
}

function buildTemplateMappings({
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
      const existingMapping = currentMappings[variable.key];

      if (isValidLeadPath(existingMapping, leadPathOptions)) {
        nextMappings[variable.key] = existingMapping;
        return nextMappings;
      }

      if (existingMapping?.source === "static") {
        nextMappings[variable.key] = existingMapping;
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
  templateVariables,
  leadPathOptions,
}: {
  form: UseFormReturn<CampaignFormValues>;
  templateVariables: TemplateVariableDefinition[];
  leadPathOptions: LeadPathOption[];
}) {
  const watchedMappings = useWatch({
    control: form.control,
    name: "templateVariableMappings",
  });

  const templateVariableMappings = useMemo(
    () => normalizeMappingsForForm(watchedMappings),
    [watchedMappings],
  );

  const setTemplateVariableMappings = useCallback(
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

    const nextMappings = buildTemplateMappings({
      currentMappings,
      templateVariables,
      leadPathOptions,
    });

    if (!areMappingsEqual(currentMappings, nextMappings)) {
      form.setValue("templateVariableMappings", nextMappings, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, leadPathOptions, templateVariables]);

  const handleMappingSourceChange = useCallback(
    (variable: string, source: TemplateVariableMapping["source"]) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );
      const currentMapping = currentMappings[variable];

      if (source === "lead") {
        const templateVariable = templateVariables.find(
          (item) => item.key === variable,
        );
        const matchedOption = templateVariable
          ? findBestLeadPath(templateVariable, leadPathOptions)
          : null;

        setTemplateVariableMappings({
          ...currentMappings,
          [variable]: {
            source: "lead",
            path:
              currentMapping?.source === "lead"
                ? currentMapping.path
                : (matchedOption?.path ?? ""),
          },
        });

        return;
      }

      setTemplateVariableMappings({
        ...currentMappings,
        [variable]: {
          source: "static",
          value:
            currentMapping?.source === "static" ? currentMapping.value : "",
        },
      });
    },
    [form, leadPathOptions, setTemplateVariableMappings, templateVariables],
  );

  const handleMappingPathChange = useCallback(
    (variable: string, path: string) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );

      setTemplateVariableMappings({
        ...currentMappings,
        [variable]: {
          source: "lead",
          path,
        },
      });
    },
    [form, setTemplateVariableMappings],
  );

  const handleMappingStaticValueChange = useCallback(
    (variable: string, value: string) => {
      const currentMappings = normalizeMappingsForForm(
        form.getValues("templateVariableMappings"),
      );

      setTemplateVariableMappings({
        ...currentMappings,
        [variable]: {
          source: "static",
          value,
        },
      });
    },
    [form, setTemplateVariableMappings],
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
    handleMappingSourceChange,
    handleMappingPathChange,
    handleMappingStaticValueChange,
    unmappedVariables,
  };
}
