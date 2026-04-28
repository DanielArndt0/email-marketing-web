import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  Campaign,
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../../types";

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

export function useTemplateVariableMapping(params: {
  campaign: Campaign | null;
  templateVariables: string[];
  audienceFields: string[];
}) {
  const { campaign, templateVariables, audienceFields } = params;

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
        const existingMapping = currentMappings[variable];

        if (
          existingMapping?.source === "lead" &&
          audienceFields.includes(existingMapping.path)
        ) {
          nextMappings[variable] = existingMapping;
          return;
        }

        if (existingMapping?.source === "static") {
          nextMappings[variable] = existingMapping;
          return;
        }

        const exactMatch =
          audienceFields.find((field) => field === variable) ??
          audienceFields.find(
            (field) => field.toLowerCase() === variable.toLowerCase(),
          );

        if (exactMatch) {
          nextMappings[variable] = {
            source: "lead",
            path: exactMatch,
          };
        }
      });

      return nextMappings;
    });
  }, [audienceFields, templateVariables]);

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
      templateVariables.filter(
        (variable) => !isMappingValid(templateVariableMappings[variable]),
      ),
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
