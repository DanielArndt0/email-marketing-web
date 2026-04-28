import type { CampaignStatus } from "../../types";

export const CAMPAIGN_WIZARD_STEPS = [
  {
    title: "Dados",
    description: "Nome, objetivo e status",
  },
  {
    title: "Vínculos",
    description: "Template e audience",
  },
  {
    title: "Resumo",
    description: "Conferência final",
  },
] as const;

export const CAMPAIGN_STATUS_OPTIONS: Array<{
  value: CampaignStatus;
  label: string;
}> = [
  { value: "draft", label: "Rascunho" },
  { value: "ready", label: "Pronta" },
  { value: "scheduled", label: "Agendada" },
  { value: "running", label: "Em execução" },
  { value: "paused", label: "Pausada" },
  { value: "completed", label: "Concluída" },
  { value: "canceled", label: "Cancelada" },
  { value: "failed", label: "Falhou" },
];

export const DEFAULT_CNPJ_AUDIENCE_FIELDS = [
  "email",
  "nomeFantasia",
  "razaoSocial",
  "cnpj",
  "municipio",
  "uf",
  "codigoCnaePrincipal",
  "descricaoCnaePrincipal",
];
