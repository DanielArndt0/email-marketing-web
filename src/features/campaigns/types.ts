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

export type Campaign = {
  id: string;
  name: string;
  goal: string | null;
  subject: string | null;
  status: CampaignStatus;
  templateId: string | null;
  audienceId: string | null;
  template?: EmailTemplate | null;
  audience?: Audience | null;
  scheduleAt: string | null;
  lastExecutionAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCampaignInput = {
  name: string;
  goal?: string | null;
  subject?: string | null;
  status?: CampaignStatus;
  templateId?: string | null;
  audienceId?: string | null;
  scheduleAt?: string | null;
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
