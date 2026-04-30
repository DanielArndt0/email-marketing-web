"use client";

import { ArrowRight, FileText, Mail, Sparkles, Users } from "lucide-react";

import type { SmtpSender } from "@/features/smtp-senders/types";
import type { CampaignStepProps } from "../../campaign-form.types";
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

function getMappingMode(mapping?: TemplateVariableMapping) {
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

export function CampaignLinksStep({
  form,
  templates,
  audiences,
  smtpSenders,
  selectedTemplate,
  selectedAudience,
  selectedSmtpSender,
  audienceFields,
  templateVariableMappings,
  onMappingSourceChange,
  onMappingPathChange,
  onMappingStaticValueChange,
}: CampaignStepProps) {
  const templateVariables = getTemplateVariables(selectedTemplate);

  return (
    <div className="space-y-5">
      <section className="app-card-muted rounded-3xl p-5">
        <h2 className="text-lg font-semibold app-heading">
          Vínculos da campanha
        </h2>

        <p className="mt-1 text-sm app-muted">
          Escolha o template, a audience e o remetente SMTP usados na campanha.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium app-heading">Template</label>

            <select
              value={form.watch("templateId")}
              onChange={(event) =>
                form.setValue("templateId", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="app-select-surface mt-2 h-11 w-full rounded-xl px-3 text-sm"
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
            <label className="text-sm font-medium app-heading">Audience</label>

            <select
              value={form.watch("audienceId")}
              onChange={(event) =>
                form.setValue("audienceId", event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="app-select-surface mt-2 h-11 w-full rounded-xl px-3 text-sm"
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
            <label className="text-sm font-medium app-heading">
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
              className="app-select-surface mt-2 h-11 w-full rounded-xl px-3 text-sm"
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
          <Sparkles className="mt-1 h-5 w-5 app-soft" />

          <div>
            <h2 className="text-lg font-semibold app-heading">
              Mapeamento de variáveis
            </h2>

            <p className="mt-1 text-sm app-muted">
              Confira as variáveis do template e os paths disponíveis do lead.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="app-card-flat rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 app-soft" />

              <h3 className="font-semibold app-heading">Template</h3>
            </div>

            {selectedTemplate ? (
              <div className="mt-3">
                <p className="font-medium app-heading">
                  {selectedTemplate.name}
                </p>

                <p className="mt-1 line-clamp-2 text-sm app-muted">
                  {selectedTemplate.subject ?? "Sem assunto informado"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {templateVariables.length > 0 ? (
                    templateVariables.map((variable) => (
                      <span
                        key={variable.key}
                        className="rounded-full border px-2 py-1 font-mono text-xs app-card-muted"
                      >
                        {"{{" + variable.key + "}}"}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm app-muted">
                      Nenhuma variável declarada.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm app-muted">
                Selecione um template para visualizar as variáveis.
              </p>
            )}
          </div>

          <div className="app-card-flat rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 app-soft" />

              <h3 className="font-semibold app-heading">Audience</h3>
            </div>

            {selectedAudience ? (
              <div className="mt-3">
                <p className="font-medium app-heading">
                  {selectedAudience.name}
                </p>

                <p className="mt-1 text-sm app-muted">
                  Origem: {selectedAudience.sourceType}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {audienceFields.length > 0 ? (
                    audienceFields.slice(0, 8).map((field) => (
                      <span
                        key={field}
                        className="rounded-full border px-2 py-1 font-mono text-xs app-card-muted"
                      >
                        {field}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm app-muted">
                      Nenhum path disponível.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm app-muted">
                Selecione uma audience para visualizar os paths.
              </p>
            )}
          </div>

          <div className="app-card-flat rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 app-soft" />

              <h3 className="font-semibold app-heading">Remetente</h3>
            </div>

            {selectedSmtpSender ? (
              <div className="mt-3">
                <p className="font-medium app-heading">
                  {selectedSmtpSender.name}
                </p>

                <p className="mt-1 text-sm app-muted">
                  {selectedSmtpSender.fromName}
                </p>

                <p className="mt-1 break-all text-sm app-muted">
                  {selectedSmtpSender.fromEmail}
                </p>

                {selectedSmtpSender.replyToEmail ? (
                  <p className="mt-1 break-all text-xs app-soft">
                    Reply-to: {selectedSmtpSender.replyToEmail}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm app-muted">
                Selecione um remetente SMTP para esta campanha.
              </p>
            )}
          </div>
        </div>

        {templateVariables.length > 0 ? (
          <div className="mt-5 app-card-flat rounded-2xl p-4">
            <h3 className="font-semibold app-heading">De/para das variáveis</h3>

            <p className="mt-1 text-sm app-muted">
              Relacione cada variável do template com um campo do lead ou com um
              valor fixo.
            </p>

            <div className="mt-4 space-y-3">
              {templateVariables.map((variable) => {
                const mapping = templateVariableMappings[variable.key];
                const mode = getMappingMode(mapping);

                return (
                  <div
                    key={variable.key}
                    className="grid gap-3 rounded-2xl border p-4 app-card-muted lg:grid-cols-[220px_120px_48px_minmax(0,1fr)] lg:items-end"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide app-soft">
                        Variável
                      </p>

                      <div className="app-card-flat mt-2 rounded-xl px-3 py-2 font-mono text-sm">
                        {"{{" + variable.key + "}}"}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide app-soft">
                        Origem
                      </p>

                      <select
                        value={mode}
                        onChange={(event) =>
                          onMappingSourceChange(
                            variable.key,
                            event.target.value as "lead" | "static",
                          )
                        }
                        className="app-select-surface mt-2 h-10 w-full rounded-xl px-3 text-sm"
                      >
                        <option value="lead">Lead</option>
                        <option value="static">Valor fixo</option>
                      </select>
                    </div>

                    <div className="hidden justify-center pb-2 lg:flex">
                      <div className="grid h-9 w-9 place-items-center rounded-full border app-card-flat">
                        <ArrowRight className="h-4 w-4 --app-bg" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide app-soft">
                        {mode === "lead" ? "Path do lead" : "Valor fixo"}
                      </p>

                      {mode === "lead" ? (
                        <select
                          value={getMappingPath(mapping)}
                          onChange={(event) =>
                            onMappingPathChange(
                              variable.key,
                              event.target.value,
                            )
                          }
                          className="app-select-surface mt-2 h-10 w-full rounded-xl px-3 text-sm"
                        >
                          <option value="">Selecione um path</option>

                          {audienceFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      ) : (
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
