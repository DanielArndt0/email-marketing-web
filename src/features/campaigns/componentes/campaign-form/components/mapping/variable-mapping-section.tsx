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
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <h4 className="font-semibold text-slate-950">De/para das variáveis</h4>

        <p className="mt-1 text-sm text-slate-500">
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
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 xl:grid-cols-[260px_48px_190px_minmax(0,1fr)]"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Variável
                </p>

                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm font-semibold text-slate-950">
                  {"{{" + variable.key + "}}"}
                  {variable.required ? (
                    <span className="ml-1 text-red-500">*</span>
                  ) : null}
                </div>

                {variable.description ? (
                  <p className="text-xs leading-5 text-slate-500">
                    {variable.description}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-center xl:pt-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <ArrowDown className="h-4 w-4 text-slate-400 xl:hidden" />
                  <ArrowRight className="hidden h-4 w-4 text-slate-400 xl:block" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="lead">Lead</option>
                  <option value="static">Valor fixo</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {mapping.source === "lead" ? "Path do lead" : "Valor fixo"}
                </p>

                {mapping.source === "lead" ? (
                  <select
                    value={mapping.path}
                    onChange={(event) =>
                      onMappingPathChange(variable.key, event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
