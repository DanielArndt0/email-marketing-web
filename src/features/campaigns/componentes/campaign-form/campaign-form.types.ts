import type { UseFormReturn } from "react-hook-form";

import type { Audience } from "@/features/audiences/types";
import type { SmtpSender } from "@/features/smtp-senders/types";
import type { EmailTemplate } from "@/features/templates/types";

import type {
  Campaign,
  CampaignStatus,
  TemplateVariableMapping,
  TemplateVariableMappings,
} from "../../types";

export type WizardStep = 0 | 1 | 2;

export type CampaignFormProps = {
  campaign?: Campaign | null;
  onSaved: () => void;
  onCancel: () => void;
};

export type CampaignFormValues = {
  name: string;
  goal: string;
  subject: string;
  status: CampaignStatus;
  templateId: string;
  audienceId: string;
  smtpSenderId: string;
  scheduleAt: string;
  templateVariableMappings: TemplateVariableMappings;
};

export type MappingSource = "lead" | "static";

export type TemplateVariableDefinition = {
  key: string;
  label: string;
  required: boolean;
  description?: string;
  example?: string;
  declared?: boolean;
};

export type LeadPathOption = {
  path: string;
  label: string;
  description?: string;
  group?: string;
};

export type CampaignStepProps = {
  form: UseFormReturn<CampaignFormValues>;

  templates: EmailTemplate[];
  audiences: Audience[];
  smtpSenders: SmtpSender[];

  selectedTemplate: EmailTemplate | null;
  selectedAudience: Audience | null;
  selectedSmtpSender: SmtpSender | null;

  leadPathOptions: LeadPathOption[];

  templateVariableMappings: TemplateVariableMappings;

  onMappingSourceChange: (variable: string, source: MappingSource) => void;
  onMappingPathChange: (variable: string, path: string) => void;
  onMappingStaticValueChange: (variable: string, value: string) => void;
  onMappingFallbackChange: (variable: string, fallback: string) => void;
};

export type CampaignSummaryStepProps = {
  form: UseFormReturn<CampaignFormValues>;
  selectedTemplate: EmailTemplate | null;
  selectedAudience: Audience | null;
  selectedSmtpSender: SmtpSender | null;
  templateVariableMappings: TemplateVariableMappings;
};

export type VariableMappingEntry = {
  variable: TemplateVariableDefinition;
  mapping?: TemplateVariableMapping;
};
