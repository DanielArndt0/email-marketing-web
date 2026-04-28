import {
  toDateTimeLocalValue,
  type CampaignFormValues,
} from "../../../schemas";
import type { Campaign, CampaignStatus } from "../../../types";

export function getDefaultValues(
  campaign: Campaign | null,
): CampaignFormValues {
  return {
    name: campaign?.name ?? "",
    goal: campaign?.goal ?? "",
    subject: campaign?.subject ?? "",
    status: campaign?.status ?? "draft",
    templateId: campaign?.templateId ?? "",
    audienceId: campaign?.audienceId ?? "",
    scheduleAt: toDateTimeLocalValue(campaign?.scheduleAt),
  };
}

export function toOptionalString(value?: string | null) {
  const normalized = value?.trim();

  return normalized || undefined;
}

export function getStatusLabel(status?: CampaignStatus) {
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

  return status ? labels[status] : "Rascunho";
}

export function formatSchedulePreview(value?: string | null) {
  if (!value?.trim()) {
    return "Sem agendamento";
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
