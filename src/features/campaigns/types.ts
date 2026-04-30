import type { Audience } from "../audiences/types";
import type { EmailTemplate } from "../templates/types";

export type CampaignStatus =
  | "draft"
  | "ready"
  | "scheduled"
  | "running"
  | "paused"
  | "completed"
  | "canceled"
  | "failed";

export type LeadTemplateVariableMapping = {
  source: "lead";
  path: string;
  fallback?: string;
};

export type StaticTemplateVariableMapping = {
  source: "static";
  value: string;
};

export type TemplateVariableMapping =
  | LeadTemplateVariableMapping
  | StaticTemplateVariableMapping;

export type TemplateVariableMappings = Record<string, TemplateVariableMapping>;

export type CampaignSmtpSender = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyToEmail: string | null;
  isActive: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  goal: string | null;
  subject: string | null;
  status: CampaignStatus;

  templateId: string | null;
  audienceId: string | null;
  smtpSenderId: string | null;

  template?: EmailTemplate | null;
  audience?: Audience | null;
  smtpSender?: CampaignSmtpSender | null;

  scheduleAt: string | null;
  lastExecutionAt: string | null;

  createdAt?: string;
  updatedAt?: string;

  templateVariableMappings?: TemplateVariableMappings;
};

export type CreateCampaignInput = {
  name: string;
  goal?: string | null;
  subject?: string | null;
  status?: CampaignStatus;

  templateId?: string | null;
  audienceId?: string | null;
  smtpSenderId?: string | null;

  scheduleAt?: string | null;
  templateVariableMappings?: TemplateVariableMappings;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export type CampaignListResponse =
  | Campaign[]
  | {
      items?: Campaign[];
      data?: Campaign[];
      page?: number;
      pageSize?: number;
      total?: number;
      totalPages?: number;
    };

export type DispatchCampaignInput = {
  limit?: number;
};

export type DispatchCampaignResult = {
  campaignId?: string;
  status?: string;
  message?: string;
  createdCount?: number;
  queuedCount?: number;
  skippedCount?: number;
  failedCount?: number;
  [key: string]: unknown;
};

export type DispatchCampaignBatchInput = {
  campaignIds: string[];
  limitPerCampaign?: number;
};

export type DispatchCampaignBatchResult = {
  status?: string;
  message?: string;
  results?: DispatchCampaignResult[];
  items?: DispatchCampaignResult[];
  [key: string]: unknown;
};
