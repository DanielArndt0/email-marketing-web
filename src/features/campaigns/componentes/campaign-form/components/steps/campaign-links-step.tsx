"use client";

import { ArrowRight, FileText, Mail, Sparkles, Users } from "lucide-react";

import type {
  CampaignStepProps,
  MappingSource,
} from "../../campaign-form.types";
import type { TemplateVariableMapping } from "../../../../types";

function getTemplateVariables(template: CampaignStepProps["selectedTemplate"]) {
  const variables = template?.variables ?? [];

  return variables
    .map((variable) => {
      if (typeof variable === "string") {
        return {
          key: variable,
          label: variable,
          required: false,
          description: "",
          example: "",
        };
      }

      return {
        key: variable.key,
        label: variable.label ?? variable.key,
        required: variable.required ?? false,
        description: variable.description ?? "",
        example: variable.example ?? "",
      };
    })
    .filter((variable) => variable.key);
}

function getMappingMode(mapping?: TemplateVariableMapping): MappingSource {
  return mapping?.source ?? "lead";
}

function getMappingPath(mapping?: TemplateVariableMapping) {
  if (mapping?.source === "lead") {
    return mapping.path;
  }

  return "";
}

function getMappingValue(mapping?: TemplateVariableMapping) {
  if (mapping?.source === "static") {
    return mapping.value;
  }

  return "";
}

function getMappingFallback(mapping?: TemplateVariableMapping) {
  if (mapping?.source === "lead") {
    return mapping.fallback ?? "";
  }

  return "";
}

export function CampaignLinksStep({
  form,
  templates,
  audiences,
  smtpSenders,
  selectedTemplate,
  selectedAudience,
  selectedSmtpSender,
  leadPathOptions,
  templateVariableMappings,
  onMappingSourceChange,
  onMappingPathChange,
  onMappingStaticValueChange,
  onMappingFallbackChange,
}: CampaignStepProps) {
  const templateVariables = getTemplateVariables(selectedTemplate);

  return (
    <div className="space-y-5">
      <section className="app-card-muted rounded-3xl p-5">
        <h2 className="app-heading text-lg font-semibold">
          Vínculos da campanha
        </h2>

        <p className="app-muted mt-1 text-sm">
          Escolha o template, a audience e o remetente SMTP usados na campanha.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <label className="app-heading text-sm font-medium">Template</label>

            <select
              value={form.watch("templateId")}
              onChange={(event) =>
                form.setValue("templateId", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="app-select-surface mt-2"
            >
              <option value="">Selecione um template</option>

              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="app-heading text-sm font-medium">Audience</label>

            <select
              value={form.watch("audienceId")}
              onChange={(event) =>
                form.setValue("audienceId", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="app-select-surface mt-2"
            >
              <option value="">Selecione uma audience</option>

              {audiences.map((audience) => (
                <option key={audience.id} value={audience.id}>
                  {audience.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="app-heading text-sm font-medium">
              Remetente SMTP
            </label>

            <select
              value={form.watch("smtpSenderId")}
              onChange={(event) =>
                form.setValue("smtpSenderId", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="app-select-surface mt-2"
            >
              <option value="">Selecione um remetente</option>

              {smtpSenders.map((sender) => (
                <option key={sender.id} value={sender.id}>
                  {sender.name} — {sender.fromName} &lt;{sender.fromEmail}&gt;
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="app-card-muted rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="app-soft mt-1 h-5 w-5" />

          <div>
            <h2 className="app-heading text-lg font-semibold">
              Mapeamento de variáveis
            </h2>

            <p className="app-muted mt-1 text-sm">
              Confira as variáveis do template e os paths disponíveis do lead.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="app-card-flat rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <FileText className="app-soft h-4 w-4" />

              <h3 className="app-heading font-semibold">Template</h3>
            </div>

            {selectedTemplate ? (
              <div className="mt-3">
                <p className="app-heading font-medium">
                  {selectedTemplate.name}
                </p>

                <p className="app-muted mt-1 line-clamp-2 text-sm">
                  {selectedTemplate.subject ?? "Sem assunto informado"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {templateVariables.length > 0 ? (
                    templateVariables.map((variable) => (
                      <span
                        key={variable.key}
                        className="app-badge app-badge-muted px-2 py-1 font-mono text-xs"
                      >
                        {"{{" + variable.key + "}}"}
                      </span>
                    ))
                  ) : (
                    <span className="app-muted text-sm">
                      Nenhuma variável declarada.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="app-muted mt-3 text-sm">
                Selecione um template para visualizar as variáveis.
              </p>
            )}
          </div>

          <div className="app-card-flat rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Users className="app-soft h-4 w-4" />

              <h3 className="app-heading font-semibold">Audience</h3>
            </div>

            {selectedAudience ? (
              <div className="mt-3">
                <p className="app-heading font-medium">
                  {selectedAudience.name}
                </p>

                <p className="app-muted mt-1 text-sm">
                  Origem: {selectedAudience.sourceType}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {leadPathOptions.length > 0 ? (
                    leadPathOptions.slice(0, 8).map((option) => (
                      <span
                        key={option.path}
                        className="app-badge app-badge-muted px-2 py-1 font-mono text-xs"
                      >
                        {option.label}
                      </span>
                    ))
                  ) : (
                    <span className="app-muted text-sm">
                      Nenhum path disponível.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="app-muted mt-3 text-sm">
                Selecione uma audience para visualizar os paths.
              </p>
            )}
          </div>

          <div className="app-card-flat rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Mail className="app-soft h-4 w-4" />

              <h3 className="app-heading font-semibold">Remetente</h3>
            </div>

            {selectedSmtpSender ? (
              <div className="mt-3">
                <p className="app-heading font-medium">
                  {selectedSmtpSender.name}
                </p>

                <p className="app-muted mt-1 text-sm">
                  {selectedSmtpSender.fromName}
                </p>

                <p className="app-muted mt-1 truncate text-sm">
                  {selectedSmtpSender.fromEmail}
                </p>
              </div>
            ) : (
              <p className="app-muted mt-3 text-sm">
                Selecione um remetente SMTP.
              </p>
            )}
          </div>
        </div>

        <div className="app-card-flat mt-5 rounded-2xl p-4">
          <h3 className="app-heading font-semibold">De/para das variáveis</h3>

          <p className="app-muted mt-1 text-sm">
            Relacione cada variável do template com um campo do lead ou com um
            valor fixo.
          </p>

          {templateVariables.length > 0 ? (
            <div className="mt-4 space-y-3">
              {templateVariables.map((variable) => {
                const mapping = templateVariableMappings[variable.key];
                const mappingMode = getMappingMode(mapping);

                return (
                  <div
                    key={variable.key}
                    className="app-card-muted grid gap-3 rounded-2xl p-4 lg:grid-cols-[220px_160px_40px_minmax(0,1fr)] lg:items-end"
                  >
                    <div>
                      <label className="app-soft text-xs font-semibold uppercase tracking-wide">
                        Variável
                      </label>

                      <div className="app-input-surface mt-2 flex h-10 items-center rounded-xl px-3 font-mono text-sm">
                        {"{{" + variable.key + "}}"}
                      </div>
                    </div>

                    <div>
                      <label className="app-soft text-xs font-semibold uppercase tracking-wide">
                        Origem
                      </label>

                      <select
                        value={mappingMode}
                        onChange={(event) =>
                          onMappingSourceChange(
                            variable.key,
                            event.target.value as MappingSource,
                          )
                        }
                        className="app-select-surface mt-2 h-10"
                      >
                        <option value="lead">Lead</option>
                        <option value="static">Valor fixo</option>
                      </select>
                    </div>

                    <div className="hidden justify-center pb-2 lg:flex">
                      <div className="app-icon-box flex h-8 w-8 items-center justify-center rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div>
                      <label className="app-soft text-xs font-semibold uppercase tracking-wide">
                        {mappingMode === "static"
                          ? "Valor fixo"
                          : "Path do lead e fallback"}
                      </label>

                      {mappingMode === "static" ? (
                        <input
                          value={getMappingValue(mapping)}
                          onChange={(event) =>
                            onMappingStaticValueChange(
                              variable.key,
                              event.target.value,
                            )
                          }
                          placeholder="Digite o valor fixo"
                          className="app-input-surface mt-2 h-10 w-full rounded-xl px-3 text-sm"
                        />
                      ) : (
                        <div className="mt-2 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                          <select
                            value={getMappingPath(mapping)}
                            onChange={(event) =>
                              onMappingPathChange(
                                variable.key,
                                event.target.value,
                              )
                            }
                            className="app-select-surface h-10 w-full rounded-xl px-3 text-sm"
                          >
                            <option value="">Selecione um path</option>

                            {leadPathOptions.map((option) => (
                              <option key={option.path} value={option.path}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <input
                            value={getMappingFallback(mapping)}
                            onChange={(event) =>
                              onMappingFallbackChange(
                                variable.key,
                                event.target.value,
                              )
                            }
                            placeholder="Fallback. Ex: cliente"
                            className="app-input-surface h-10 w-full rounded-xl px-3 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="app-empty-state mt-4 rounded-2xl p-6 text-center">
              <p className="app-heading text-sm font-semibold">
                Nenhuma variável para mapear
              </p>

              <p className="app-muted mt-1 text-sm">
                Selecione um template com variáveis declaradas para configurar o
                de/para.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
