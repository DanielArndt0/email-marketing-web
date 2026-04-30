import { ArrowDown, ArrowRight } from "lucide-react";

import type {
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../../../types";
import type {
  LeadPathOption,
  TemplateVariableDefinition,
} from "../../campaign-form.types";

export function VariableMappingSection({
  templateVariables,
  leadPathOptions,
  templateVariableMappings,
  onMappingSourceChange,
  onMappingPathChange,
  onMappingStaticValueChange,
}: {
  templateVariables: TemplateVariableDefinition[];
  leadPathOptions: LeadPathOption[];
  templateVariableMappings: TemplateVariableMappings;
  onMappingSourceChange: (
    variable: string,
    source: TemplateVariableMapping["source"],
  ) => void;
  onMappingPathChange: (variable: string, path: string) => void;
  onMappingStaticValueChange: (variable: string, value: string) => void;
}) {
  if (templateVariables.length === 0) {
    return null;
  }

  return (
    <div className="app-card-flat mt-5 rounded-2xl p-4">
      <div>
        <h4 className="app-heading font-semibold">De/para das variáveis</h4>

        <p className="app-muted mt-1 text-sm">
          Relacione cada variável do template com um path do lead ou com um
          valor fixo da campanha.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {templateVariables.map((variable) => {
          const mapping = templateVariableMappings[variable.key] ?? {
            source: "lead",
            path: "",
          };

          return (
            <div
              key={variable.key}
              className="app-card-muted grid grid-cols-1 gap-3 rounded-xl p-4 xl:grid-cols-[260px_48px_190px_minmax(0,1fr)]"
            >
              <div className="space-y-2">
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Variável
                </p>

                <div className="app-card-flat flex h-11 items-center rounded-xl px-3 font-mono text-sm font-semibold">
                  {"{{" + variable.key + "}}"}
                  {variable.required ? (
                    <span className="ml-1 text-red-500">*</span>
                  ) : null}
                </div>

                {variable.description ? (
                  <p className="app-muted text-xs leading-5">
                    {variable.description}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-center xl:pt-7">
                <div className="app-card-flat flex h-10 w-10 items-center justify-center rounded-full">
                  <ArrowDown className="app-soft h-4 w-4 xl:hidden" />
                  <ArrowRight className="app-soft hidden h-4 w-4 xl:block" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  Origem
                </p>

                <select
                  value={mapping.source}
                  onChange={(event) =>
                    onMappingSourceChange(
                      variable.key,
                      event.target.value as TemplateVariableMapping["source"],
                    )
                  }
                  className="app-input h-11 w-full rounded-xl px-3 text-sm"
                >
                  <option value="lead">Lead</option>
                  <option value="static">Valor fixo</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="app-soft text-xs font-semibold uppercase tracking-wide">
                  {mapping.source === "lead" ? "Path do lead" : "Valor fixo"}
                </p>

                {mapping.source === "lead" ? (
                  <select
                    value={mapping.path}
                    onChange={(event) =>
                      onMappingPathChange(variable.key, event.target.value)
                    }
                    className="app-input h-11 w-full rounded-xl px-3 text-sm"
                  >
                    <option value="">Selecione um path</option>

                    {leadPathOptions.map((option) => (
                      <option key={option.path} value={option.path}>
                        {option.label} — {option.path}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={mapping.value}
                    onChange={(event) =>
                      onMappingStaticValueChange(
                        variable.key,
                        event.target.value,
                      )
                    }
                    placeholder={
                      variable.example
                        ? `Ex: ${variable.example}`
                        : "Digite um valor fixo"
                    }
                    className="app-input h-11 w-full rounded-xl px-3 text-sm"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
