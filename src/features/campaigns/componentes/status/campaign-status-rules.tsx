import type { Campaign, CampaignStatus } from "../../types";

export type CampaignAction =
  | "send_now"
  | "schedule_campaign"
  | "pause_campaign"
  | "resume_campaign"
  | "retry_campaign"
  | "cancel_campaign"
  | "view_report";

export type CampaignReadinessRequirement = {
  key: "hasTemplate" | "hasAudience" | "hasSmtpSender" | "hasActiveSmtpSender";
  label: string;
  passed: boolean;
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  ready: "Pronta",
  scheduled: "Agendada",
  running: "Em envio",
  paused: "Pausada",
  failed: "Com falha",
  completed: "Finalizada",
  canceled: "Cancelada",
};

export const campaignActionLabels: Record<CampaignAction, string> = {
  send_now: "Enviar agora",
  schedule_campaign: "Agendar envio",
  pause_campaign: "Pausar campanha",
  resume_campaign: "Retomar campanha",
  retry_campaign: "Tentar novamente",
  cancel_campaign: "Cancelar campanha",
  view_report: "Ver relatório",
};

export const campaignActionsByStatus: Record<CampaignStatus, CampaignAction[]> =
  {
    draft: ["cancel_campaign"],
    ready: ["send_now", "schedule_campaign", "cancel_campaign"],
    scheduled: ["send_now", "pause_campaign", "cancel_campaign"],
    running: ["pause_campaign", "cancel_campaign"],
    paused: ["resume_campaign", "cancel_campaign"],
    failed: ["retry_campaign", "cancel_campaign"],
    completed: ["view_report"],
    canceled: [],
  };

export function getCampaignReadinessRequirements(
  campaign: Campaign,
): CampaignReadinessRequirement[] {
  return [
    {
      key: "hasTemplate",
      label: "Template selecionado",
      passed: Boolean(campaign.templateId),
    },
    {
      key: "hasAudience",
      label: "Audiência selecionada",
      passed: Boolean(campaign.audienceId),
    },
    {
      key: "hasSmtpSender",
      label: "Remetente SMTP selecionado",
      passed: Boolean(campaign.smtpSenderId),
    },
    {
      key: "hasActiveSmtpSender",
      label: "Remetente SMTP ativo",
      passed: Boolean(campaign.smtpSender?.isActive),
    },
  ];
}

export function isCampaignReadyForDispatch(campaign: Campaign) {
  return getCampaignReadinessRequirements(campaign).every(
    (requirement) => requirement.passed,
  );
}

export function actionRequiresReadiness(action: CampaignAction) {
  return (
    action === "send_now" ||
    action === "schedule_campaign" ||
    action === "retry_campaign"
  );
}

export function isSystemStatus(status: CampaignStatus) {
  return status === "running" || status === "completed" || status === "failed";
}
