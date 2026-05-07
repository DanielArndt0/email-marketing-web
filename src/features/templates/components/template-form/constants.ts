import type { TemplateFormStep } from "./types";

export const TEMPLATE_FORM_LAST_STEP: TemplateFormStep = 2;

export const templateFormSteps = [
  {
    title: "Conteúdo",
    description: "Dados, HTML/texto e preview",
  },
  {
    title: "Imagens incorporadas",
    description: "Assets CID do template",
  },
  {
    title: "Anexos e revisão",
    description: "Arquivos comuns e conferência",
  },
] as const;
