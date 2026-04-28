import type { UseFormReturn } from "react-hook-form";

import type { Audience } from "@/features/audiences/types";
import type { EmailTemplate } from "@/features/templates/types";

import type { CampaignFormValues } from "../../schemas";
import type {
  Campaign,
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../types";

export type WizardStep = 0 | 1 | 2;

export type TemplateVariableDefinition = {
  key: string;
  label?: string;
  required?: boolean;
  description?: string;
  example?: string;
  declared?: boolean;
};

export type LeadPathOption = {
  path: string;
  label: string;
  group: "standard" | "metadata";
  description?: string;
};

export type CampaignFormProps = {
  campaign: Campaign | null;
  onCancel: () => void;
  onSaved: () => void;
};

export type CampaignStepProps = {
  form: UseFormReturn<CampaignFormValues>;
};

export type CampaignLinksStepProps = CampaignStepProps & {
  templates: EmailTemplate[];
  audiences: Audience[];
  selectedTemplate: EmailTemplate | null;
  selectedAudience: Audience | null;
  templateVariables: TemplateVariableDefinition[];
  leadPathOptions: LeadPathOption[];
  templateVariableMappings: TemplateVariableMappings;
  onMappingSourceChange: (
    variable: string,
    source: TemplateVariableMapping["source"],
  ) => void;
  onMappingPathChange: (variable: string, path: string) => void;
  onMappingStaticValueChange: (variable: string, value: string) => void;
};

export type CampaignSummaryStepProps = CampaignStepProps & {
  selectedTemplate: EmailTemplate | null;
  selectedAudience: Audience | null;
  templateVariableMappings: TemplateVariableMappings;
};
