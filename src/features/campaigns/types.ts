export type CampaignStatus =
  | "draft"
  | "ready"
  | "running"
  | "paused"
  | "completed"
  | "error";

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  templateId?: string;
  audienceId?: string;
  createdAt?: string;
  updatedAt?: string;
};
