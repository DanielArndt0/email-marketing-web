import type { Campaign, CampaignStatus } from "../../../types";
import type { CampaignFormValues } from "../campaign-form.types";

export function toOptionalString(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value;
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export function formatSchedulePreview(value?: string | null) {
  if (!value) {
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

export function getStatusLabel(status: CampaignStatus) {
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

export function getDefaultValues(
  campaign?: Campaign | null,
): CampaignFormValues {
  return {
    name: campaign?.name ?? "",
    goal: campaign?.goal ?? "",
    subject: campaign?.subject ?? "",
    status: campaign?.status ?? "draft",
    templateId: campaign?.templateId ?? "",
    audienceId: campaign?.audienceId ?? "",
    smtpSenderId: campaign?.smtpSenderId ?? "",
    scheduleAt: formatDateTimeLocal(campaign?.scheduleAt),
    templateVariableMappings: campaign?.templateVariableMappings ?? {},
  };
}
