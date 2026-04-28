"use client";

import type { ElementType } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Layers3,
  PlayCircle,
  RefreshCcw,
  Send,
  Target,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
  Campaign,
  CampaignStatus,
  TemplateVariableMapping,
} from "../types";

type CampaignPreviewProps = {
  campaign: Campaign;
  onClose: () => void;
  onEdit?: (campaign: Campaign) => void;
  onDispatch?: (campaign: Campaign) => void;
  isDispatching?: boolean;
};

function getStatusLabel(status: CampaignStatus) {
  const labels: Record<CampaignStatus, string> = {
    draft: "Rascunho",
    ready: "Pronta",
    scheduled: "Agendada",
    running: "Em execução",
    paused: "Pausada",
    completed: "Concluída",
    canceled: "Cancelada",
    failed: "Falhou",
  };

  return labels[status] ?? status;
}

function getStatusClassName(status: CampaignStatus) {
  const classes: Record<CampaignStatus, string> = {
    draft: "border-slate-200 bg-slate-50 text-slate-600",
    ready: "border-blue-200 bg-blue-50 text-blue-700",
    scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
    running: "border-amber-200 bg-amber-50 text-amber-700",
    paused: "border-zinc-200 bg-zinc-50 text-zinc-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    canceled: "border-rose-200 bg-rose-50 text-rose-700",
    failed: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[status] ?? classes.draft;
}

function getStatusIcon(status: CampaignStatus) {
  if (status === "completed") {
    return CheckCircle2;
  }

  if (status === "failed" || status === "canceled") {
    return XCircle;
  }

  if (status === "running") {
    return RefreshCcw;
  }

  return Clock;
}

function getStatusDescription(status: CampaignStatus) {
  const descriptions: Record<CampaignStatus, string> = {
    draft:
      "A campanha ainda está em rascunho e pode ser ajustada antes da execução.",
    ready:
      "A campanha está pronta para iniciar a criação e enfileiramento dos dispatches.",
    scheduled: "A campanha possui uma data programada para execução futura.",
    running: "Os dispatches foram criados ou estão sendo processados.",
    paused:
      "A campanha está pausada. Os envios não devem continuar até uma retomada.",
    completed:
      "A campanha foi concluída. Consulte os dispatches para acompanhar o histórico.",
    canceled: "A campanha foi cancelada e não deve seguir para execução.",
    failed:
      "A campanha falhou durante a preparação ou execução dos dispatches.",
  };

  return descriptions[status] ?? "Status operacional da campanha.";
}

function getNextActionLabel(status: CampaignStatus) {
  const actions: Record<CampaignStatus, string> = {
    draft: "Revisar dados e iniciar envios",
    ready: "Iniciar envios",
    scheduled: "Aguardar agendamento ou revisar data",
    running: "Acompanhar dispatches",
    paused: "Retomar ou revisar campanha",
    completed: "Ver histórico de dispatches",
    canceled: "Campanha encerrada",
    failed: "Revisar erro e tentar novamente",
  };

  return actions[status] ?? "Revisar campanha";
}

function canDispatch(status: CampaignStatus) {
  return status === "draft" || status === "ready" || status === "scheduled";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getTemplateName(campaign: Campaign) {
  return campaign.template?.name ?? campaign.templateId ?? "Sem template";
}

function getAudienceName(campaign: Campaign) {
  return campaign.audience?.name ?? campaign.audienceId ?? "Sem audience";
}

function getMappingSourceLabel(mapping: TemplateVariableMapping) {
  return mapping.source === "lead" ? "Lead" : "Valor fixo";
}

function getMappingSourceClassName(mapping: TemplateVariableMapping) {
  return mapping.source === "lead"
    ? "border-blue-200 bg-blue-50 text-blue-700"
    : "border-violet-200 bg-violet-50 text-violet-700";
}

function getMappingDisplayValue(mapping: TemplateVariableMapping) {
  if (mapping.source === "lead") {
    return mapping.path || "Path não informado";
  }

  return mapping.value || "Valor não informado";
}

function getMappingDescription(mapping: TemplateVariableMapping) {
  if (mapping.source === "lead") {
    return "Valor obtido a partir do lead resolvido pela audience.";
  }

  return "Valor fixo usado para todos os leads desta campanha.";
}

function InfoCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: ElementType;
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="flex h-full min-h-[138px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <p className="mt-3 line-clamp-3 text-base font-semibold leading-6 text-slate-950">
        {value}
      </p>

      {description ? (
        <p className="mt-auto pt-3 text-xs leading-5 text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="max-w-[220px] truncate text-right text-sm font-medium text-slate-950">
        {value}
      </span>
    </div>
  );
}

export function CampaignPreview({
  campaign,
  onClose,
  onEdit,
  onDispatch,
  isDispatching = false,
}: CampaignPreviewProps) {
  const mappings = Object.entries(campaign.templateVariableMappings ?? {});
  const showDispatchButton =
    Boolean(onDispatch) && canDispatch(campaign.status);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-6">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Preview
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-950">
              {campaign.name}
            </h2>

            <Badge className={getStatusClassName(campaign.status)}>
              {getStatusLabel(campaign.status)}
            </Badge>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Conferência operacional da campanha, vínculos, mapeamento de
            variáveis e estado atual de execução.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {showDispatchButton ? (
            <Button
              type="button"
              onClick={() => onDispatch?.(campaign)}
              disabled={isDispatching}
            >
              <Send className="h-4 w-4" />
              {isDispatching ? "Iniciando..." : "Iniciar envios"}
            </Button>
          ) : null}

          {onEdit ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(campaign)}
            >
              Editar
            </Button>
          ) : null}

          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>
      </header>

      <div className="mt-6 space-y-5">
        <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:auto-rows-fr xl:grid-cols-[1.6fr_1.05fr_1.05fr_1.05fr_1.6fr]">
          <InfoCard
            icon={Target}
            label="Objetivo"
            value={campaign.goal || "Sem objetivo informado"}
            description="Objetivo interno da campanha."
          />

          <InfoCard
            icon={FileText}
            label="Template"
            value={getTemplateName(campaign)}
            description="Conteúdo vinculado."
          />

          <InfoCard
            icon={Users}
            label="Audience"
            value={getAudienceName(campaign)}
            description="Público vinculado."
          />

          <InfoCard
            icon={CalendarClock}
            label="Agendamento"
            value={formatDateTime(campaign.scheduleAt)}
            description="Data programada."
          />

          <section className="flex h-full min-h-[138px] flex-col rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-slate-400" />

              <h3 className="font-semibold text-slate-950">Próxima ação</h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {getNextActionLabel(campaign.status)}
            </p>

            {showDispatchButton ? (
              <Button
                type="button"
                className="mt-auto w-full"
                onClick={() => onDispatch?.(campaign)}
                disabled={isDispatching}
              >
                <Send className="h-4 w-4" />
                {isDispatching ? "Iniciando..." : "Iniciar envios"}
              </Button>
            ) : null}
          </section>
        </div>

        <div className="grid items-stretch gap-5 xl:auto-rows-fr xl:grid-cols-[290px_minmax(0,1fr)_290px]">
          <section className="flex h-full min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-slate-400" />

              <h3 className="font-semibold text-slate-950">
                Dados da campanha
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              <DetailRow
                label="Assunto"
                value={campaign.subject || "Sem assunto"}
              />

              <DetailRow
                label="Última execução"
                value={formatDateTime(campaign.lastExecutionAt)}
              />

              <DetailRow
                label="Criada em"
                value={formatDateTime(campaign.createdAt)}
              />

              <DetailRow
                label="Atualizada em"
                value={formatDateTime(campaign.updatedAt)}
              />
            </div>
          </section>

          <section className="flex h-full min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Mapeamento de variáveis
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  De onde vem o valor de cada variável declarada no template.
                </p>
              </div>

              <Badge className="w-fit border-slate-200 bg-white text-slate-600">
                {mappings.length}{" "}
                {mappings.length === 1 ? "variável" : "variáveis"}
              </Badge>
            </div>

            {mappings.length > 0 ? (
              <div className="mt-5 max-h-[170px] space-y-3 overflow-y-auto pr-1">
                {mappings.map(([variable, mapping]) => (
                  <div
                    key={variable}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_120px_minmax(0,1.2fr)] lg:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Variável
                      </p>

                      <p className="mt-1 font-mono text-sm font-semibold text-slate-950">
                        {"{{" + variable + "}}"}
                      </p>
                    </div>

                    <Badge className={getMappingSourceClassName(mapping)}>
                      {getMappingSourceLabel(mapping)}
                    </Badge>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">
                        {getMappingDisplayValue(mapping)}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {getMappingDescription(mapping)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-[140px] flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Nenhum mapeamento configurado.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Esta campanha não possui variáveis vinculadas a lead ou
                    valor fixo.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="flex h-full min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-400" />

              <h3 className="font-semibold text-slate-950">Resumo técnico</h3>
            </div>

            <div className="mt-5 space-y-3">
              <DetailRow label="Campaign ID" value={campaign.id} />

              <DetailRow
                label="Template ID"
                value={campaign.templateId ?? "Não informado"}
              />

              <DetailRow
                label="Audience ID"
                value={campaign.audienceId ?? "Não informado"}
              />

              <DetailRow label="Status" value={campaign.status} />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
