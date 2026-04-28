import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  Campaign,
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../../types";
import type {
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

export function useTemplateVariableMapping(params: {
  campaign: Campaign | null;
  templateVariables: TemplateVariableDefinition[];
  leadPathOptions: LeadPathOption[];
}) {
  const { campaign, templateVariables, leadPathOptions } = params;

  const [templateVariableMappings, setTemplateVariableMappings] =
    useState<TemplateVariableMappings>({});

  useEffect(() => {
    setTemplateVariableMappings(
      normalizeMappingsForForm(campaign?.templateVariableMappings),
    );
  }, [campaign?.templateVariableMappings]);

  useEffect(() => {
    setTemplateVariableMappings((currentMappings) => {
      const nextMappings: TemplateVariableMappings = {};

      templateVariables.forEach((variable) => {
        const existingMapping = currentMappings[variable.key];

        if (
          existingMapping?.source === "lead" &&
          leadPathOptions.some((option) => option.path === existingMapping.path)
        ) {
          nextMappings[variable.key] = existingMapping;
          return;
        }

        if (existingMapping?.source === "static") {
          nextMappings[variable.key] = existingMapping;
          return;
        }

        const matchedOption = findBestLeadPath(variable, leadPathOptions);

        if (matchedOption) {
          nextMappings[variable.key] = {
            source: "lead",
            path: matchedOption.path,
          };
        }
      });

      return nextMappings;
    });
  }, [leadPathOptions, templateVariables]);

  const handleMappingSourceChange = useCallback(
    (variable: string, source: TemplateVariableMapping["source"]) => {
      setTemplateVariableMappings((currentMappings) => {
        const currentMapping = currentMappings[variable];

        if (source === "lead") {
          const currentPath =
            currentMapping?.source === "lead" ? currentMapping.path : "";

          return {
            ...currentMappings,
            [variable]: {
              source: "lead",
              path: currentPath,
            },
          };
        }

        const currentValue =
          currentMapping?.source === "static" ? currentMapping.value : "";

        return {
          ...currentMappings,
          [variable]: {
            source: "static",
            value: currentValue,
          },
        };
      });
    },
    [],
  );

  const handleMappingPathChange = useCallback(
    (variable: string, path: string) => {
      setTemplateVariableMappings((currentMappings) => ({
        ...currentMappings,
        [variable]: {
          source: "lead",
          path,
        },
      }));
    },
    [],
  );

  const handleMappingStaticValueChange = useCallback(
    (variable: string, value: string) => {
      setTemplateVariableMappings((currentMappings) => ({
        ...currentMappings,
        [variable]: {
          source: "static",
          value,
        },
      }));
    },
    [],
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
