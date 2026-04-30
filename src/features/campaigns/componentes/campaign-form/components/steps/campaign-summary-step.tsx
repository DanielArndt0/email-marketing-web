import { CalendarClock, FileText, Mail, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { CampaignSummaryStepProps } from "../../campaign-form.types";
import {
  formatSchedulePreview,
  getStatusLabel,
} from "../../utils/form-default-values";
import type { TemplateVariableMapping } from "../../../../types";

function getMappingSourceLabel(mapping: TemplateVariableMapping) {
  if (mapping.source === "lead") {
    return "Lead";
  }

  return "Valor fixo";
}

function getMappingDisplayValue(mapping: TemplateVariableMapping) {
  if (mapping.source === "lead") {
    return mapping.path || "Campo não informado";
  }

  return mapping.value || "Valor não informado";
}

export function CampaignSummaryStep({
  form,
  selectedTemplate,
  selectedAudience,
  selectedSmtpSender,
  templateVariableMappings,
}: CampaignSummaryStepProps) {
  const watchedName = form.watch("name");
  const watchedGoal = form.watch("goal");
  const watchedSubject = form.watch("subject");
  const watchedStatus = form.watch("status");
  const watchedScheduleAt = form.watch("scheduleAt");

  const mappings = Object.entries(templateVariableMappings);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            Conferência final
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Revise os principais dados antes de salvar a campanha.
          </p>
        </div>

        <Badge className="w-fit bg-slate-50 text-slate-600">
          {getStatusLabel(watchedStatus)}
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Campanha
            </p>

            <h4 className="mt-2 text-lg font-semibold text-slate-950">
              {watchedName?.trim() || "Nome não informado"}
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {watchedGoal?.trim() || "Sem objetivo informado."}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Assunto
                </p>

                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">
                  {watchedSubject?.trim() || "Sem assunto informado"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Agendamento
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  <span>{formatSchedulePreview(watchedScheduleAt)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Vínculos
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />

                  <p className="text-sm font-semibold text-slate-950">
                    Template
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  {selectedTemplate?.name || "Não selecionado"}
                </p>

                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                  {selectedTemplate?.subject || "Sem assunto informado"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />

                  <p className="text-sm font-semibold text-slate-950">
                    Audience
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  {selectedAudience?.name || "Não selecionada"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedAudience
                    ? `Origem: ${selectedAudience.sourceType}`
                    : "Sem origem"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />

                  <p className="text-sm font-semibold text-slate-950">
                    Remetente
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  {selectedSmtpSender?.name || "Não selecionado"}
                </p>

                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                  {selectedSmtpSender
                    ? `${selectedSmtpSender.fromName} <${selectedSmtpSender.fromEmail}>`
                    : "Sem remetente SMTP"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200  bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Mapeamento
              </p>

              {mappings.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {mappings.map(([variable, mapping]) => (
                    <div
                      key={variable}
                      className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)] md:items-center"
                    >
                      <span className="font-mono font-medium text-slate-900">
                        {"{{" + variable + "}}"}
                      </span>

                      <Badge className="w-fit bg-slate-50 text-slate-600">
                        {getMappingSourceLabel(mapping)}
                      </Badge>

                      <span className="truncate font-medium text-slate-700">
                        {getMappingDisplayValue(mapping)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  Nenhum mapeamento configurado.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
